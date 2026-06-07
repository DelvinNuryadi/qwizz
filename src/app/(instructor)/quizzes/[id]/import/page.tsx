import { notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getQuizById } from "@/models/quiz";
import { ImportForm } from "./import-form";

interface ImportPageProps {
  params: Promise<{ id: string }>;
}

export default async function ImportPage({ params }: ImportPageProps) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;

  const quizData = await getQuizById(id);
  if (!quizData) notFound();

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href={`/quizzes/${id}`}
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        &larr; Back to quiz
      </Link>
      <h1 className="mb-1 mt-1 text-3xl font-bold">Import Questions</h1>
      <p className="mb-8 text-muted-foreground">
        Upload a CSV file to bulk-import questions into &ldquo;{quizData.title}&rdquo;
      </p>

      <div className="mb-8 rounded-lg border bg-muted/30 p-4 text-sm">
        <h2 className="mb-2 font-medium">CSV Format</h2>
        <p className="mb-2 text-muted-foreground">
          Your CSV must have a header row with these columns:
        </p>
        <code className="block rounded bg-muted px-3 py-2 font-mono text-xs leading-relaxed">
          Question,Points,Answer1,Answer2,Answer3,Answer4,Answer5,CorrectIndex
        </code>
        <ul className="mt-2 list-inside list-disc space-y-1 text-muted-foreground">
          <li><strong className="text-foreground">Question</strong> — question text (required)</li>
          <li><strong className="text-foreground">Points</strong> — points for the question (default 1)</li>
          <li><strong className="text-foreground">Answer1-5</strong> — answer options (at least 2 required)</li>
          <li><strong className="text-foreground">CorrectIndex</strong> — 0-based index of correct answer (0 = Answer1)</li>
        </ul>
      </div>

      <div className="mb-4">
        <a
          href="/api/quizzes/import-template"
          className="text-sm text-primary underline-offset-4 hover:underline"
        >
          Download template CSV
        </a>
      </div>

      <ImportForm quizId={id} />
    </div>
  );
}
