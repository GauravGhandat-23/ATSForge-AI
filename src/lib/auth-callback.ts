import { NextRequest, NextResponse } from "next/server";
import {
  getGoogleAuthConfig,
  exchangeGoogleCode,
  getGoogleUserProfile,
} from "./google-auth";
import { db } from "./db";
import { createSessionToken, SESSION_COOKIE_NAME } from "./session";

export async function handleGoogleOAuthCallback(request: NextRequest) {
  const url = new URL(request.url);
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || url.host;
  const proto = request.headers.get("x-forwarded-proto") || (url.protocol.replace(":", "") || "https");
  const origin = `${proto}://${host}`;

  const error = url.searchParams.get("error");
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  // 1. Handle user cancellation or provider error
  if (error) {
    console.warn("[Google OAuth] Authorization returned error:", error);
    if (error === "access_denied") {
      return NextResponse.redirect(new URL("/sign-in?error=google_cancelled", origin));
    }
    return NextResponse.redirect(
      new URL(`/sign-in?error=oauth_error&msg=${encodeURIComponent(error)}`, origin)
    );
  }

  if (!code || !state) {
    return NextResponse.redirect(new URL("/sign-in?error=missing_code", origin));
  }

  // 2. Validate CSRF state
  const savedState = request.cookies.get("atsforge_oauth_state")?.value;
  if (!savedState || savedState !== state) {
    console.error("[Google OAuth] State mismatch. Possible CSRF attack.");
    return NextResponse.redirect(new URL("/sign-in?error=invalid_state", origin));
  }

  // 3. Retrieve PKCE code verifier
  const codeVerifier = request.cookies.get("atsforge_oauth_verifier")?.value;
  if (!codeVerifier) {
    console.error("[Google OAuth] Missing PKCE code verifier in cookies.");
    return NextResponse.redirect(new URL("/sign-in?error=session_expired", origin));
  }

  try {
    const config = getGoogleAuthConfig(origin);
    const redirectUri =
      request.cookies.get("atsforge_oauth_redirect_uri")?.value || config.callbackUrl;

    // 4. Exchange authorization code securely with Google
    const tokens = await exchangeGoogleCode({
      code,
      codeVerifier,
      clientId: config.clientId,
      clientSecret: config.clientSecret,
      redirectUri,
    });

    // 5. Retrieve verified Google profile identity
    const googleProfile = await getGoogleUserProfile(tokens.access_token);

    if (!googleProfile.email_verified) {
      return NextResponse.redirect(new URL("/sign-in?error=unverified_email", origin));
    }

    // 6. Automatically find or create user in database (enforces uniqueness & real profile data)
    const user = await db.findOrCreateGoogleUser({
      google_id: googleProfile.sub,
      email: googleProfile.email,
      name: googleProfile.name,
      first_name: googleProfile.given_name,
      last_name: googleProfile.family_name,
      avatar_url: googleProfile.picture,
      email_verified: googleProfile.email_verified,
    });

    // 7. Issue secure HttpOnly session token
    const sessionToken = await createSessionToken(user);

    // 8. Determine safe redirect destination
    const savedRedirect = request.cookies.get("atsforge_auth_redirect")?.value;
    let targetPath = "/workspace";
    if (savedRedirect && savedRedirect.startsWith("/") && !savedRedirect.startsWith("//")) {
      targetPath = savedRedirect;
    }

    const response = NextResponse.redirect(new URL(targetPath, origin));

    // 9. Set HttpOnly session cookie (7-day duration)
    const isProd = process.env.NODE_ENV === "production";
    response.cookies.set(SESSION_COOKIE_NAME, sessionToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    // 10. Clear temporary OAuth cookies
    response.cookies.delete("atsforge_oauth_state");
    response.cookies.delete("atsforge_oauth_verifier");
    response.cookies.delete("atsforge_oauth_redirect_uri");
    response.cookies.delete("atsforge_auth_redirect");

    return response;
  } catch (err: any) {
    console.error("[Google OAuth] Callback processing failed:", err);
    const safeError = encodeURIComponent(err.message || "Failed to authenticate with Google");
    return NextResponse.redirect(
      new URL(`/sign-in?error=auth_failed&detail=${safeError}`, origin)
    );
  }
}
