import { notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getQuizById } from "@/models/quiz";
import { getQuizSubmissions } from "@/models/submission";
import { Button } from "@/components/ui/button";

interface ResultsPageProps {
  params: Promise<{ id: string }>;
}

export default async function ResultsPage({ params }: ResultsPageProps) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;

  const quizData = await getQuizById(id);
  if (!quizData) notFound();

  const submissions = await getQuizSubmissions(id);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link
            href={`/quizzes/${id}`}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            &larr; Back to quiz
          </Link>
          <h1 className="mt-1 text-3xl font-bold">{quizData.title} — Results</h1>
          <p className="text-muted-foreground">
            {submissions.length} submission{submissions.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link href={`/api/quizzes/${id}/export`}>
          <Button>Export CSV</Button>
        </Link>
      </div>

      {submissions.length === 0 ? (
        <div className="rounded-lg border p-8 text-center">
          <h2 className="mb-2 text-lg font-semibold">No submissions yet</h2>
          <p className="text-muted-foreground">
            Participants have not submitted their answers yet.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr className="text-left text-sm text-muted-foreground">
                <th className="px-4 py-3 font-medium">NIM</th>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Score</th>
                <th className="px-4 py-3 font-medium">Submitted At</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {submissions.map((sub) => (
                <tr key={sub.submissionId} className="border-t text-sm">
                  <td className="px-4 py-3 font-mono">{sub.nim}</td>
                  <td className="px-4 py-3">{sub.name}</td>
                  <td className="px-4 py-3">
                    <span className="font-medium">{sub.score ?? 0}</span>
                    <span className="text-muted-foreground"> pts</span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(sub.submittedAt).toLocaleString("en-US", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/quizzes/${id}/results/${sub.submissionId}`}>
                      <Button variant="outline" size="sm">
                        Review
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
