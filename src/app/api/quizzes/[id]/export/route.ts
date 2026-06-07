import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { question } from "../../../../../../drizzle/schema/quiz-schema";
import { eq } from "drizzle-orm";
import { getQuizById, getQuizOwnerId } from "@/models/quiz";
import { getQuizSubmissions } from "@/models/submission";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const session = await auth.api.getSession({
    headers: _request.headers,
  });

  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const ownerId = await getQuizOwnerId(id);
  if (!ownerId || ownerId !== session.user.id) {
    return new NextResponse("Not found", { status: 404 });
  }

  const quizData = await getQuizById(id);
  if (!quizData) {
    return new NextResponse("Not found", { status: 404 });
  }

  const submissions = await getQuizSubmissions(id);

  const questions = await db
    .select({ points: question.points })
    .from(question)
    .where(eq(question.quizId, id));

  const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);

  const headerRow = ["NIM", "Name", "Score", "Total Points", "Percentage", "Submitted At"];
  const rows = submissions.map((s) => {
    const percentage = totalPoints > 0
      ? `${Math.round(((s.score ?? 0) / totalPoints) * 100)}%`
      : "0%";

    return [
      s.nim,
      s.name,
      String(s.score ?? 0),
      String(totalPoints),
      percentage,
      new Date(s.submittedAt).toISOString(),
    ];
  });

  const csvContent = [
    headerRow.join(","),
    ...rows.map((r) => r.map((v) => `"${v.replace(/"/g, '""')}"`).join(",")),
  ].join("\n");

  return new NextResponse(csvContent, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${quizData.title.replace(/[^a-zA-Z0-9]/g, "_")}_results.csv"`,
    },
  });
}
