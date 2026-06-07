import Link from "next/link";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getQuizzesByInstructor } from "@/models/quiz";
import { Button } from "@/components/ui/button";
import { QuizList } from "@/components/instructor/QuizList";

export default async function QuizzesPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return null;
  }

  const quizzes = await getQuizzesByInstructor(session.user.id);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="mb-1 text-3xl font-bold">Quizzes</h1>
          <p className="text-muted-foreground">
            Manage your quizzes and monitor submissions.
          </p>
        </div>
        <Link href="/quizzes/new">
          <Button>Create Quiz</Button>
        </Link>
      </div>

      {quizzes.length === 0 ? (
        <div className="rounded-lg border p-8 text-center">
          <h2 className="mb-2 text-lg font-semibold">No quizzes yet</h2>
          <p className="mb-4 text-muted-foreground">
            Create your first quiz to get started.
          </p>
          <Link href="/quizzes/new">
            <Button>Create Quiz</Button>
          </Link>
        </div>
      ) : (
        <QuizList quizzes={quizzes} />
      )}
    </div>
  );
}
