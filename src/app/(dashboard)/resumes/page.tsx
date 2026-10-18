"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FileText,
  Plus,
  Edit3,
  Copy,
  Trash2,
  Download,
  FileDown,
  Sparkles,
  Loader2,
  Calendar,
  Layers,
  ArrowRight,
} from "lucide-react";
import { Topbar } from "@/components/dashboard/Topbar";
import { ResumeData } from "@/lib/types";
import { triggerPrintResume } from "@/lib/pdf-generator";
import { downloadResumeDocx } from "@/lib/export-utils";

export default function MyResumesPage() {
  const router = useRouter();
  const [resumes, setResumes] = useState<ResumeData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const fetchResumes = async () => {
    try {
      const res = await fetch("/api/resumes");
      if (res.ok) {
        const data = await res.json();
        setResumes(data.resumes || []);
      }
    } catch (e) {
      console.error("[MyResumes] Failed to fetch resumes:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  const handleDuplicate = async (id: string) => {
    try {
      const res = await fetch(`/api/resumes/${id}/duplicate`, { method: "POST" });
      if (res.ok) {
        setActionNotice("Resume duplicated successfully");
        fetchResumes();
      }
    } catch {
      setActionNotice("Failed to duplicate resume");
    }
    setTimeout(() => setActionNotice(null), 3500);
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      const res = await fetch(`/api/resumes/${id}`, { method: "DELETE" });
      if (res.ok) {
        setActionNotice("Resume deleted");
        fetchResumes();
      }
    } catch {
      setActionNotice("Failed to delete resume");
    }
    setTimeout(() => setActionNotice(null), 3500);
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-neutral-50/50">
      <Topbar title="My Resumes" />

      <main className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
        {actionNotice && (
          <div className="p-3 bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold rounded-xl flex items-center justify-between">
            <span>{actionNotice}</span>
            <button onClick={() => setActionNotice(null)} className="text-indigo-500 hover:text-indigo-800">
              &times;
            </button>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">My Resumes</h1>
            <p className="text-sm text-neutral-500 mt-0.5">
              Manage, edit, duplicate, and export your tailored resumes.
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <Link
              href="/templates"
              className="px-4 py-2 text-xs font-bold text-neutral-700 bg-white border border-neutral-200 rounded-xl hover:bg-neutral-50 transition-colors flex items-center gap-1.5"
            >
              <Layers className="size-3.5 text-neutral-500" />
              <span>Browse Templates</span>
            </Link>
            <Link
              href="/resume-builder"
              className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-sm shadow-indigo-600/20 transition-all flex items-center gap-1.5"
            >
              <Plus className="size-3.5" />
              <span>Create Resume</span>
            </Link>
          </div>
        </div>

        {isLoading ? (
          <div className="py-24 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="size-8 text-indigo-600 animate-spin" />
            <p className="text-sm text-neutral-500 font-medium">Loading your resumes from database...</p>
          </div>
        ) : resumes.length === 0 ? (
          <div className="p-12 text-center bg-white border border-dashed border-neutral-300 rounded-2xl space-y-4">
            <div className="size-14 mx-auto rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <FileText className="size-7" />
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h3 className="text-base font-bold text-neutral-900">No Resumes Found</h3>
              <p className="text-xs text-neutral-500">
                You have not created or imported any resumes yet. Start building your ATS-optimized resume now!
              </p>
            </div>
            <Link
              href="/resume-builder"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
            >
              <Plus className="size-4" />
              <span>Build First Resume</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {resumes.map((r) => {
              const score = r.atsScore || 75;
              return (
                <div
                  key={r.id}
                  className="p-5 bg-white border border-neutral-200/90 rounded-2xl shadow-xs hover:border-neutral-300 transition-all flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="size-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                          <FileText className="size-5" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-neutral-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                            {r.title || "Untitled Resume"}
                          </h3>
                          <p className="text-[11px] text-neutral-500 font-medium">
                            {r.targetRole || "Software Professional"}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${
                          score >= 80
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : score >= 60
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : "bg-red-50 text-red-700 border-red-200"
                        }`}
                      >
                        ATS {score}%
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-neutral-400 font-medium pt-1 border-t border-neutral-100">
                      <span className="flex items-center gap-1">
                        <Calendar className="size-3 text-neutral-400" />
                        {new Date(r.lastEdited || r.createdAt).toLocaleDateString()}
                      </span>
                      <span>•</span>
                      <span className="capitalize">{r.templateId || "Classic"} Template</span>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-neutral-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => {
                        localStorage.setItem("atsforge_active_resume", JSON.stringify(r));
                        router.push(`/builder/${r.id}`);
                      }}
                      className="flex-1 py-1.5 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Edit3 className="size-3.5" />
                      <span>Edit</span>
                    </button>

                    <button
                      onClick={() => triggerPrintResume(r)}
                      title="Export as PDF"
                      className="p-1.5 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg border border-neutral-200"
                    >
                      <Download className="size-3.5" />
                    </button>

                    <button
                      onClick={() => downloadResumeDocx(r)}
                      title="Export as DOCX"
                      className="p-1.5 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg border border-neutral-200"
                    >
                      <FileDown className="size-3.5" />
                    </button>

                    <button
                      onClick={() => handleDuplicate(r.id)}
                      title="Duplicate Resume"
                      className="p-1.5 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg border border-neutral-200"
                    >
                      <Copy className="size-3.5" />
                    </button>

                    <button
                      onClick={() => handleDelete(r.id, r.title)}
                      title="Delete Resume"
                      className="p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg border border-red-200"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
