CREATE TABLE "answer" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"question_id" text NOT NULL,
	"text" text NOT NULL,
	"is_correct" boolean DEFAULT false NOT NULL,
	"order" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "participant" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"quiz_id" text NOT NULL,
	"nim" text NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "participant_quiz_nim_unique" UNIQUE("quiz_id","nim")
);
--> statement-breakpoint
CREATE TABLE "question" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"quiz_id" text NOT NULL,
	"text" text NOT NULL,
	"order" integer NOT NULL,
	"points" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quiz" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"join_code" text NOT NULL,
	"duration" integer NOT NULL,
	"random_order" boolean DEFAULT false NOT NULL,
	"created_by" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "quiz_join_code_unique" UNIQUE("join_code")
);
--> statement-breakpoint
CREATE TABLE "submission" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"participant_id" text NOT NULL,
	"quiz_id" text NOT NULL,
	"score" integer,
	"started_at" timestamp DEFAULT now() NOT NULL,
	"submitted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "submission_answer" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"submission_id" text NOT NULL,
	"question_id" text NOT NULL,
	"answer_id" text,
	"is_correct" boolean
);
--> statement-breakpoint
ALTER TABLE "answer" ADD CONSTRAINT "answer_question_id_question_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."question"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "participant" ADD CONSTRAINT "participant_quiz_id_quiz_id_fk" FOREIGN KEY ("quiz_id") REFERENCES "public"."quiz"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question" ADD CONSTRAINT "question_quiz_id_quiz_id_fk" FOREIGN KEY ("quiz_id") REFERENCES "public"."quiz"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz" ADD CONSTRAINT "quiz_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "submission" ADD CONSTRAINT "submission_participant_id_participant_id_fk" FOREIGN KEY ("participant_id") REFERENCES "public"."participant"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "submission" ADD CONSTRAINT "submission_quiz_id_quiz_id_fk" FOREIGN KEY ("quiz_id") REFERENCES "public"."quiz"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "submission_answer" ADD CONSTRAINT "submission_answer_submission_id_submission_id_fk" FOREIGN KEY ("submission_id") REFERENCES "public"."submission"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "submission_answer" ADD CONSTRAINT "submission_answer_question_id_question_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."question"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "submission_answer" ADD CONSTRAINT "submission_answer_answer_id_answer_id_fk" FOREIGN KEY ("answer_id") REFERENCES "public"."answer"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "answer_question_id_idx" ON "answer" USING btree ("question_id");--> statement-breakpoint
CREATE INDEX "participant_quiz_id_idx" ON "participant" USING btree ("quiz_id");--> statement-breakpoint
CREATE INDEX "question_quiz_id_idx" ON "question" USING btree ("quiz_id");--> statement-breakpoint
CREATE INDEX "quiz_join_code_idx" ON "quiz" USING btree ("join_code");--> statement-breakpoint
CREATE INDEX "submission_participant_id_idx" ON "submission" USING btree ("participant_id");--> statement-breakpoint
CREATE INDEX "submission_quiz_id_idx" ON "submission" USING btree ("quiz_id");--> statement-breakpoint
CREATE INDEX "submission_answer_submission_id_idx" ON "submission_answer" USING btree ("submission_id");--> statement-breakpoint
CREATE INDEX "submission_answer_question_id_idx" ON "submission_answer" USING btree ("question_id");