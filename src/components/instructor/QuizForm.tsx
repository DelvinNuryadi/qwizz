"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { createQuizAction, updateQuizAction } from "@/app/(instructor)/quizzes/actions";
import type { QuizWithCounts } from "@/types/quiz";

interface QuizFormProps {
  initialData?: QuizWithCounts;
}

export default function QuizForm({ initialData }: QuizFormProps) {
  const router = useRouter();
  const isEdit = !!initialData;
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);

      if (isEdit) {
        await updateQuizAction(initialData.id, formData);
      } else {
        await createQuizAction(formData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle>{isEdit ? "Edit Quiz" : "Create Quiz"}</CardTitle>
        <CardDescription>
          {isEdit
            ? "Update the quiz details below."
            : "Fill in the details to create a new quiz."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              type="text"
              placeholder="e.g. Midterm Exam"
              defaultValue={initialData?.title ?? ""}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              name="description"
              className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Optional description"
              defaultValue={initialData?.description ?? ""}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="duration">Duration (minutes)</Label>
            <Input
              id="duration"
              name="duration"
              type="number"
              min={1}
              placeholder="e.g. 60"
              defaultValue={initialData?.duration ?? ""}
              required
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              id="randomOrder"
              name="randomOrder"
              type="checkbox"
              className="h-4 w-4 rounded border-border text-primary focus:ring-ring"
              defaultChecked={initialData?.randomOrder ?? false}
            />
            <Label htmlFor="randomOrder" className="text-sm font-normal">
              Randomize question order
            </Label>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex gap-2">
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : isEdit ? "Save Changes" : "Create Quiz"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/quizzes")}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
