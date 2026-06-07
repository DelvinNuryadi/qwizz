import { db } from "@/lib/db";
import { quiz } from "../../drizzle/schema/quiz-schema";
import { eq } from "drizzle-orm";

const CHARACTERS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const CODE_LENGTH = 6;

function generateRawCode(): string {
  let code = "";
  for (let i = 0; i < CODE_LENGTH; i++) {
    code += CHARACTERS[Math.floor(Math.random() * CHARACTERS.length)];
  }
  return code;
}

export async function generateJoinCode(): Promise<string> {
  for (let attempt = 0; attempt < 10; attempt++) {
    const code = generateRawCode();
    const existing = await db
      .select({ id: quiz.id })
      .from(quiz)
      .where(eq(quiz.joinCode, code))
      .limit(1);

    if (existing.length === 0) {
      return code;
    }
  }

  throw new Error("Failed to generate unique join code after 10 attempts");
}
