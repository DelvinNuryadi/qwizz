import { db } from "@/lib/db";
import {
  submission,
  submissionAnswer,
  question,
  answer,
  participant,
} from "../../drizzle/schema/quiz-schema";
import { eq, and, asc, sql, inArray, desc, isNotNull } from "drizzle-orm";
import type {
  SessionQuestion,
  SubmissionResult,
  SubmissionAnswerResult,
} from "@/types/submission";

export async function getSubmissionByParticipant(
  participantId: string,
  quizId: string
) {
  const rows = await db
    .select()
    .from(submission)
    .where(
      and(
        eq(submission.participantId, participantId),
        eq(submission.quizId, quizId)
      )
    )
    .limit(1);

  return rows.length > 0 ? rows[0] : null;
}

export async function createSubmission(participantId: string, quizId: string) {
  const [created] = await db
    .insert(submission)
    .values({
      participantId,
      quizId,
    })
    .returning();

  return created;
}

export async function getSessionQuestions(
  quizId: string,
  randomOrder: boolean
): Promise<SessionQuestion[]> {
  const orderByClause = randomOrder ? sql`random()` : asc(question.order);

  const questions = await db
    .select()
    .from(question)
    .where(eq(question.quizId, quizId))
    .orderBy(orderByClause);

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

  return questions.map((q) => ({
    id: q.id,
    text: q.text,
    points: q.points,
    answers: (answerMap.get(q.id) ?? []).map((a) => ({
      id: a.id,
      text: a.text,
    })),
  }));
}

export async function submitSubmission(
  submissionId: string,
  answersInput: { questionId: string; answerId: string | null }[]
) {
  if (answersInput.length === 0) return;

  const questionIds = answersInput.map((a) => a.questionId);
  const dbQuestions = await db
    .select({ id: question.id, points: question.points })
    .from(question)
    .where(inArray(question.id, questionIds));

  const pointsMap = new Map(dbQuestions.map((q) => [q.id, q.points]));

  const answerIds = answersInput
    .filter((a) => a.answerId !== null)
    .map((a) => a.answerId!);

  const correctMap = new Map<string, string>();
  if (answerIds.length > 0) {
    const correctAnswers = await db
      .select({ id: answer.id, questionId: answer.questionId })
      .from(answer)
      .where(
        and(
          inArray(answer.questionId, questionIds),
          eq(answer.isCorrect, true)
        )
      );

    for (const a of correctAnswers) {
      correctMap.set(a.questionId, a.id);
    }
  }

  const values = answersInput.map((input) => {
    const correctId = correctMap.get(input.questionId);
    return {
      submissionId,
      questionId: input.questionId,
      answerId: input.answerId,
      isCorrect: input.answerId === correctId,
    };
  });

  await db.insert(submissionAnswer).values(values);

  let totalScore = 0;
  for (const v of values) {
    if (v.isCorrect) {
      totalScore += pointsMap.get(v.questionId) ?? 0;
    }
  }

  await db
    .update(submission)
    .set({ score: totalScore, submittedAt: sql`now()` })
    .where(eq(submission.id, submissionId));
}

export async function getSubmissionResult(
  submissionId: string
): Promise<SubmissionResult | null> {
  const sub = await db
    .select()
    .from(submission)
    .where(eq(submission.id, submissionId))
    .limit(1);

  if (sub.length === 0 || !sub[0].submittedAt) return null;

  const submissionAnswers = await db
    .select()
    .from(submissionAnswer)
    .where(eq(submissionAnswer.submissionId, submissionId));

  if (submissionAnswers.length === 0) return null;

  const questionIds = submissionAnswers.map((sa) => sa.questionId);
  const dbQuestions = await db
    .select()
    .from(question)
    .where(inArray(question.id, questionIds));

  const dbAnswers = await db
    .select({ id: answer.id, questionId: answer.questionId, text: answer.text, isCorrect: answer.isCorrect })
    .from(answer)
    .where(inArray(answer.questionId, questionIds));

  const questionMap = new Map(dbQuestions.map((q) => [q.id, q]));
  const answerTextMap = new Map(dbAnswers.map((a) => [a.id, a.text]));
  const correctMap = new Map(
    dbAnswers.filter((a) => a.isCorrect).map((a) => [a.questionId, a.id])
  );

  let totalPoints = 0;
  let score = 0;

  const answerResults: SubmissionAnswerResult[] = submissionAnswers.map((sa) => {
    const q = questionMap.get(sa.questionId);
    const correctId = correctMap.get(sa.questionId) ?? "";
    const isCorrect = sa.answerId === correctId;

    totalPoints += q?.points ?? 0;
    if (isCorrect) score += q?.points ?? 0;

    return {
      questionId: sa.questionId,
      questionText: q?.text ?? "",
      selectedAnswerId: sa.answerId,
      selectedAnswerText: sa.answerId ? answerTextMap.get(sa.answerId) ?? null : null,
      correctAnswerId: correctId,
      correctAnswerText: answerTextMap.get(correctId) ?? "",
      isCorrect,
      points: q?.points ?? 0,
    };
  });

  return {
    id: sub[0].id,
    score,
    totalPoints,
    submittedAt: sub[0].submittedAt,
    answers: answerResults,
  };
}

export interface QuizSubmissionRow {
  submissionId: string
  participantId: string
  nim: string
  name: string
  score: number | null
  startedAt: Date
  submittedAt: Date
}

export async function getQuizSubmissions(quizId: string): Promise<QuizSubmissionRow[]> {
  const rows = await db
    .select({
      submissionId: submission.id,
      participantId: participant.id,
      nim: participant.nim,
      name: participant.name,
      score: submission.score,
      startedAt: submission.startedAt,
      submittedAt: submission.submittedAt,
    })
    .from(submission)
    .innerJoin(participant, eq(participant.id, submission.participantId))
    .where(
      and(
        eq(submission.quizId, quizId),
        isNotNull(submission.submittedAt)
      )
    )
    .orderBy(desc(submission.submittedAt));

  return rows.map((r) => ({
    ...r,
    submittedAt: r.submittedAt!,
  }));
}
