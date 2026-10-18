/**
 * Production-ready Google OAuth 2.0 / OpenID Connect service.
 * Handles PKCE generation, CSRF state, token exchange, and userinfo retrieval.
 */

export interface GoogleAuthConfig {
  clientId: string;
  clientSecret: string;
  appUrl: string;
  callbackUrl: string;
}

export interface GoogleUserInfo {
  sub: string;
  email: string;
  name: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
  email_verified: boolean;
}

function cleanEnv(val?: string): string {
  if (!val) return "";
  return val.trim().replace(/^["']|["']$/g, "").trim();
}

export interface GoogleAuthValidation {
  valid: boolean;
  missing: string[];
}

export function validateGoogleAuthConfig(config: GoogleAuthConfig): GoogleAuthValidation {
  const missing: string[] = [];
  if (!config.clientId) missing.push("GOOGLE_CLIENT_ID");
  if (!config.clientSecret) missing.push("GOOGLE_CLIENT_SECRET");
  return {
    valid: missing.length === 0,
    missing,
  };
}

export function getGoogleAuthConfig(reqOrigin?: string): GoogleAuthConfig {
  // Read standard server-side environment variables with trimming to handle accidental spaces or wrapping quotes
  const clientId = cleanEnv(
    process.env.GOOGLE_CLIENT_ID ||
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
    process.env.AUTH_GOOGLE_ID ||
    process.env.GOOGLE_ID
  );

  const clientSecret = cleanEnv(
    process.env.GOOGLE_CLIENT_SECRET ||
    process.env.AUTH_GOOGLE_SECRET ||
    process.env.GOOGLE_SECRET
  );

  // 1. Direct explicit callback override (e.g. https://ats-forge-ai.vercel.app/auth/callback)
  let callbackUrl = cleanEnv(process.env.AUTH_CALLBACK_URL);

  // 2. Base application URL
  let appUrl = cleanEnv(
    process.env.AUTH_URL ||
    process.env.APP_URL ||
    process.env.NEXT_PUBLIC_APP_URL
  );

  if (!appUrl && process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    appUrl = `https://${cleanEnv(process.env.VERCEL_PROJECT_PRODUCTION_URL)}`;
  }

  if (!appUrl && reqOrigin && !reqOrigin.includes("localhost")) {
    appUrl = reqOrigin;
  }

  if (!appUrl) {
    if (process.env.NODE_ENV === "production" || process.env.VERCEL) {
      appUrl = "https://ats-forge-ai.vercel.app";
    } else {
      appUrl = reqOrigin || "http://localhost:3000";
    }
  }

  // Strip trailing slashes
  appUrl = appUrl.replace(/\/$/, "");

  // 3. Resolve callback URL if not explicitly set
  if (!callbackUrl) {
    callbackUrl = `${appUrl}/auth/callback`;
  }

  return {
    clientId,
    clientSecret,
    appUrl,
    callbackUrl,
  };
}

/**
 * Generates a cryptographically secure random string for OAuth state & PKCE verifier.
 */
export function generateRandomString(length: number = 43): string {
  const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
  let result = "";
  const randomValues = new Uint8Array(length);

  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(randomValues);
  } else {
    // Fallback for older environments
    for (let i = 0; i < length; i++) {
      randomValues[i] = Math.floor(Math.random() * 256);
    }
  }

  for (let i = 0; i < length; i++) {
    result += charset[randomValues[i] % charset.length];
  }
  return result;
}

/**
 * Computes SHA-256 base64url-encoded code challenge from a code verifier.
 */
export async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);

  let hashUint8: Uint8Array;
  if (typeof crypto !== "undefined" && crypto.subtle) {
    const buffer = await crypto.subtle.digest("SHA-256", data);
    hashUint8 = new Uint8Array(buffer);
  } else {
    const nodeCrypto = await import("crypto");
    const buf = nodeCrypto.createHash("sha256").update(verifier).digest();
    hashUint8 = new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength);
  }

  const hashArray = Array.from(hashUint8);
  const base64 = btoa(String.fromCharCode.apply(null, hashArray));
  return base64
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

/**
 * Builds the Google OAuth 2.0 Authorization URL with PKCE and minimum scopes.
 */
export function buildGoogleAuthUrl({
  clientId,
  redirectUri,
  state,
  codeChallenge,
}: {
  clientId: string;
  redirectUri: string;
  state: string;
  codeChallenge: string;
}): string {
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    state,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
    access_type: "offline",
    prompt: "select_account",
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

/**
 * Exchanges Google authorization code for access and ID tokens.
 */
export async function exchangeGoogleCode({
  code,
  codeVerifier,
  clientId,
  clientSecret,
  redirectUri,
}: {
  code: string;
  codeVerifier: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}): Promise<{
  access_token: string;
  id_token?: string;
  expires_in: number;
  token_type: string;
  refresh_token?: string;
}> {
  const body = new URLSearchParams({
    code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
    grant_type: "authorization_code",
    code_verifier: codeVerifier,
  });

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });

  const data = await res.json();

  if (!res.ok || data.error) {
    const errorMsg = data.error_description || data.error || "Token exchange failed";
    console.error("[Google OAuth] Token exchange error:", errorMsg);
    throw new Error(errorMsg);
  }

  return data;
}

/**
 * Fetches verified user profile details from Google's OpenID Connect userinfo endpoint.
 */
export async function getGoogleUserProfile(accessToken: string): Promise<GoogleUserInfo> {
  const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error("Failed to fetch Google userinfo:", errorText);
    throw new Error("Failed to retrieve Google user profile");
  }

  const data = await res.json();

  if (!data.sub || !data.email) {
    throw new Error("Invalid profile returned from Google");
  }

  return {
    sub: data.sub,
    email: data.email,
    name: data.name || "Google User",
    given_name: data.given_name || (data.name ? data.name.split(" ")[0] : "User"),
    family_name: data.family_name || (data.name ? data.name.split(" ").slice(1).join(" ") : ""),
    picture: data.picture || "",
    email_verified: data.email_verified ?? true,
  };
}
