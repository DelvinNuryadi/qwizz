"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Image, Eye, EyeOff, X } from "lucide-react";
import { QuestionEditor } from "@/components/tiptap-templates/simple/question-editor";
import { AnswerEditor } from "@/components/tiptap-templates/simple/answer-editor";
import { LatexHtml } from "@/components/shared/LatexHtml";
import {
  addQuestionAction,
  updateQuestionAction,
} from "@/app/(instructor)/quizzes/[id]/actions";
import type { QuestionWithAnswers } from "@/types/question";

interface AnswerRow {
  id?: string;
  text: string;
}

interface QuestionFormProps {
  quizId: string;
  initialData?: QuestionWithAnswers;
  onClose: () => void;
}

export default function QuestionForm({ quizId, initialData, onClose }: QuestionFormProps) {
  const isEdit = !!initialData;
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [correctIndex, setCorrectIndex] = useState(
    initialData?.answers.findIndex((a) => a.isCorrect) ?? 0
  );
  const [answers, setAnswers] = useState<AnswerRow[]>(
    initialData
      ? initialData.answers.map((a) => ({ id: a.id, text: a.text }))
      : [{ text: "" }, { text: "" }]
  );
  const [imagePreview, setImagePreview] = useState<string | null>(
    initialData?.imageUrl ?? null
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [previewAnswers, setPreviewAnswers] = useState<number[]>([]);
  const [questionHtml, setQuestionHtml] = useState(initialData?.text ?? "<p></p>");
  const fileInputRef = useRef<HTMLInputElement>(null);

  function addAnswer() {
    if (answers.length >= 5) return;
    setAnswers([...answers, { text: "" }]);
  }

  function removeAnswer(index: number) {
    if (answers.length <= 2) return;
    const updated = answers.filter((_, i) => i !== index);
    setAnswers(updated);
    if (correctIndex === index) {
      setCorrectIndex(0);
    } else if (correctIndex > index) {
      setCorrectIndex(correctIndex - 1);
    }
  }

  function updateAnswer(index: number, text: string) {
    const updated = answers.map((a, i) => (i === index ? { ...a, text } : a));
    setAnswers(updated);
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    setRemoveImage(false);
    setImagePreview(URL.createObjectURL(file));
  }

  function handleRemoveImage() {
    setImageFile(null);
    setImagePreview(null);
    setRemoveImage(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);

      if (imageFile) {
        formData.set("image", imageFile);
      } else {
        formData.delete("image");
      }

      if (removeImage) {
        formData.set("removeImage", "true");
      }

      if (isEdit && initialData) {
        await updateQuestionAction(initialData.id, formData);
      } else {
        await addQuestionAction(quizId, formData);
      }

      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border p-4">
      <div className="grid gap-2">
        <Label htmlFor="text">Question</Label>
        <input
          type="hidden"
          name="text"
          value={questionHtml}
        />
        <QuestionEditor
          value={initialData?.text ?? "<p></p>"}
          onChange={setQuestionHtml}
        />
      </div>

      <div className="grid gap-2">
        <Label>Image (optional)</Label>
        {imagePreview ? (
          <div className="relative inline-flex">
            <img
              src={imagePreview}
              alt="Preview"
              className="max-h-48 max-w-xs rounded-md border object-contain"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRemoveImage}
              className="absolute top-1 right-1 size-6 rounded-full bg-background/80 p-0"
            >
              <X className="size-4" />
            </Button>
          </div>
        ) : (
          <div>
            <input
              ref={fileInputRef}
              id="image"
              name="image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              <Image className="mr-2 size-4" />
              Choose Image
            </Button>
          </div>
        )}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="points">Points</Label>
        <Input
          id="points"
          name="points"
          type="number"
          min={1}
          defaultValue={initialData?.points ?? 1}
          required
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Answers</Label>
          {answers.length < 5 && (
            <Button type="button" variant="outline" size="sm" onClick={addAnswer}>
              + Add Answer
            </Button>
          )}
        </div>
        {answers.map((answer, index) => (
          <div key={index} className="space-y-1">
            <div className="flex items-start gap-2">
              <input
                type="radio"
                name="correctIndex"
                value={index}
                checked={correctIndex === index}
                onChange={() => setCorrectIndex(index)}
                className="mt-3 h-4 w-4 shrink-0 text-primary focus:ring-ring"
              />
              <div className="flex-1">
                {answer.id && (
                  <input
                    type="hidden"
                    name={`answer_id_${index}`}
                    value={answer.id}
                  />
                )}
                <input
                  type="hidden"
                  name={`answer_${index}`}
                  value={answer.text}
                />
                <AnswerEditor
                  value={answer.text}
                  onChange={(html) => updateAnswer(index, html)}
                  placeholder={`Answer ${index + 1}`}
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() =>
                  setPreviewAnswers((prev) =>
                    prev.includes(index)
                      ? prev.filter((i) => i !== index)
                      : [...prev, index]
                  )
                }
                className="mt-1"
                title="Toggle preview"
              >
                {previewAnswers.includes(index) ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </Button>
              {answers.length > 2 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeAnswer(index)}
                  className="mt-1 text-destructive"
                >
                  X
                </Button>
              )}
            </div>
            {previewAnswers.includes(index) && answer.text && (
              <div className="ml-6 rounded-md border bg-muted/30 p-2 text-sm">
                <LatexHtml html={answer.text} />
              </div>
            )}
          </div>
        ))}
        <p className="text-xs text-muted-foreground">
          Select the radio button next to the correct answer.
        </p>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-2">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : isEdit ? "Save Changes" : "Add Question"}
        </Button>
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
