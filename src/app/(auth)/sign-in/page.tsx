"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  FileText,
  Target,
  Zap,
  Lock,
  ArrowRight,
} from "lucide-react";

function SignInContent() {
  const searchParams = useSearchParams();
  const [authState, setAuthState] = useState<"normal" | "loading" | "success" | "error">("normal");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const errorParam = searchParams.get("error");
  const fromParam = searchParams.get("from") || "/workspace";

  useEffect(() => {
    if (errorParam) {
      setAuthState("error");
      switch (errorParam) {
        case "missing_credentials":
          setErrorMessage(
            "Google OAuth credentials missing: Please configure GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in your .env.local file to enable live Google Sign-In."
          );
          break;
        case "google_cancelled":
          setErrorMessage("Google sign-in was cancelled.");
          break;
        case "invalid_state":
          setErrorMessage("Invalid session state. Please try again.");
          break;
        case "session_expired":
          setErrorMessage("Session expired. Please try signing in again.");
          break;
        case "unverified_email":
          setErrorMessage("Please sign in with a verified Google email address.");
          break;
        default:
          setErrorMessage("Unable to complete Google sign-in. Please try again.");
      }
    }
  }, [errorParam]);

  const handleGoogleSignIn = () => {
    setAuthState("loading");
    setErrorMessage(null);

    // Redirect to real Google OAuth initiator endpoint
    const targetUrl = `/api/auth/google?from=${encodeURIComponent(fromParam)}`;
    window.location.href = targetUrl;
  };

  return (
    <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 gap-8 lg:gap-12 items-center">
      {/* Left side: Branding & Value Proposition */}
      <div className="lg:col-span-7 space-y-8 pr-0 lg:pr-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold">
          <Sparkles className="size-3.5 text-indigo-400" />
          <span>Real Google Authentication &bull; Secure User Isolation</span>
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Accelerate your career with <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400">ATSForge AI</span>
          </h1>
          <p className="text-sm sm:text-base text-neutral-400 max-w-xl leading-relaxed">
            Create ATS-compliant resumes, scan match scores with 8-factor deterministic algorithms, and track applications with full data ownership.
          </p>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="p-4 rounded-2xl bg-neutral-950/40 border border-neutral-800/80 space-y-1.5">
            <div className="size-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <FileText className="size-4" />
            </div>
            <h3 className="text-sm font-bold text-neutral-200">User-Owned Resumes</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Your resumes, versions, and edits are securely isolated to your verified Google account.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-neutral-950/40 border border-neutral-800/80 space-y-1.5">
            <div className="size-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Target className="size-4" />
            </div>
            <h3 className="text-sm font-bold text-neutral-200">Deterministic ATS Scoring</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Scored on 8 deterministic factors including keyword density, action metrics, and formatting.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-neutral-950/40 border border-neutral-800/80 space-y-1.5">
            <div className="size-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Zap className="size-4" />
            </div>
            <h3 className="text-sm font-bold text-neutral-200">AI Tailoring &amp; Cover Letters</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Target job descriptions instantly with customized bullet points and cover letter drafts.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-neutral-950/40 border border-neutral-800/80 space-y-1.5">
            <div className="size-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <ShieldCheck className="size-4" />
            </div>
            <h3 className="text-sm font-bold text-neutral-200">Encrypted HttpOnly Sessions</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Zero storage of auth tokens in localStorage. Strict cookie security with SameSite protection.
            </p>
          </div>
        </div>

        {/* Security Assurance */}
        <div className="flex items-center gap-3 pt-2 text-xs text-neutral-400">
          <div className="flex items-center gap-1.5">
            <Lock className="size-3.5 text-emerald-400" />
            <span>OAuth 2.0 / OpenID Connect</span>
          </div>
          <span>&bull;</span>
          <span>Zero Password Storage</span>
          <span>&bull;</span>
          <span>Single-Click Access</span>
        </div>
      </div>

      {/* Right side: Authentication Card */}
      <div className="lg:col-span-5 w-full">
        <div className="p-6 sm:p-8 rounded-3xl bg-neutral-950/80 border border-neutral-800 shadow-2xl backdrop-blur-xl relative overflow-hidden">
          <div className="absolute -top-24 -right-24 size-48 rounded-full bg-indigo-500/15 blur-3xl pointer-events-none" />

          <div className="space-y-2 mb-6">
            <h2 className="text-2xl font-bold text-white tracking-tight">Welcome back</h2>
            <p className="text-xs sm:text-sm text-neutral-400">
              Sign in to continue building better resumes and advancing your career.
            </p>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-200 text-xs flex items-start gap-3">
              <AlertCircle className="size-4 text-red-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-semibold block">Authentication Notice</span>
                <p className="text-red-300/90 leading-relaxed">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Authentication Actions */}
          <div className="space-y-4">
            <button
              onClick={handleGoogleSignIn}
              disabled={authState === "loading" || authState === "success"}
              className="w-full flex items-center justify-center gap-3 px-5 py-3.5 rounded-2xl bg-white hover:bg-neutral-100 text-neutral-900 font-semibold text-sm transition-all shadow-lg shadow-black/20 hover:shadow-xl active:scale-[0.99] disabled:opacity-75 disabled:cursor-wait"
            >
              <svg className="size-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>

              <span>
                {authState === "loading"
                  ? "Connecting to Google..."
                  : authState === "success"
                  ? "Signing you in..."
                  : "Continue with Google"}
              </span>
            </button>

            <div className="p-3 rounded-2xl bg-neutral-900/60 border border-neutral-800/80 text-[11px] text-neutral-400 space-y-1">
              <div className="flex items-center gap-1.5 font-medium text-neutral-300">
                <CheckCircle2 className="size-3.5 text-emerald-400" />
                <span>Automated Account Discovery</span>
              </div>
              <p>
                If you already have an account, you will be signed in. If not, your account will be created automatically.
              </p>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-neutral-800/80 text-center text-xs text-neutral-400">
            Don&apos;t have an account?{" "}
            <Link
              href={`/sign-up?from=${encodeURIComponent(fromParam)}`}
              className="font-bold text-indigo-400 hover:text-indigo-300 transition-colors inline-flex items-center gap-1"
            >
              Sign up <ArrowRight className="size-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="flex-1 flex items-center justify-center p-12 text-sm text-neutral-400">Loading sign in...</div>}>
      <SignInContent />
    </Suspense>
  );
}
