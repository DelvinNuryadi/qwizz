import { redirect } from "next/navigation";
import { getParticipantSession } from "@/services/participant";
import { getQuizById } from "@/models/quiz";
import { getSubmissionByParticipant, getSessionQuestions } from "@/models/submission";
import QuizSessionView from "@/components/participant/QuizSessionView";

interface SessionPageProps {
  params: Promise<{ id: string }>;
}

export default async function SessionPage({ params }: SessionPageProps) {
  const { id } = await params;
  const session = await getParticipantSession();

  if (!session || session.quizId !== id) {
    redirect("/join");
  }

  const sub = await getSubmissionByParticipant(session.participantId, id);
  if (!sub) {
    redirect(`/quiz/${id}`);
  }

  if (sub.submittedAt) {
    redirect(`/quiz/${id}/result`);
  }

  const quizData = await getQuizById(id);
  if (!quizData) {
    redirect("/join");
  }

  const questions = await getSessionQuestions(id, quizData.randomOrder);

  return (
    <QuizSessionView
      questions={questions}
      submissionId={sub.id}
      startedAt={sub.startedAt.toISOString()}
      duration={quizData.duration}
      quizId={id}
    />
  );
}
