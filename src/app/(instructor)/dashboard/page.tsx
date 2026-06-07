import Link from "next/link";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  getTotalQuizzesByInstructor,
  getTotalParticipantsByInstructor,
  getRecentQuizzes,
} from "@/models/quiz";
import { Button } from "@/components/ui/button";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  const totalQuizzes = await getTotalQuizzesByInstructor(session.user.id);
  const totalParticipants =
    totalQuizzes > 0
      ? await getTotalParticipantsByInstructor(session.user.id)
      : 0;
  const recentQuizzes = await getRecentQuizzes(session.user.id, 5);

  return (
    <div>
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">
          Welcome, {session.user.name}
        </h1>
        <p className="text-muted-foreground">
          Manage your quizzes and monitor submissions.
        </p>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Total Quizzes</p>
          <p className="mt-1 text-3xl font-bold">{totalQuizzes}</p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Total Participants</p>
          <p className="mt-1 text-3xl font-bold">{totalParticipants}</p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Recent Activity</p>
          <p className="mt-1 text-3xl font-bold">{recentQuizzes.length}</p>
        </div>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Recent Quizzes</h2>
        <Link href="/quizzes">
          <Button variant="outline" size="sm">
            View All
          </Button>
        </Link>
      </div>

      {recentQuizzes.length === 0 ? (
        <div className="rounded-lg border p-8 text-center">
          <p className="mb-4 text-muted-foreground">
            No quizzes yet. Create your first quiz to get started.
          </p>
          <Link href="/quizzes/new">
            <Button>Create Quiz</Button>
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left font-medium">Title</th>
                <th className="px-4 py-3 text-left font-medium">Join Code</th>
                <th className="px-4 py-3 text-center font-medium">Questions</th>
                <th className="px-4 py-3 text-center font-medium">Duration</th>
              </tr>
            </thead>
            <tbody>
              {recentQuizzes.map((quizItem) => (
                <tr
                  key={quizItem.id}
                  className="border-b last:border-0 hover:bg-muted/30"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/quizzes/${quizItem.id}`}
                      className="font-medium hover:underline"
                    >
                      {quizItem.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 font-mono tracking-wider">
                    {quizItem.joinCode}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {quizItem.questionCount}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {quizItem.duration}m
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
