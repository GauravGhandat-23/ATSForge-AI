import { NextRequest, NextResponse } from "next/server";
import {
  getGoogleAuthConfig,
  validateGoogleAuthConfig,
  generateRandomString,
  generateCodeChallenge,
  buildGoogleAuthUrl,
} from "@/lib/google-auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const from = url.searchParams.get("from") || "/workspace";

  // Resolve client host and protocol (supporting Vercel reverse proxy headers)
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || url.host;
  const proto = request.headers.get("x-forwarded-proto") || (url.protocol.replace(":", "") || "https");
  const origin = `${proto}://${host}`;

  const config = getGoogleAuthConfig(origin);
  const validation = validateGoogleAuthConfig(config);

  if (!validation.valid) {
    console.warn(`[Google OAuth] Missing required environment credentials: ${validation.missing.join(", ")}`);
    const missingParam = encodeURIComponent(validation.missing.join(", "));
    return NextResponse.redirect(
      new URL(`/sign-in?error=missing_credentials&missing=${missingParam}`, origin)
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
  response.cookies.set("atsforge_oauth_redirect_uri", config.callbackUrl, cookieOptions);
  response.cookies.set("atsforge_auth_redirect", from, {
    ...cookieOptions,
    httpOnly: false,
  });

  return response;
}
