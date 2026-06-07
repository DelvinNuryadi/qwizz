import { relations, sql } from "drizzle-orm";
import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  index,
  unique,
} from "drizzle-orm/pg-core";
import { user } from "./auth-schema";

export const quiz = pgTable(
  "quiz",
  {
    id: text("id")
      .default(sql`gen_random_uuid()`)
      .primaryKey(),
    title: text("title").notNull(),
    description: text("description"),
    joinCode: text("join_code").notNull().unique(),
    duration: integer("duration").notNull(),
    randomOrder: boolean("random_order").default(false).notNull(),
    createdBy: text("created_by")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("quiz_join_code_idx").on(table.joinCode)],
);

export const question = pgTable(
  "question",
  {
    id: text("id")
      .default(sql`gen_random_uuid()`)
      .primaryKey(),
    quizId: text("quiz_id")
      .notNull()
      .references(() => quiz.id, { onDelete: "cascade" }),
    text: text("text").notNull(),
    order: integer("order").notNull(),
    points: integer("points").default(1).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("question_quiz_id_idx").on(table.quizId)],
);

export const answer = pgTable(
  "answer",
  {
    id: text("id")
      .default(sql`gen_random_uuid()`)
      .primaryKey(),
    questionId: text("question_id")
      .notNull()
      .references(() => question.id, { onDelete: "cascade" }),
    text: text("text").notNull(),
    isCorrect: boolean("is_correct").default(false).notNull(),
    order: integer("order").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("answer_question_id_idx").on(table.questionId)],
);

export const participant = pgTable(
  "participant",
  {
    id: text("id")
      .default(sql`gen_random_uuid()`)
      .primaryKey(),
    quizId: text("quiz_id")
      .notNull()
      .references(() => quiz.id, { onDelete: "cascade" }),
    nim: text("nim").notNull(),
    name: text("name").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("participant_quiz_id_idx").on(table.quizId),
    unique("participant_quiz_nim_unique").on(table.quizId, table.nim),
  ],
);

export const submission = pgTable(
  "submission",
  {
    id: text("id")
      .default(sql`gen_random_uuid()`)
      .primaryKey(),
    participantId: text("participant_id")
      .notNull()
      .references(() => participant.id, { onDelete: "cascade" }),
    quizId: text("quiz_id")
      .notNull()
      .references(() => quiz.id, { onDelete: "cascade" }),
    score: integer("score"),
    startedAt: timestamp("started_at").defaultNow().notNull(),
    submittedAt: timestamp("submitted_at"),
  },
  (table) => [
    index("submission_participant_id_idx").on(table.participantId),
    index("submission_quiz_id_idx").on(table.quizId),
  ],
);

export const submissionAnswer = pgTable(
  "submission_answer",
  {
    id: text("id")
      .default(sql`gen_random_uuid()`)
      .primaryKey(),
    submissionId: text("submission_id")
      .notNull()
      .references(() => submission.id, { onDelete: "cascade" }),
    questionId: text("question_id")
      .notNull()
      .references(() => question.id, { onDelete: "cascade" }),
    answerId: text("answer_id").references(() => answer.id, {
      onDelete: "set null",
    }),
    isCorrect: boolean("is_correct"),
  },
  (table) => [
    index("submission_answer_submission_id_idx").on(table.submissionId),
    index("submission_answer_question_id_idx").on(table.questionId),
  ],
);

export const quizRelations = relations(quiz, ({ one, many }) => ({
  creator: one(user, {
    fields: [quiz.createdBy],
    references: [user.id],
  }),
  questions: many(question),
  participants: many(participant),
  submissions: many(submission),
}));

export const questionRelations = relations(question, ({ one, many }) => ({
  quiz: one(quiz, {
    fields: [question.quizId],
    references: [quiz.id],
  }),
  answers: many(answer),
  submissionAnswers: many(submissionAnswer),
}));

export const answerRelations = relations(answer, ({ one }) => ({
  question: one(question, {
    fields: [answer.questionId],
    references: [question.id],
  }),
}));

export const participantRelations = relations(participant, ({ one, many }) => ({
  quiz: one(quiz, {
    fields: [participant.quizId],
    references: [quiz.id],
  }),
  submissions: many(submission),
}));

export const submissionRelations = relations(submission, ({ one, many }) => ({
  participant: one(participant, {
    fields: [submission.participantId],
    references: [participant.id],
  }),
  quiz: one(quiz, {
    fields: [submission.quizId],
    references: [quiz.id],
  }),
  submissionAnswers: many(submissionAnswer),
}));

export const submissionAnswerRelations = relations(
  submissionAnswer,
  ({ one }) => ({
    submission: one(submission, {
      fields: [submissionAnswer.submissionId],
      references: [submission.id],
    }),
    question: one(question, {
      fields: [submissionAnswer.questionId],
      references: [question.id],
    }),
    answer: one(answer, {
      fields: [submissionAnswer.answerId],
      references: [answer.id],
    }),
  }),
);
