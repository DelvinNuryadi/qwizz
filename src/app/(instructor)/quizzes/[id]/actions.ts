"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  createQuestion,
  updateQuestion,
  deleteQuestion,
  getQuizIdByQuestionId,
} from "@/models/question";
import { getQuizOwnerId } from "@/models/quiz";

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return "An unexpected error occurred";
}

async function requireSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  return session;
}

async function requireQuizOwner(quizId: string, userId: string) {
  const ownerId = await getQuizOwnerId(quizId);
  if (!ownerId || ownerId !== userId) {
    throw new Error("Quiz not found or unauthorized");
  }
}

export async function addQuestionAction(quizId: string, formData: FormData) {
  const session = await requireSession();
  await requireQuizOwner(quizId, session.user.id);

  const text = formData.get("text") as string | null;
  const pointsRaw = formData.get("points") as string | null;

  if (!text || !text.trim()) {
    throw new Error("Question text is required");
  }

  const points = pointsRaw ? parseInt(pointsRaw, 10) : 1;
  if (isNaN(points) || points <= 0) {
    throw new Error("Points must be a positive number");
  }

  const correctIndexRaw = formData.get("correctIndex") as string | null;
  const correctIndex = correctIndexRaw ? parseInt(correctIndexRaw, 10) : -1;

  const answers: { text: string; isCorrect: boolean; order: number }[] = [];

  for (let i = 0; i < 5; i++) {
    const answerText = formData.get(`answer_${i}`) as string | null;
    if (!answerText?.trim()) continue;
    answers.push({
      text: answerText.trim(),
      isCorrect: i === correctIndex,
      order: i,
    });
  }

  if (answers.length < 2) {
    throw new Error("At least 2 answers are required");
  }

  if (!answers.some((a) => a.isCorrect)) {
    throw new Error("One answer must be marked as correct");
  }

  try {
    await createQuestion(quizId, { text: text.trim(), points, answers });
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }

  revalidatePath(`/quizzes/${quizId}`);
}

export async function updateQuestionAction(questionId: string, formData: FormData) {
  const session = await requireSession();

  const quizId = await getQuizIdByQuestionId(questionId);
  if (!quizId) {
    throw new Error("Question not found");
  }

  await requireQuizOwner(quizId, session.user.id);

  const text = formData.get("text") as string | null;
  const pointsRaw = formData.get("points") as string | null;

  if (!text || !text.trim()) {
    throw new Error("Question text is required");
  }

  const points = pointsRaw ? parseInt(pointsRaw, 10) : 1;
  if (isNaN(points) || points <= 0) {
    throw new Error("Points must be a positive number");
  }

  try {
    await updateQuestion(questionId, { text: text.trim(), points });
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }

  revalidatePath(`/quizzes/${quizId}`);
}

export async function deleteQuestionAction(questionId: string) {
  const session = await requireSession();

  const quizId = await getQuizIdByQuestionId(questionId);
  if (!quizId) {
    throw new Error("Question not found");
  }

  await requireQuizOwner(quizId, session.user.id);

  try {
    await deleteQuestion(questionId);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }

  revalidatePath(`/quizzes/${quizId}`);
}
