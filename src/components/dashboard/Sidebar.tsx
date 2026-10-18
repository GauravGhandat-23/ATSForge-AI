"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  PlusCircle,
  FileText,
  Layers,
  History,
  Target,
  Sparkles,
  Search,
  Send,
  Linkedin,
  MessageSquare,
  TrendingUp,
  Briefcase,
  FileCheck2,
  Bookmark,
  ClipboardList,
  User,
  Settings,
  LogOut,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { useAuth } from "@/components/auth/AuthContext";

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const navSections: NavSection[] = [
    {
      title: "Resume",
      items: [
        { name: "Resume Builder", href: "/resume-builder", icon: PlusCircle, badge: "AI" },
        { name: "My Resumes", href: "/resumes", icon: FileText },
        { name: "Templates", href: "/templates", icon: Layers },
        { name: "Versions", href: "/versions", icon: History },
      ],
    },
    {
      title: "ATS Tools",
      items: [
        { name: "ATS Scanner", href: "/ats-scanner", icon: Target },
        { name: "Resume Tailor", href: "/ai-tailor", icon: Sparkles },
        { name: "Job Description Analyzer", href: "/job-analyzer", icon: Search },
      ],
    },
    {
      title: "Career AI",
      items: [
        { name: "Cover Letter", href: "/cover-letter", icon: Send },
        { name: "LinkedIn Profile", href: "/linkedin-generator", icon: Linkedin },
        { name: "Interview Prep", href: "/interview-prep", icon: MessageSquare },
        { name: "Skills Gap", href: "/skills-gap", icon: TrendingUp },
      ],
    },
    {
      title: "Jobs",
      items: [
        { name: "Job Search", href: "/job-search", icon: Briefcase },
        { name: "Job Matcher", href: "/job-matcher", icon: FileCheck2 },
        { name: "Saved Jobs", href: "/saved-jobs", icon: Bookmark },
        { name: "Application Tracker", href: "/applications", icon: ClipboardList },
      ],
    },
    {
      title: "Account",
      items: [
        { name: "Profile", href: "/profile", icon: User },
        { name: "Settings", href: "/settings", icon: Settings },
      ],
    },
  ];

  return (
    <aside
      id="sidebar"
      className="w-64 bg-white border-r border-neutral-200 flex flex-col justify-between shrink-0 h-screen sticky top-0 overflow-y-auto z-40 select-none scrollbar-thin"
    >
      <div>
        {/* Logo */}
        <div className="h-16 flex items-center px-5 border-b border-neutral-100">
          <Link href="/" className="flex items-center gap-2.5 font-bold text-base text-neutral-900 group">
            <div className="size-8 rounded-lg gradient-ai flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Sparkles className="size-4" />
            </div>
            <div className="flex flex-col">
              <span className="tracking-tight leading-tight">
                ATSForge <span className="text-indigo-600">AI</span>
              </span>
              <span className="text-[9px] font-medium text-neutral-400 -mt-0.5">
                Vercel Cloud Edition
              </span>
            </div>
          </Link>
        </div>

        {/* Dashboard Top Link */}
        <div className="px-3 pt-3">
          <Link
            href="/workspace"
            className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all ${
              pathname === "/workspace" || pathname === "/dashboard"
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100/80"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <LayoutDashboard
                className={`size-4 ${
                  pathname === "/workspace" || pathname === "/dashboard"
                    ? "text-white"
                    : "text-neutral-500"
                }`}
              />
              <span>Dashboard</span>
            </div>
          </Link>
        </div>

        {/* Navigation Sections */}
        <nav className="p-3 space-y-4">
          {navSections.map((section) => (
            <div key={section.title} className="space-y-1">
              <div className="px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-neutral-400">
                {section.title}
              </div>
              {section.items.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/workspace" && pathname.startsWith(item.href));
                const Icon = item.icon;

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? "bg-indigo-50 text-indigo-700 font-bold shadow-xs"
                        : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100/70"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Icon
                        className={`size-3.5 shrink-0 ${
                          isActive ? "text-indigo-600" : "text-neutral-400"
                        }`}
                      />
                      <span className="truncate">{item.name}</span>
                    </div>
                    {item.badge && (
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded uppercase bg-indigo-100 text-indigo-700 shrink-0">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
      </div>

      {/* Bottom Area: Authenticated User Profile & Sign Out */}
      <div className="p-3 border-t border-neutral-100 space-y-2 mt-auto">
        {user ? (
          <div className="p-2.5 rounded-2xl bg-neutral-50 border border-neutral-200/80 space-y-2">
            <div className="flex items-center gap-2">
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.name}
                  className="size-7 rounded-xl object-cover border border-neutral-200 shrink-0"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="size-7 rounded-xl bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0">
                  {user.first_name ? user.first_name[0] : "U"}
                </div>
              )}

              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-neutral-900 truncate leading-tight">{user.name}</p>
                <div className="flex items-center gap-1 text-[10px] text-emerald-700 font-semibold">
                  <CheckCircle2 className="size-2.5 text-emerald-600 shrink-0" />
                  <span className="truncate">Google Account</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 pt-0.5">
              <Link
                href="/profile"
                className="flex-1 text-center py-1 px-2 rounded-lg border border-neutral-200 hover:bg-neutral-100 text-neutral-700 text-[11px] font-semibold transition-colors truncate"
              >
                Profile
              </Link>
              <button
                onClick={logout}
                className="py-1 px-2.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 text-[11px] font-semibold transition-colors flex items-center gap-1 shrink-0"
                title="Sign out of ATSForge AI"
              >
                <LogOut className="size-3" />
                <span>Exit</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-200/80">
            <div className="flex items-center gap-1.5 mb-1 text-[11px] font-bold text-neutral-800">
              <ShieldCheck className="size-3 text-indigo-600 shrink-0" />
              <span>Google OAuth</span>
            </div>
            <Link
              href="/sign-in"
              className="text-xs text-indigo-600 font-semibold hover:underline block"
            >
              Sign In to Save &rarr;
            </Link>
          </div>
        )}
      </div>
    </aside>
  );
}
