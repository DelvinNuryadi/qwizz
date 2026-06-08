import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const BUCKET_NAME = "quiz-images";

export async function ensureBucket() {
  const { data: buckets } = await supabaseAdmin.storage.listBuckets();
  if (!buckets?.some((b) => b.name === BUCKET_NAME)) {
    await supabaseAdmin.storage.createBucket(BUCKET_NAME, {
      public: true,
    });
  }
}

export async function uploadImage(
  file: File,
  quizId: string,
): Promise<string> {
  await ensureBucket();

  const ext = file.name.split(".").pop() ?? "png";
  const fileName = `${quizId}/${crypto.randomUUID()}.${ext}`;

  const { error } = await supabaseAdmin.storage
    .from(BUCKET_NAME)
    .upload(fileName, file, {
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    throw new Error(`Failed to upload image: ${error.message}`);
  }

  const { data: publicUrl } = supabaseAdmin.storage
    .from(BUCKET_NAME)
    .getPublicUrl(fileName);

  return publicUrl.publicUrl;
}

export async function deleteImage(url: string) {
  const bucketPath = url.split(`${BUCKET_NAME}/`)[1];
  if (!bucketPath) return;

  await supabaseAdmin.storage.from(BUCKET_NAME).remove([bucketPath]);
}
