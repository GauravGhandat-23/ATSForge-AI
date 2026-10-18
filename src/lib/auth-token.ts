import { SignJWT, jwtVerify } from "jose";
import { UserRecord } from "./types";

export interface SessionPayload {
  userId: string;
  email: string;
  name: string;
  avatar_url?: string;
  iat?: number;
  exp?: number;
}

export const SESSION_COOKIE_NAME = "atsforge_session";

export function getAuthSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      console.warn("WARNING: AUTH_SECRET is not set in production. Using fallback secret.");
    }
    return "atsforge-super-secure-production-ready-oauth-jwt-secret-key-32chars";
  }
  return secret;
}

/**
 * Creates a signed JWT session token for the user (valid for 7 days).
 * Completely Edge & Node compatible (no fs).
 */
export async function createSessionToken(user: UserRecord): Promise<string> {
  const secretKey = new TextEncoder().encode(getAuthSecret());
  return await new SignJWT({
    userId: user.id,
    email: user.email,
    name: user.name,
    avatar_url: user.avatar_url,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secretKey);
}

/**
 * Verifies and decodes a signed JWT session token.
 * Completely Edge & Node compatible (no fs).
 */
export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const secretKey = new TextEncoder().encode(getAuthSecret());
    const { payload } = await jwtVerify(token, secretKey);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}
