import { cookies } from "next/headers";

const SESSION_NAME = "participant_session";

interface ParticipantSession {
  participantId: string;
  quizId: string;
}

function encodeSession(data: ParticipantSession): string {
  return Buffer.from(JSON.stringify(data)).toString("base64");
}

function decodeSession(value: string): ParticipantSession | null {
  try {
    const json = Buffer.from(value, "base64").toString("utf-8");
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export async function createParticipantSession(
  participantId: string,
  quizId: string
) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_NAME, encodeSession({ participantId, quizId }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24,
  });
}

export async function getParticipantSession(): Promise<ParticipantSession | null> {
  const cookieStore = await cookies();
  const value = cookieStore.get(SESSION_NAME)?.value;
  if (!value) return null;
  return decodeSession(value);
}

export async function clearParticipantSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_NAME);
}
