"use client";

import { LatexText } from "@/components/shared/LatexText";
import { CheckCircle, XCircle } from "lucide-react";

interface ResultItemProps {
  index: number;
  questionText: string;
  points: number;
  isCorrect: boolean;
  selectedAnswerText: string | null;
  correctAnswerText: string;
}

export function ResultItem({
  index,
  questionText,
  points,
  isCorrect,
  selectedAnswerText,
  correctAnswerText,
}: ResultItemProps) {
  return (
    <div
      className={`rounded-lg border p-4 ${
        isCorrect ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <p className="font-medium">
            <span className="text-muted-foreground">{index + 1}.</span>{" "}
            <LatexText text={questionText} />
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {points} pt{points !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex-shrink-0">
          {isCorrect ? (
            <CheckCircle className="h-5 w-5 text-green-600" />
          ) : (
            <XCircle className="h-5 w-5 text-red-600" />
          )}
        </div>
      </div>
      <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-sm">
        {selectedAnswerText ? (
          <p>
            Your answer:{" "}
            <span
              className={
                isCorrect
                  ? "font-medium text-green-700"
                  : "font-medium text-red-700"
              }
            >
              <LatexText text={selectedAnswerText} />
            </span>
          </p>
        ) : (
          <p className="font-medium text-amber-700">Not answered</p>
        )}
        {!isCorrect && (
          <p>
            Correct answer:{" "}
            <span className="font-medium text-green-700">
              <LatexText text={correctAnswerText} />
            </span>
          </p>
        )}
      </div>
    </div>
  );
}
