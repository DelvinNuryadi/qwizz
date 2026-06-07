"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  createQuiz,
  updateQuiz,
  deleteQuiz,
  getQuizOwnerId,
} from "@/models/quiz";
import type { CreateQuizInput, UpdateQuizInput } from "@/types/quiz";

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

export async function createQuizAction(formData: FormData) {
  const session = await requireSession();

  const title = formData.get("title") as string | null;
  const description = formData.get("description") as string | null;
  const durationRaw = formData.get("duration") as string | null;
  const randomOrderRaw = formData.get("randomOrder") as string | null;

  if (!title || !title.trim()) {
    throw new Error("Title is required");
  }

  const duration = durationRaw ? parseInt(durationRaw, 10) : NaN;
  if (isNaN(duration) || duration <= 0) {
    throw new Error("Duration must be a positive number");
  }

  const input: CreateQuizInput = {
    title: title.trim(),
    description: description?.trim() || undefined,
    duration,
    randomOrder: randomOrderRaw === "on",
  };

  try {
    await createQuiz(input, session.user.id);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }

  revalidatePath("/quizzes");
  redirect("/quizzes");
}

export async function updateQuizAction(id: string, formData: FormData) {
  const session = await requireSession();

  const ownerId = await getQuizOwnerId(id);
  if (!ownerId || ownerId !== session.user.id) {
    throw new Error("Quiz not found or unauthorized");
  }

  const title = formData.get("title") as string | null;
  const description = formData.get("description") as string | null;
  const durationRaw = formData.get("duration") as string | null;
  const randomOrderRaw = formData.get("randomOrder") as string | null;

  const input: UpdateQuizInput = {};

  if (title?.trim()) {
    input.title = title.trim();
  }
  if (description) {
    input.description = description.trim() || undefined;
  }
  if (durationRaw) {
    const duration = parseInt(durationRaw, 10);
    if (isNaN(duration) || duration <= 0) {
      throw new Error("Duration must be a positive number");
    }
    input.duration = duration;
  }
  input.randomOrder = randomOrderRaw === "on";

  try {
    await updateQuiz(id, input);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }

  revalidatePath("/quizzes");
  revalidatePath(`/quizzes/${id}`);
  redirect("/quizzes");
}

export async function deleteQuizAction(id: string) {
  const session = await requireSession();

  const ownerId = await getQuizOwnerId(id);
  if (!ownerId || ownerId !== session.user.id) {
    throw new Error("Quiz not found or unauthorized");
  }

  try {
    await deleteQuiz(id);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }

  revalidatePath("/quizzes");
  revalidatePath("/dashboard");
}
