import { redirect } from "next/navigation";
import { getParticipantSession } from "@/services/participant";
import { getQuizById } from "@/models/quiz";
import { getSubmissionByParticipant, getSubmissionResult } from "@/models/submission";
import { CheckCircle, XCircle } from "lucide-react";

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
          <div
            key={answer.questionId}
            className={`rounded-lg border p-4 ${
              answer.isCorrect ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className="font-medium">
                  <span className="text-muted-foreground">{i + 1}.</span>{" "}
                  {answer.questionText}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {answer.points} pt{answer.points !== 1 ? "s" : ""}
                </p>
              </div>
              <div className="flex-shrink-0">
                {answer.isCorrect ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600" />
                )}
              </div>
            </div>
            <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-sm">
              {answer.selectedAnswerText ? (
                <p>
                  Your answer:{" "}
                  <span
                    className={
                      answer.isCorrect
                        ? "font-medium text-green-700"
                        : "font-medium text-red-700"
                    }
                  >
                    {answer.selectedAnswerText}
                  </span>
                </p>
              ) : (
                <p className="font-medium text-amber-700">Not answered</p>
              )}
              {!answer.isCorrect && (
                <p>
                  Correct answer:{" "}
                  <span className="font-medium text-green-700">
                    {answer.correctAnswerText}
                  </span>
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
