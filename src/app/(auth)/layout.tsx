import React from "react";
import Link from "next/link";
import { Sparkles, ArrowLeft } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-neutral-900 text-neutral-100 selection:bg-indigo-500 selection:text-white">
      {/* Top Bar */}
      <header className="h-16 px-6 sm:px-12 flex items-center justify-between border-b border-neutral-800/80 bg-neutral-950/60 backdrop-blur-md sticky top-0 z-50">
        <Link href="/" className="flex items-center gap-2.5 font-bold text-base text-white group">
          <div className="size-8 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
            <Sparkles className="size-4" />
          </div>
          <div className="flex flex-col">
            <span className="tracking-tight leading-tight">
              ATSForge <span className="text-indigo-400">AI</span>
            </span>
          </div>
        </Link>

        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-400 hover:text-white transition-colors py-1.5 px-3 rounded-lg hover:bg-neutral-800/60"
        >
          <ArrowLeft className="size-3.5" />
          <span>Back to Home</span>
        </Link>
      </header>

      {/* Auth Content */}
      <div className="flex-1 flex items-stretch">
        {children}
      </div>
    </div>
  );
}
