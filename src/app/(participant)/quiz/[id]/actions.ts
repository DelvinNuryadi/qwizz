"use server";

import { redirect } from "next/navigation";
import { getParticipantSession } from "@/services/participant";
import {
  getSubmissionByParticipant,
  createSubmission,
  submitSubmission,
} from "@/models/submission";

export async function startQuizAction(quizId: string) {
  const session = await getParticipantSession();

  if (!session || session.quizId !== quizId) {
    redirect("/join");
  }

  const existing = await getSubmissionByParticipant(
    session.participantId,
    quizId
  );

  if (existing) {
    if (existing.submittedAt) {
      redirect(`/quiz/${quizId}/result`);
    } else {
      redirect(`/quiz/${quizId}/session`);
    }
  }

  await createSubmission(session.participantId, quizId);

  redirect(`/quiz/${quizId}/session`);
}

export async function submitQuizAction(formData: FormData) {
  const submissionId = formData.get("submissionId") as string | null;
  if (!submissionId) throw new Error("Missing submission ID");

  const session = await getParticipantSession();
  if (!session) redirect("/join");

  const answersInput: { questionId: string; answerId: string | null }[] = [];

  for (const [key, value] of formData.entries()) {
    if (key.startsWith("question_")) {
      const questionId = key.replace("question_", "");
      answersInput.push({
        questionId,
        answerId: value as string,
      });
    }
  }

  await submitSubmission(submissionId, answersInput);

  redirect(`/quiz/${session.quizId}/result`);
}
