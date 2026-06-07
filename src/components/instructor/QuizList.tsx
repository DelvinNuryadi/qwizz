"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { deleteQuizAction } from "@/app/(instructor)/quizzes/actions";
import type { QuizWithCounts } from "@/types/quiz";

interface QuizListProps {
  quizzes: QuizWithCounts[];
}

export function QuizList({ quizzes }: QuizListProps) {
  const router = useRouter();

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Delete "${title}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await deleteQuizAction(id);
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
                    onClick={() => handleDelete(quizItem.id, quizItem.title)}
                  >
                    Delete
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
