"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { LatexHtml } from "@/components/shared/LatexHtml";
import QuestionForm from "./QuestionForm";
import { deleteQuestionAction } from "@/app/(instructor)/quizzes/[id]/actions";
import type { QuestionWithAnswers } from "@/types/question";

interface QuestionListProps {
  quizId: string;
  questions: QuestionWithAnswers[];
}

export function QuestionList({ quizId, questions }: QuestionListProps) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    try {
      await deleteQuestionAction(id);
      router.refresh();
    } catch {
      alert("Failed to delete question.");
    }
  }

  if (questions.length === 0 && !adding) {
    return (
      <div className="rounded-lg border p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Questions</h2>
        </div>
        <p className="mb-4 text-muted-foreground">
          No questions yet. Add your first question below.
        </p>
        <Button onClick={() => setAdding(true)}>Add Question</Button>
        {adding && (
          <div className="mt-4">
            <QuestionForm quizId={quizId} onClose={() => setAdding(false)} />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Questions ({questions.length})</h2>
        {!adding && (
          <Button size="sm" onClick={() => setAdding(true)}>
            Add Question
          </Button>
        )}
      </div>

      {adding && (
        <QuestionForm quizId={quizId} onClose={() => setAdding(false)} />
      )}

      {questions.map((q, index) => (
        <div key={q.id} className="rounded-lg border p-4">
          {editingId === q.id ? (
            <QuestionForm
              quizId={quizId}
              initialData={q}
              onClose={() => setEditingId(null)}
            />
          ) : (
            <>
              <div className="mb-2 flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-medium">
                    <span className="text-muted-foreground">{index + 1}.</span>{" "}
                    <LatexHtml html={q.text} />
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {q.points} pt{q.points !== 1 ? "s" : ""}
                  </p>
                  {q.imageUrl && (
                    <img
                      src={q.imageUrl}
                      alt="Question image"
                      className="mt-2 max-h-40 max-w-xs rounded-md border object-contain"
                    />
                  )}
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingId(q.id)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeletingId(q.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
              <ul className="ml-4 space-y-1">
                {q.answers.map((a) => (
                  <li
                    key={a.id}
                    className={`text-sm ${
                      a.isCorrect
                        ? "font-medium text-green-600"
                        : "text-muted-foreground"
                    }`}
                  >
                    <span className="flex items-center gap-1">
                      {a.isCorrect ? "\u2713 " : ""}
                      <LatexHtml html={a.text} className="inline-block" />
                    </span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      ))}

      <ConfirmDialog
        open={deletingId !== null}
        onOpenChange={(open) => { if (!open) setDeletingId(null); }}
        title="Delete Question"
        description="Delete this question and all its answers? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={() => {
          if (deletingId) handleDelete(deletingId);
          setDeletingId(null);
        }}
      />
    </div>
  );
}
