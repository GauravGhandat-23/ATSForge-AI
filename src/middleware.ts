import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/auth-token";

const PROTECTED_PREFIXES = [
  "/workspace",
  "/dashboard",
  "/resumes",
  "/resume-builder",
  "/builder",
  "/ats-scanner",
  "/ai-tailor",
  "/cover-letter",
  "/cover-letters",
  "/job-matcher",
  "/job-analyzer",
  "/skills-gap",
  "/interview-prep",
  "/linkedin-generator",
  "/templates",
  "/applications",
  "/settings",
];

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  // Verify JWT session token in Edge runtime
  const session = sessionCookie ? await verifySessionToken(sessionCookie) : null;
  const isAuthenticated = !!session?.userId;

  // 1. Alias /dashboard to /workspace
  if (pathname === "/dashboard") {
    if (!isAuthenticated) {
      const signInUrl = new URL("/sign-in", request.url);
      signInUrl.searchParams.set("from", "/workspace");
      return NextResponse.redirect(signInUrl);
    }
    return NextResponse.redirect(new URL("/workspace", request.url));
  }

  // 2. Redirect authenticated users away from /sign-in and /sign-up
  if (pathname === "/sign-in" || pathname === "/sign-up") {
    if (isAuthenticated) {
      const from = request.nextUrl.searchParams.get("from") || "/workspace";
      const target = from.startsWith("/") && !from.startsWith("//") ? from : "/workspace";
      return NextResponse.redirect(new URL(target, request.url));
    }
    return NextResponse.next();
  }

  // 3. Check protected routes
  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  if (isProtected) {
    if (!isAuthenticated) {
      const signInUrl = new URL("/sign-in", request.url);
      const originalPath = `${pathname}${search || ""}`;
      signInUrl.searchParams.set("from", originalPath);
      return NextResponse.redirect(signInUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (files with extensions like .svg, .png, etc.)
     * - api routes (API protection handled within route handlers or matching api paths)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|pdf)$).*)",
  ],
};
