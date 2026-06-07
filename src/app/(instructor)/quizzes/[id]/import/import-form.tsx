"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { importQuestionsAction } from "../actions";

interface ImportFormProps {
  quizId: string;
}

export function ImportForm({ quizId }: ImportFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const file = formData.get("file") as File | null;

    if (!file) {
      setError("Please select a CSV file");
      setLoading(false);
      return;
    }

    if (!file.name.endsWith(".csv")) {
      setError("Only .csv files are supported");
      setLoading(false);
      return;
    }

    try {
      await importQuestionsAction(quizId, formData);
    } catch {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="rounded-lg border p-6">
        <label
          htmlFor="csv-file"
          className="flex cursor-pointer flex-col items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <div className="flex h-20 w-full items-center justify-center rounded-md border-2 border-dashed bg-muted/20">
            <span>Click to select CSV file</span>
          </div>
          <input
            id="csv-file"
            name="file"
            type="file"
            accept=".csv"
            className="hidden"
          />
        </label>
      </div>

      {error && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="flex gap-3">
        <Button type="submit" disabled={loading}>
          {loading ? "Importing..." : "Import Questions"}
        </Button>
      </div>
    </form>
  );
}
