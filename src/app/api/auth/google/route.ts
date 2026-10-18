import { NextRequest, NextResponse } from "next/server";
import {
  getGoogleAuthConfig,
  generateRandomString,
  generateCodeChallenge,
  buildGoogleAuthUrl,
} from "@/lib/google-auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const from = url.searchParams.get("from") || "/workspace";
  const origin = url.origin;

  const config = getGoogleAuthConfig(origin);

  if (!config.clientId || !config.clientSecret) {
    console.error("[Google OAuth] Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET.");
    return NextResponse.redirect(
      new URL("/sign-in?error=missing_credentials", origin)
    );
  }

  // 1. Generate CSRF state and PKCE verifier
  const state = generateRandomString(32);
  const codeVerifier = generateRandomString(64);
  const codeChallenge = await generateCodeChallenge(codeVerifier);

  // 2. Build official Google OAuth 2.0 URL
  const googleAuthUrl = buildGoogleAuthUrl({
    clientId: config.clientId,
    redirectUri: config.callbackUrl,
    state,
    codeChallenge,
  });

  const response = NextResponse.redirect(googleAuthUrl);

  const isProd = process.env.NODE_ENV === "production";
  const cookieOptions = {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax" as const,
    path: "/",
    maxAge: 600, // 10 minutes
  };

  // 3. Store OAuth verification state in temporary secure cookies
  response.cookies.set("atsforge_oauth_state", state, cookieOptions);
  response.cookies.set("atsforge_oauth_verifier", codeVerifier, cookieOptions);
  response.cookies.set("atsforge_auth_redirect", from, {
    ...cookieOptions,
    httpOnly: false, // Accessible if needed
  });

  return response;
}
