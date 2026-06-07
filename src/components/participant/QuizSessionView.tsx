"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { submitQuizAction } from "@/app/(participant)/quiz/[id]/actions";
import type { SessionQuestion } from "@/types/submission";

interface QuizSessionViewProps {
  questions: SessionQuestion[];
  submissionId: string;
  startedAt: string;
  duration: number;
  quizId: string;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export default function QuizSessionView({
  questions,
  submissionId,
  startedAt,
  duration,
}: QuizSessionViewProps) {
  const [timeLeft, setTimeLeft] = useState<number>(duration * 60);
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const selectedRef = useRef(selected);
  const submittingRef = useRef(false);

  useEffect(() => {
    selectedRef.current = selected;
  }, [selected]);

  useEffect(() => {
    submittingRef.current = submitting;
  }, [submitting]);

  const submitNow = useCallback(
    async (answers: Record<string, string>) => {
      if (submittingRef.current) return;
      submittingRef.current = true;
      setSubmitting(true);

      const formData = new FormData();
      formData.set("submissionId", submissionId);

      for (const [questionId, answerId] of Object.entries(answers)) {
        formData.set(`question_${questionId}`, answerId);
      }

      try {
        await submitQuizAction(formData);
      } catch {
        setSubmitting(false);
        submittingRef.current = false;
      }
    },
    [submissionId]
  );

  useEffect(() => {
    const startMs = new Date(startedAt).getTime();
    const totalMs = duration * 60 * 1000;
    const deadline = startMs + totalMs;

    function tick() {
      const remaining = Math.max(
        0,
        Math.floor((deadline - Date.now()) / 1000)
      );
      setTimeLeft(remaining);

      if (remaining <= 0) {
        submitNow(selectedRef.current);
      }
    }

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [startedAt, duration, submitNow]);

  function handleSelect(questionId: string, answerId: string) {
    setSelected((prev) => ({ ...prev, [questionId]: answerId }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (
      !confirm(
        `You have ${formatTime(timeLeft)} left. Are you sure you want to submit?`
      )
    ) {
      return;
    }
    await submitNow(selected);
  }

  const answeredCount = Object.keys(selected).length;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {answeredCount} of {questions.length} answered
        </p>
        <div
          className={`rounded-lg px-4 py-2 font-mono text-xl font-bold tabular-nums ${
            timeLeft < 60
              ? "bg-destructive/10 text-destructive"
              : "bg-muted"
          }`}
        >
          {formatTime(timeLeft)}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <input type="hidden" name="submissionId" value={submissionId} />

        {questions.map((q, index) => (
          <div key={q.id} className="rounded-lg border p-4">
            <h3 className="mb-1 font-medium">
              <span className="text-muted-foreground">{index + 1}.</span>{" "}
              {q.text}
            </h3>
            <p className="mb-3 text-sm text-muted-foreground">
              {q.points} pt{q.points !== 1 ? "s" : ""}
            </p>
            <div className="space-y-2">
              {q.answers.map((a) => (
                <label
                  key={a.id}
                  className="flex cursor-pointer items-center gap-3 rounded-md border p-3 text-sm hover:bg-muted/50 has-checked:border-primary has-checked:bg-primary/5"
                >
                  <input
                    type="radio"
                    name={`question_${q.id}`}
                    value={a.id}
                    checked={selected[q.id] === a.id}
                    onChange={() => handleSelect(q.id, a.id)}
                    className="h-4 w-4 text-primary focus:ring-ring"
                  />
                  {a.text}
                </label>
              ))}
            </div>
          </div>
        ))}

        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? "Submitting..." : "Submit Answers"}
        </Button>
      </form>
    </div>
  );
}
