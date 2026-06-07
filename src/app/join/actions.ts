"use server";

import { redirect } from "next/navigation";
import { getQuizByJoinCode, createParticipant } from "@/models/participant";
import { createParticipantSession } from "@/services/participant";

export async function joinQuizAction(formData: FormData) {
  const joinCode = formData.get("joinCode") as string | null;
  const nim = formData.get("nim") as string | null;
  const name = formData.get("name") as string | null;

  if (!joinCode || joinCode.trim().length !== 6) {
    throw new Error("Invalid join code");
  }

  if (!nim || !nim.trim()) {
    throw new Error("NIM is required");
  }

  if (!name || name.trim().length < 2) {
    throw new Error("Name must be at least 2 characters");
  }

  const quizData = await getQuizByJoinCode(joinCode.trim().toUpperCase());

  if (!quizData) {
    throw new Error("Quiz not found. Check your join code.");
  }

  let participantData;
  try {
    participantData = await createParticipant(
      quizData.id,
      nim.trim(),
      name.trim()
    );
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes("unique")
    ) {
      throw new Error("NIM already registered for this quiz");
    }
    throw new Error("Failed to join quiz. Please try again.");
  }

  await createParticipantSession(participantData.id, quizData.id);

  redirect(`/quiz/${quizData.id}`);
}
