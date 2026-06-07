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

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

interface ParsedRow {
  text: string
  points: number
  answers: { text: string; isCorrect: boolean; order: number }[]
}

function parseCSV(content: string): ParsedRow[] {
  const lines = content.split("\n").map((l) => l.trim()).filter(Boolean);
  if (lines.length < 2) throw new Error("CSV must have a header row and at least one data row");

  const header = parseCSVLine(lines[0]);
  const headerLower = header.map((h) => h.toLowerCase());

  const qIdx = headerLower.findIndex((h) => h === "question" || h === "text");
  const pIdx = headerLower.findIndex((h) => h === "points" || h === "point" || h === "score");
  const correctIdx = headerLower.findIndex(
    (h) => h === "correctindex" || h === "correct_index" || h === "correct" || h === "key"
  );

  if (qIdx === -1) throw new Error("Missing 'Question' column");
  if (correctIdx === -1) throw new Error("Missing 'CorrectIndex' column");

  const answerCols: number[] = [];
  for (let i = 0; i < header.length; i++) {
    if (headerLower[i].startsWith("answer") || headerLower[i].match(/^a\d+$/)) {
      answerCols.push(i);
    }
  }

  const rows: ParsedRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = parseCSVLine(lines[i]);
    const text = cols[qIdx];
    if (!text) continue;

    const points = pIdx !== -1 && cols[pIdx] ? parseInt(cols[pIdx], 10) : 1;
    const correctIndex = parseInt(cols[correctIdx], 10);

    const answers: { text: string; isCorrect: boolean; order: number }[] = [];
    let aOrder = 0;

    for (const colIdx of answerCols) {
      const answerText = cols[colIdx]?.trim();
      if (!answerText) continue;
      answers.push({
        text: answerText,
        isCorrect: aOrder === correctIndex,
        order: aOrder,
      });
      aOrder++;
    }

    if (answers.length < 2) {
      throw new Error(`Row ${i}: at least 2 answers are required`);
    }

    if (correctIndex < 0 || correctIndex >= answers.length) {
      throw new Error(`Row ${i}: CorrectIndex ${correctIndex} is out of range (0-${answers.length - 1})`);
    }

    rows.push({ text, points: isNaN(points) ? 1 : points, answers });
  }

  if (rows.length === 0) throw new Error("No valid data rows found");
  return rows;
}

export async function importQuestionsAction(quizId: string, formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const ownerId = await getQuizOwnerId(quizId);
  if (!ownerId || ownerId !== session.user.id) {
    throw new Error("Quiz not found or unauthorized");
  }

  const file = formData.get("file") as File | null;
  if (!file) throw new Error("No file provided");

  const content = await file.text();
  const rows = parseCSV(content);

  for (const row of rows) {
    await createQuestion(quizId, row);
  }

  revalidatePath(`/quizzes/${quizId}`);
  redirect(`/quizzes/${quizId}`);
}
