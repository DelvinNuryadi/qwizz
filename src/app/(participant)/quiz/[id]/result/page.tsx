import { redirect } from "next/navigation";
import { getParticipantSession } from "@/services/participant";
import { getQuizById } from "@/models/quiz";
import { getSubmissionByParticipant, getSubmissionResult } from "@/models/submission";
import { ResultItem } from "@/components/participant/ResultItem";

interface ResultPageProps {
  params: Promise<{ id: string }>;
}

export default async function ResultPage({ params }: ResultPageProps) {
  const { id } = await params;
  const session = await getParticipantSession();

  if (!session || session.quizId !== id) {
    redirect("/join");
  }

  const sub = await getSubmissionByParticipant(session.participantId, id);
  if (!sub || !sub.submittedAt) {
    redirect(`/quiz/${id}`);
  }

  const result = await getSubmissionResult(sub.id);
  if (!result) {
    redirect(`/quiz/${id}`);
  }

  const quizData = await getQuizById(id);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-3xl font-bold">{quizData?.title ?? "Quiz"} — Results</h1>
        <div className="mx-auto inline-flex items-center gap-3 rounded-lg bg-muted px-8 py-4">
          <span className="text-4xl font-bold">
            {result.score}
          </span>
          <span className="text-xl text-muted-foreground">/</span>
          <span className="text-4xl font-bold text-muted-foreground">
            {result.totalPoints}
          </span>
        </div>
        <p className="mt-4 text-muted-foreground">
          Submitted at{" "}
          {new Date(result.submittedAt).toLocaleString("en-US", {
            dateStyle: "medium",
            timeStyle: "short",
          })}
        </p>
      </div>

      <div className="space-y-4">
        {result.answers.map((answer, i) => (
          <ResultItem
            key={answer.questionId}
            index={i}
            questionText={answer.questionText}
            points={answer.points}
            isCorrect={answer.isCorrect}
            selectedAnswerText={answer.selectedAnswerText}
            correctAnswerText={answer.correctAnswerText}
          />
        ))}
      </div>
    </div>
  );
}
