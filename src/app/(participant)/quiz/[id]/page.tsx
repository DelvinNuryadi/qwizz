import { redirect } from "next/navigation";
import { getParticipantSession } from "@/services/participant";
import { getQuizById } from "@/models/quiz";
import { getParticipantById } from "@/models/participant";
import { getSubmissionByParticipant } from "@/models/submission";
import { Button } from "@/components/ui/button";
import { startQuizAction } from "./actions";

interface QuizSessionPageProps {
  params: Promise<{ id: string }>;
}

export default async function QuizSessionPage({ params }: QuizSessionPageProps) {
  const { id } = await params;
  const session = await getParticipantSession();

  if (!session || session.quizId !== id) {
    redirect("/join");
  }

  const participantData = await getParticipantById(session.participantId);

  if (!participantData) {
    redirect("/join");
  }

  const quizData = await getQuizById(id);

  if (!quizData) {
    redirect("/join");
  }

  const existing = await getSubmissionByParticipant(session.participantId, id);
  if (existing) {
    if (existing.submittedAt) {
      redirect(`/quiz/${id}/result`);
    } else {
      redirect(`/quiz/${id}/session`);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <h1 className="mb-2 text-2xl font-bold">{quizData.title}</h1>
        <p className="mb-1 text-muted-foreground">
          Welcome, {participantData.name}
        </p>
        <p className="mb-8 text-sm text-muted-foreground">
          Duration: {quizData.duration} minutes &middot;{" "}
          {quizData.questionCount} questions
        </p>
        <form action={startQuizAction.bind(null, id)}>
          <Button size="lg" type="submit">
            Start Quiz
          </Button>
        </form>
      </div>
    </div>
  );
}
