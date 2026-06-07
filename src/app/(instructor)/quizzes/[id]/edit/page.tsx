import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getQuizById } from "@/models/quiz";
import QuizForm from "@/components/instructor/QuizForm";

interface EditQuizPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditQuizPage({ params }: EditQuizPageProps) {
  const { id } = await params;
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return null;
  }

  const quizData = await getQuizById(id);

  if (!quizData) {
    notFound();
  }

  if (quizData.createdBy !== session.user.id) {
    notFound();
  }

  return (
    <div>
      <QuizForm initialData={quizData} />
    </div>
  );
}
