import { db } from "@/lib/db";
import { quiz, participant } from "../../drizzle/schema/quiz-schema";
import { eq } from "drizzle-orm";

export async function getQuizByJoinCode(code: string) {
  const rows = await db
    .select({
      id: quiz.id,
      title: quiz.title,
    })
    .from(quiz)
    .where(eq(quiz.joinCode, code))
    .limit(1);

  return rows.length > 0 ? rows[0] : null;
}

export async function createParticipant(quizId: string, nim: string, name: string) {
  const [created] = await db
    .insert(participant)
    .values({ quizId, nim, name })
    .returning();

  return created;
}

export async function getParticipantById(id: string) {
  const rows = await db
    .select()
    .from(participant)
    .where(eq(participant.id, id))
    .limit(1);

  return rows.length > 0 ? rows[0] : null;
}
