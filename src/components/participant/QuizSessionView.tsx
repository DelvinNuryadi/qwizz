"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { LatexHtml } from "@/components/shared/LatexHtml";
import { submitQuizAction } from "@/app/(participant)/quiz/[id]/actions";
import type { SessionQuestion } from "@/types/submission";

interface QuizSessionViewProps {
  questions: SessionQuestion[];
  submissionId: string;
  startedAt: string;
  duration: number;
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
  const [currentIndex, setCurrentIndex] = useState(0);
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

  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);

  async function handleSubmit() {
    await submitNow(selected);
  }

  const answeredCount = Object.keys(selected).length;
  const current = questions[currentIndex];

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {answeredCount} of {questions.length} answered
        </p>
        <div
          className={`rounded-lg px-4 py-2 font-mono text-xl font-bold tabular-nums ${timeLeft < 60
            ? "bg-destructive/10 text-destructive"
            : "bg-muted"
            }`}
        >
          {formatTime(timeLeft)}
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {questions.map((q, i) => {
          const isAnswered = selected[q.id] !== undefined;
          const isActive = i === currentIndex;
          return (
            <button
              key={q.id}
              type="button"
              onClick={() => setCurrentIndex(i)}
              className={`flex h-9 w-9 items-center justify-center rounded-md text-sm font-medium transition-colors ${isActive
                ? "bg-primary text-primary-foreground"
                : isAnswered
                  ? "bg-primary/10 text-primary ring-1 ring-primary/30"
                  : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                }`}
            >
              {i + 1}
            </button>
          );
        })}
      </div>

      <div className="rounded-lg border p-6">
        <div className="mb-1 flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Question {currentIndex + 1} of {questions.length}
          </span>
          <span className="text-sm text-muted-foreground">
            {current.points} pt{current.points !== 1 ? "s" : ""}
          </span>
        </div>
        <h3 className="mb-4 text-lg font-medium">
          <LatexHtml html={current.text} />
        </h3>

        {current.imageUrl && (
          <img
            src={current.imageUrl}
            alt="Question image"
            className="mb-4 max-h-60 max-w-sm rounded-md border object-contain"
          />
        )}

        <div className="space-y-2">
          {current.answers.map((a) => (
            <label
              key={a.id}
              className="flex cursor-pointer items-center gap-3 rounded-md border p-3 text-sm hover:bg-muted/50 has-checked:border-primary has-checked:bg-primary/5"
            >
              <input
                type="radio"
                name={`question_${current.id}`}
                value={a.id}
                checked={selected[current.id] === a.id}
                onChange={() => handleSelect(current.id, a.id)}
                className="h-4 w-4 text-primary focus:ring-ring"
              />
              <LatexHtml html={a.text} className="inline-block" />
            </label>
          ))}
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={() => setCurrentIndex((p) => Math.max(0, p - 1))}
          disabled={currentIndex === 0}
        >
          Previous
        </Button>

        <Button
          type="button"
          variant="destructive"
          onClick={() => setShowSubmitConfirm(true)}
          disabled={submitting}
        >
          {submitting ? "Submitting..." : "Submit All Answers"}
        </Button>

        {currentIndex < questions.length - 1 ? (
          <Button
            type="button"
            onClick={() => setCurrentIndex((p) => p + 1)}
          >
            Next
          </Button>
        ) : (
          <div />
        )}
      </div>

      <ConfirmDialog
        open={showSubmitConfirm}
        onOpenChange={setShowSubmitConfirm}
        title="Submit Answers"
        description={`You have ${formatTime(timeLeft)} left. Are you sure you want to submit?`}
        confirmLabel="Submit"
        variant="default"
        onConfirm={() => {
          setShowSubmitConfirm(false);
          handleSubmit();
        }}
      />
    </div>
  );
}
