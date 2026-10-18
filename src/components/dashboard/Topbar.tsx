"use client";

import React from "react";
import Link from "next/link";
import { Plus, Target, Sparkles, LogOut, Settings } from "lucide-react";
import { useAuth } from "@/components/auth/AuthContext";

export function Topbar({ title }: { title?: string }) {
  const { user, logout } = useAuth();

  const firstName = user?.first_name || (user?.name ? user.name.split(" ")[0] : "Career Builder");

  return (
    <header className="h-16 bg-white border-b border-neutral-200 px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Title & Personalized Greeting */}
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-bold text-neutral-900 tracking-tight">
          {title || "Workspace"}
        </h1>

        {user && (
          <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 text-[11px] font-bold border border-indigo-200">
            <span className="size-1.5 rounded-full bg-indigo-600 animate-pulse" />
            Welcome back, {firstName}
          </span>
        )}
      </div>

      {/* Right User Actions & Profile Avatar */}
      <div className="flex items-center gap-2.5">
        <Link
          href="/ats-scanner"
          className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border border-neutral-200 text-neutral-700 hover:bg-neutral-50 hover:border-neutral-300 transition-colors"
        >
          <Target className="size-3.5 text-indigo-600" />
          ATS Scanner
        </Link>

        <Link
          href="/resume-builder"
          className="inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-xl gradient-ai text-white shadow-xs hover:opacity-95 transition-all"
        >
          <Plus className="size-3.5" />
          Build Resume
        </Link>

        {user && (
          <div className="flex items-center gap-2 pl-2 border-l border-neutral-200 ml-1">
            <Link
              href="/settings"
              className="flex items-center gap-2 p-1 rounded-xl hover:bg-neutral-100 transition-colors"
              title="Account Settings"
            >
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.name}
                  className="size-7 rounded-xl object-cover border border-neutral-200 shadow-xs"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="size-7 rounded-xl bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center">
                  {firstName[0]}
                </div>
              )}
            </Link>

            <button
              onClick={logout}
              className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Sign Out"
            >
              <LogOut className="size-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
