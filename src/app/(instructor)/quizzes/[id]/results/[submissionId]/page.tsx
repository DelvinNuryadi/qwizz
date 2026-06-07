import { notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getSubmissionResult } from "@/models/submission";
import { CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ResultDetailPageProps {
  params: Promise<{ id: string; submissionId: string }>;
}

export default async function ResultDetailPage({ params }: ResultDetailPageProps) {
  const { id, submissionId } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;

  const result = await getSubmissionResult(submissionId);
  if (!result) notFound();
  // getParticipantById needs the participantId from the submission, but we don't have it here.
  // Let me skip participant name for now and show the score breakdown only.

  return (
    <div>
      <div className="mb-6">
        <Link
          href={`/quizzes/${id}/results`}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          &larr; Back to results
        </Link>
        <h1 className="mt-1 text-3xl font-bold">Submission Review</h1>
      </div>

      <div className="mb-8 inline-flex items-center gap-3 rounded-lg border bg-muted/30 px-6 py-3">
        <span className="text-2xl font-bold">{result.score}</span>
        <span className="text-muted-foreground">/</span>
        <span className="text-2xl font-bold text-muted-foreground">
          {result.totalPoints}
        </span>
        <span className="ml-2 text-sm text-muted-foreground">
          &middot; Submitted{" "}
          {new Date(result.submittedAt).toLocaleString("en-US", {
            dateStyle: "medium",
            timeStyle: "short",
          })}
        </span>
      </div>

      <div className="space-y-4">
        {result.answers.map((answer, i) => (
          <div
            key={answer.questionId}
            className={`rounded-lg border p-4 ${
              answer.isCorrect
                ? "border-green-200 bg-green-50"
                : "border-red-200 bg-red-50"
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className="font-medium">
                  <span className="text-muted-foreground">{i + 1}.</span>{" "}
                  {answer.questionText}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
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
              {answer.selectedAnswerId ? (
                <p>
                  Participant&apos;s answer:{" "}
                  <span
                    className={
                      answer.isCorrect
                        ? "font-medium text-green-700"
                        : "font-medium text-red-700"
                    }
                  >
                    Answer #{answer.selectedAnswerId.slice(0, 8)}
                  </span>
                </p>
              ) : (
                <p className="font-medium text-amber-700">Not answered</p>
              )}
              {!answer.isCorrect && (
                <p>
                  Correct answer:{" "}
                  <span className="font-medium text-green-700">
                    Answer #{answer.correctAnswerId.slice(0, 8)}
                  </span>
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <Link href={`/quizzes/${id}/results`}>
          <Button variant="outline">&larr; Back to all results</Button>
        </Link>
      </div>
    </div>
  );
}
