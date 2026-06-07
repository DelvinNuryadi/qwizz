import { db } from "@/lib/db";
import { question, answer, quiz } from "../../drizzle/schema/quiz-schema";
import { eq, asc, sql, inArray } from "drizzle-orm";
import type {
  QuestionWithAnswers,
  QuestionInput,
} from "@/types/question";

function toQuestionWithAnswers(row: typeof question.$inferSelect, answers: typeof answer.$inferSelect[]): QuestionWithAnswers {
  return {
    id: row.id,
    quizId: row.quizId,
    text: row.text,
    order: row.order,
    points: row.points,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    answers: answers.map((a) => ({
      id: a.id,
      questionId: a.questionId,
      text: a.text,
      isCorrect: a.isCorrect,
      order: a.order,
    })),
  };
}

export async function getQuestionsByQuizId(quizId: string): Promise<QuestionWithAnswers[]> {
  const questions = await db
    .select()
    .from(question)
    .where(eq(question.quizId, quizId))
    .orderBy(asc(question.order));

  if (questions.length === 0) return [];

  const questionIds = questions.map((q) => q.id);
  const answers = await db
    .select()
    .from(answer)
    .where(inArray(answer.questionId, questionIds))
    .orderBy(asc(answer.order));

  const answerMap = new Map<string, typeof answer.$inferSelect[]>();
  for (const a of answers) {
    const list = answerMap.get(a.questionId) ?? [];
    list.push(a);
    answerMap.set(a.questionId, list);
  }

  return questions.map((q) =>
    toQuestionWithAnswers(q, answerMap.get(q.id) ?? [])
  );
}

export async function createQuestion(quizId: string, input: QuestionInput) {
  const maxOrderResult = await db
    .select({ maxOrder: sql<number>`coalesce(max(${question.order}), 0)` })
    .from(question)
    .where(eq(question.quizId, quizId));

  const nextOrder = Number(maxOrderResult[0].maxOrder) + 1;

  const [created] = await db
    .insert(question)
    .values({
      quizId,
      text: input.text,
      order: nextOrder,
      points: input.points,
    })
    .returning();

  if (input.answers.length > 0) {
    await db.insert(answer).values(
      input.answers.map((a) => ({
        questionId: created.id,
        text: a.text,
        isCorrect: a.isCorrect,
        order: a.order,
      }))
    );
  }

  return created;
}

export async function updateQuestion(id: string, input: { text?: string; points?: number }) {
  const [updated] = await db
    .update(question)
    .set({
      ...(input.text !== undefined && { text: input.text }),
      ...(input.points !== undefined && { points: input.points }),
    })
    .where(eq(question.id, id))
    .returning();

  return updated;
}

export async function deleteQuestion(id: string) {
  await db.delete(question).where(eq(question.id, id));
}

export async function getQuizIdByQuestionId(questionId: string): Promise<string | null> {
  const rows = await db
    .select({ quizId: question.quizId })
    .from(question)
    .where(eq(question.id, questionId))
    .limit(1);

  return rows.length > 0 ? rows[0].quizId : null;
}

export async function getQuizOwnerByQuestionId(questionId: string): Promise<string | null> {
  const rows = await db
    .select({ createdBy: quiz.createdBy })
    .from(question)
    .innerJoin(quiz, eq(quiz.id, question.quizId))
    .where(eq(question.id, questionId))
    .limit(1);

  return rows.length > 0 ? rows[0].createdBy : null;
}
