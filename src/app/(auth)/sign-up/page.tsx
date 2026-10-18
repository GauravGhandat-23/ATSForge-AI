"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
} from "lucide-react";

function SignUpContent() {
  const searchParams = useSearchParams();
  const [authState, setAuthState] = useState<"normal" | "loading" | "success">("normal");

  const fromParam = searchParams.get("from") || "/workspace";

  const handleGoogleSignUp = () => {
    setAuthState("loading");
    window.location.href = `/api/auth/google?from=${encodeURIComponent(fromParam)}`;
  };

  return (
    <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 gap-8 lg:gap-12 items-center">
      {/* Left side: Value proposition */}
      <div className="lg:col-span-7 space-y-8 pr-0 lg:pr-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold">
          <Sparkles className="size-3.5 text-emerald-400" />
          <span>Quick 1-Click Setup with Google</span>
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Supercharge your job hunt with <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-indigo-400">ATSForge AI</span>
          </h1>
          <p className="text-sm sm:text-base text-neutral-400 max-w-xl leading-relaxed">
            Create your account in seconds using Google. Build tailored, high-scoring ATS resumes, match job descriptions, and organize applications effortlessly.
          </p>
        </div>

        {/* Account benefits */}
        <div className="space-y-3.5 pt-2">
          <div className="flex items-start gap-3">
            <div className="size-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
              <CheckCircle2 className="size-3.5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-neutral-200">Personalized Career Cloud</p>
              <p className="text-xs text-neutral-400">Save unlimited resumes, versions, ATS scan histories, and cover letters securely.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="size-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
              <CheckCircle2 className="size-3.5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-neutral-200">Manual Job Tracker &amp; Analytics</p>
              <p className="text-xs text-neutral-400">Track application dates, interview stages, and recruiter contacts privately.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="size-5 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0 mt-0.5">
              <CheckCircle2 className="size-3.5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-neutral-200">Zero Password Friction</p>
              <p className="text-xs text-neutral-400">No passwords to memorize or lose. Protected by Google&apos;s verified OAuth 2.0 / OIDC identity protocol.</p>
            </div>
          </div>
        </div>

        {/* Security badge */}
        <div className="flex items-center gap-2 text-xs text-neutral-400 pt-2">
          <Lock className="size-3.5 text-emerald-400" />
          <span>Minimum permissions requested: <strong>openid, email, profile</strong></span>
        </div>
      </div>

      {/* Right side: Auth Card */}
      <div className="lg:col-span-5 w-full">
        <div className="p-6 sm:p-8 rounded-3xl bg-neutral-950/80 border border-neutral-800 shadow-2xl backdrop-blur-xl relative overflow-hidden">
          <div className="absolute -top-24 -right-24 size-48 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />

          <div className="space-y-2 mb-6">
            <h2 className="text-2xl font-bold text-white tracking-tight">Create your ATSForge AI account</h2>
            <p className="text-xs sm:text-sm text-neutral-400">
              Build, optimize, and manage your career documents in one place.
            </p>
          </div>

          <div className="space-y-4">
            <button
              onClick={handleGoogleSignUp}
              disabled={authState === "loading"}
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
                {authState === "loading" ? "Connecting to Google..." : "Continue with Google"}
              </span>
            </button>

            <div className="p-3.5 rounded-2xl bg-neutral-900/60 border border-neutral-800/80 text-[11px] text-neutral-400 space-y-1">
              <div className="flex items-center gap-1.5 font-medium text-neutral-300">
                <ShieldCheck className="size-3.5 text-emerald-400" />
                <span>Verified Google Identity Protection</span>
              </div>
              <p>
                By continuing, you agree to ATSForge AI&apos;s Terms of Service and Privacy Policy. Your verified Google email prevents duplicate accounts.
              </p>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-neutral-800/80 text-center text-xs text-neutral-400">
            Already have an account?{" "}
            <Link
              href={`/sign-in?from=${encodeURIComponent(fromParam)}`}
              className="font-bold text-emerald-400 hover:text-emerald-300 transition-colors inline-flex items-center gap-1"
            >
              Sign in <ArrowRight className="size-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={<div className="flex-1 flex items-center justify-center p-12 text-sm text-neutral-400">Loading sign up...</div>}>
      <SignUpContent />
    </Suspense>
  );
}
