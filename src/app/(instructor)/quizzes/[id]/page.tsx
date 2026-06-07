import { notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getQuizById } from "@/models/quiz";
import { getQuestionsByQuizId } from "@/models/question";
import { Button } from "@/components/ui/button";
import { QuestionList } from "@/components/instructor/QuestionList";

interface QuizDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function QuizDetailPage({ params }: QuizDetailPageProps) {
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

  const questions = await getQuestionsByQuizId(id);

  return (
    <div>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="mb-1 text-3xl font-bold">{quizData.title}</h1>
          <p className="text-muted-foreground">
            {quizData.description ?? "No description"}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={`/quizzes/${id}/import`}>
            <Button variant="outline">Import</Button>
          </Link>
          <Link href={`/quizzes/${id}/results`}>
            <Button variant="outline">Results</Button>
          </Link>
          <Link href={`/quizzes/${id}/edit`}>
            <Button variant="outline">Edit</Button>
          </Link>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Join Code</p>
          <p className="mt-1 font-mono text-2xl font-bold tracking-widest">
            {quizData.joinCode}
          </p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Duration</p>
          <p className="mt-1 text-2xl font-bold">{quizData.duration} min</p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Questions</p>
          <p className="mt-1 text-2xl font-bold">{quizData.questionCount}</p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Participants</p>
          <p className="mt-1 text-2xl font-bold">{quizData.participantCount}</p>
        </div>
      </div>

      <QuestionList quizId={id} questions={questions} />
    </div>
  );
}
