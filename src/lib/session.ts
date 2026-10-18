import { cookies } from "next/headers";
import { db } from "./db";
import { UserRecord } from "./types";
import {
  SESSION_COOKIE_NAME,
  createSessionToken,
  verifySessionToken,
  SessionPayload,
} from "./auth-token";

export { SESSION_COOKIE_NAME, createSessionToken, verifySessionToken };
export type { SessionPayload };

/**
 * Retrieves the currently authenticated user from cookies.
 * For use in Node.js runtime API routes and Server Components.
 */
export async function getCurrentUser(): Promise<UserRecord | null> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!token) return null;

    const payload = await verifySessionToken(token);
    if (!payload?.userId) return null;

    const user = await db.getUserById(payload.userId);
    return user || null;
  } catch {
    return null;
  }
}

/**
 * Enforces authentication. Throws or returns 401 response if user is unauthenticated.
 */
export async function requireAuth(): Promise<UserRecord> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("UNAUTHORIZED");
  }
  return user;
}
