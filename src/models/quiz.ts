import { db } from "@/lib/db";
import { quiz, question, participant } from "../../drizzle/schema/quiz-schema";
import { eq, desc, sql } from "drizzle-orm";
import { generateJoinCode } from "@/services/quiz";
import type { CreateQuizInput, UpdateQuizInput, QuizWithCounts } from "@/types/quiz";

export async function getQuizzesByInstructor(
  userId: string
): Promise<QuizWithCounts[]> {
  const rows = await db
    .select({
      id: quiz.id,
      title: quiz.title,
      description: quiz.description,
      joinCode: quiz.joinCode,
      duration: quiz.duration,
      randomOrder: quiz.randomOrder,
      createdBy: quiz.createdBy,
      createdAt: quiz.createdAt,
      updatedAt: quiz.updatedAt,
      questionCount: sql<number>`count(distinct ${question.id})`,
      participantCount: sql<number>`count(distinct ${participant.id})`,
    })
    .from(quiz)
    .leftJoin(question, eq(question.quizId, quiz.id))
    .leftJoin(participant, eq(participant.quizId, quiz.id))
    .where(eq(quiz.createdBy, userId))
    .groupBy(quiz.id)
    .orderBy(desc(quiz.createdAt));

  return rows.map((row) => ({
    ...row,
    questionCount: Number(row.questionCount),
    participantCount: Number(row.participantCount),
  }));
}

export async function getQuizById(id: string): Promise<QuizWithCounts | null> {
  const rows = await db
    .select({
      id: quiz.id,
      title: quiz.title,
      description: quiz.description,
      joinCode: quiz.joinCode,
      duration: quiz.duration,
      randomOrder: quiz.randomOrder,
      createdBy: quiz.createdBy,
      createdAt: quiz.createdAt,
      updatedAt: quiz.updatedAt,
      questionCount: sql<number>`count(distinct ${question.id})`,
      participantCount: sql<number>`count(distinct ${participant.id})`,
    })
    .from(quiz)
    .leftJoin(question, eq(question.quizId, quiz.id))
    .leftJoin(participant, eq(participant.quizId, quiz.id))
    .where(eq(quiz.id, id))
    .groupBy(quiz.id)
    .limit(1);

  if (rows.length === 0) return null;

  return {
    ...rows[0],
    questionCount: Number(rows[0].questionCount),
    participantCount: Number(rows[0].participantCount),
  };
}

export async function createQuiz(
  input: CreateQuizInput,
  userId: string
) {
  const joinCode = await generateJoinCode();

  const [created] = await db
    .insert(quiz)
    .values({
      title: input.title,
      description: input.description ?? null,
      joinCode,
      duration: input.duration,
      randomOrder: input.randomOrder ?? false,
      createdBy: userId,
    })
    .returning();

  return created;
}

export async function updateQuiz(id: string, input: UpdateQuizInput) {
  const [updated] = await db
    .update(quiz)
    .set({
      ...(input.title !== undefined && { title: input.title }),
      ...(input.description !== undefined && { description: input.description }),
      ...(input.duration !== undefined && { duration: input.duration }),
      ...(input.randomOrder !== undefined && { randomOrder: input.randomOrder }),
    })
    .where(eq(quiz.id, id))
    .returning();

  return updated;
}

export async function deleteQuiz(id: string) {
  await db.delete(quiz).where(eq(quiz.id, id));
}

export async function getQuizOwnerId(id: string): Promise<string | null> {
  const rows = await db
    .select({ createdBy: quiz.createdBy })
    .from(quiz)
    .where(eq(quiz.id, id))
    .limit(1);

  return rows.length > 0 ? rows[0].createdBy : null;
}

export async function getRecentQuizzes(
  userId: string,
  limit: number = 5
): Promise<QuizWithCounts[]> {
  const rows = await db
    .select({
      id: quiz.id,
      title: quiz.title,
      description: quiz.description,
      joinCode: quiz.joinCode,
      duration: quiz.duration,
      randomOrder: quiz.randomOrder,
      createdBy: quiz.createdBy,
      createdAt: quiz.createdAt,
      updatedAt: quiz.updatedAt,
      questionCount: sql<number>`count(distinct ${question.id})`,
      participantCount: sql<number>`count(distinct ${participant.id})`,
    })
    .from(quiz)
    .leftJoin(question, eq(question.quizId, quiz.id))
    .leftJoin(participant, eq(participant.quizId, quiz.id))
    .where(eq(quiz.createdBy, userId))
    .groupBy(quiz.id)
    .orderBy(desc(quiz.createdAt))
    .limit(limit);

  return rows.map((row) => ({
    ...row,
    questionCount: Number(row.questionCount),
    participantCount: Number(row.participantCount),
  }));
}

export async function getTotalQuizzesByInstructor(
  userId: string
): Promise<number> {
  const rows = await db
    .select({ count: sql<number>`count(*)` })
    .from(quiz)
    .where(eq(quiz.createdBy, userId));

  return Number(rows[0].count);
}

export async function getTotalParticipantsByInstructor(
  userId: string
): Promise<number> {
  const rows = await db
    .select({ count: sql<number>`count(distinct ${participant.id})` })
    .from(quiz)
    .innerJoin(participant, eq(participant.quizId, quiz.id))
    .where(eq(quiz.createdBy, userId));

  return Number(rows[0].count);
}
