"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { deleteQuizAction } from "@/app/(instructor)/quizzes/actions";
import type { QuizWithCounts } from "@/types/quiz";

interface QuizListProps {
  quizzes: QuizWithCounts[];
}

export function QuizList({ quizzes }: QuizListProps) {
  const router = useRouter();
  const [deletingQuiz, setDeletingQuiz] = useState<{ id: string; title: string } | null>(null);

  async function handleDelete() {
    if (!deletingQuiz) return;

    try {
      await deleteQuizAction(deletingQuiz.id);
      router.refresh();
    } catch {
      alert("Failed to delete quiz. Please try again.");
    }
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="px-4 py-3 text-left font-medium">Title</th>
            <th className="px-4 py-3 text-left font-medium">Join Code</th>
            <th className="px-4 py-3 text-center font-medium">Questions</th>
            <th className="px-4 py-3 text-center font-medium">Participants</th>
            <th className="px-4 py-3 text-center font-medium">Duration</th>
            <th className="px-4 py-3 text-right font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {quizzes.map((quizItem) => (
            <tr key={quizItem.id} className="border-b last:border-0 hover:bg-muted/30">
              <td className="px-4 py-3">
                <Link
                  href={`/quizzes/${quizItem.id}`}
                  className="font-medium hover:underline"
                >
                  {quizItem.title}
                </Link>
              </td>
              <td className="px-4 py-3 font-mono tracking-wider">
                {quizItem.joinCode}
              </td>
              <td className="px-4 py-3 text-center">{quizItem.questionCount}</td>
              <td className="px-4 py-3 text-center">{quizItem.participantCount}</td>
              <td className="px-4 py-3 text-center">{quizItem.duration}m</td>
              <td className="px-4 py-3 text-right">
                <div className="flex justify-end gap-1">
                  <Link href={`/quizzes/${quizItem.id}`}>
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
                  </Link>
                  <Link href={`/quizzes/${quizItem.id}/edit`}>
                    <Button variant="ghost" size="sm">
                      Edit
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeletingQuiz({ id: quizItem.id, title: quizItem.title })}
                  >
                    Delete
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <ConfirmDialog
        open={deletingQuiz !== null}
        onOpenChange={(open) => { if (!open) setDeletingQuiz(null); }}
        title="Delete Quiz"
        description={deletingQuiz ? `Delete "${deletingQuiz.title}"? This action cannot be undone.` : ""}
        confirmLabel="Delete"
        onConfirm={() => {
          handleDelete();
          setDeletingQuiz(null);
        }}
      />
    </div>
  );
}
