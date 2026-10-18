"use client";

import React from "react";
import Link from "next/link";
import {
  Sparkles,
  Share2,
  Compass,
  GraduationCap,
  Briefcase,
  Send,
  Target,
  ArrowRight,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { Topbar } from "@/components/dashboard/Topbar";

export default function CareerToolsPage() {
  const tools = [
    {
      title: "LinkedIn Profile Generator",
      desc: "Generate recruiter-friendly headlines, about bio, and skill endorsements aligned with your resume.",
      href: "/linkedin-generator",
      icon: Share2,
      badge: "Recruiter Ready",
      color: "from-blue-600 to-indigo-600",
    },
    {
      title: "Interview Prep Simulator",
      desc: "Simulate technical, HR, behavioral, and STAR questions with interactive scoring and feedback.",
      href: "/interview-prep",
      icon: Compass,
      badge: "Interactive",
      color: "from-purple-600 to-indigo-600",
    },
    {
      title: "Skills Gap Analysis",
      desc: "Compare your resume against any job posting to see strong, partial, and missing proficiencies.",
      href: "/skills-gap",
      icon: GraduationCap,
      badge: "Roadmap Included",
      color: "from-emerald-600 to-teal-600",
    },
    {
      title: "Job Description Intelligence",
      desc: "Extract hard skills, soft competencies, and experience thresholds from raw job postings.",
      href: "/job-analyzer",
      icon: Briefcase,
      badge: "Deep Parser",
      color: "from-amber-600 to-orange-600",
    },
    {
      title: "AI Resume Tailoring",
      desc: "Automatically optimize your bullets, summary, and keyword density for specific job descriptions.",
      href: "/ai-tailor",
      icon: Sparkles,
      badge: "Top Conversion",
      color: "from-indigo-600 to-purple-600",
    },
    {
      title: "Cover Letter Studio",
      desc: "Create bespoke cover letters in Professional, Confident, or Concise tones in under 10 seconds.",
      href: "/cover-letters",
      icon: Send,
      badge: "Multi-Tone",
      color: "from-rose-600 to-pink-600",
    },
  ];

  return (
    <div className="flex-1 flex flex-col">
      <Topbar title="Career Acceleration Tools" />

      <main className="p-6 md:p-8 space-y-8 max-w-7xl">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
            Comprehensive Career Suite
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Beyond resumes: Optimize your LinkedIn, prepare for tough interviews, and master missing skills.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <div
                key={tool.title}
                className="bg-white rounded-2xl border border-neutral-200/90 p-6 shadow-xs hover:border-indigo-400 hover:shadow-lg transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <div className="size-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Icon className="size-5" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-neutral-100 text-neutral-700">
                      {tool.badge}
                    </span>
                  </div>
                  <h3 className="font-bold text-base text-neutral-900 group-hover:text-indigo-600 transition-colors">
                    {tool.title}
                  </h3>
                  <p className="text-xs text-neutral-500 mt-2 leading-relaxed">
                    {tool.desc}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-neutral-100 flex items-center justify-between">
                  <span className="text-xs font-semibold text-neutral-400 group-hover:text-neutral-600">Launch Tool</span>
                  <Link
                    href={tool.href}
                    className="size-8 rounded-full bg-neutral-100 group-hover:gradient-ai group-hover:text-white flex items-center justify-center text-neutral-600 transition-all shadow-xs"
                  >
                    <ArrowRight className="size-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
