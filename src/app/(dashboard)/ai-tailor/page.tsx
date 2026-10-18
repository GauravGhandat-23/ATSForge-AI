"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  TrendingUp,
  FileText,
  Loader2,
  Check,
  Flame,
  ArrowLeftRight,
  AlertCircle,
  PlusCircle,
} from "lucide-react";
import { Topbar } from "@/components/dashboard/Topbar";
import { ResumeData, TailoredResumeResult } from "@/lib/types";

function AITailorContent() {
  const searchParams = useSearchParams();
  const resumeIdParam = searchParams.get("resumeId");
  const router = useRouter();

  const [resumes, setResumes] = useState<ResumeData[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string>("");
  const [jobDescription, setJobDescription] = useState("");
  const [isTailoring, setIsTailoring] = useState(false);
  const [tailorResult, setTailorResult] = useState<TailoredResumeResult | null>(null);
  const [isApplied, setIsApplied] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResumes = async () => {
      try {
        const res = await fetch("/api/resumes");
        if (res.ok) {
          const data = await res.json();
          if (data.resumes && Array.isArray(data.resumes) && data.resumes.length > 0) {
            setResumes(data.resumes);
            setSelectedResumeId(resumeIdParam || data.resumes[0].id);
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchResumes();
  }, [resumeIdParam]);

  const handleTailor = async () => {
    setErrorMsg(null);
    if (!jobDescription.trim()) {
      setErrorMsg("Please paste a target job description.");
      return;
    }
    const selected = resumes.find((r) => r.id === selectedResumeId);
    if (!selected) {
      setErrorMsg("Please select a valid resume.");
      return;
    }

    setIsTailoring(true);
    setIsApplied(false);
    try {
      const res = await fetch("/api/ai/tailor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeId: selected.id,
          resumeData: selected,
          jobDescription: jobDescription.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Tailoring failed");
      }
      setTailorResult(data);
    } catch (e: any) {
      setErrorMsg(e.message || "Failed to tailor resume");
    } finally {
      setIsTailoring(false);
    }
  };

  const handleApplyToResume = async () => {
    if (!tailorResult) return;
    try {
      await fetch(`/api/resumes/${tailorResult.tailoredResumeData.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tailorResult.tailoredResumeData),
      });
      setIsApplied(true);
      setTimeout(() => {
        router.push(`/builder/${tailorResult.tailoredResumeData.id}`);
      }, 1000);
    } catch (e) {
      console.error(e);
    }
  };

  const selectedResume = resumes.find((r) => r.id === selectedResumeId);

  return (
    <div className="flex-1 flex flex-col">
      <Topbar title="AI Resume Tailoring" />

      <main className="p-6 md:p-8 space-y-8 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
              Tailor Resume to Target Job
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500 mt-1">
              Side-by-side optimization aligning your real experience with recruiter keywords.
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-800 flex items-start gap-2.5">
            <AlertCircle className="size-4 text-red-600 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {loading ? (
          <div className="p-12 text-center text-neutral-400 text-xs">
            <Loader2 className="size-6 animate-spin mx-auto mb-2 text-indigo-600" />
            Loading workspace resumes...
          </div>
        ) : resumes.length === 0 ? (
          <div className="p-12 bg-white rounded-2xl border border-neutral-200/90 text-center space-y-4">
            <FileText className="size-10 text-neutral-300 mx-auto" />
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-neutral-800">No resumes found in your workspace</h3>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                Create or import a resume in the Resume Builder first so the AI tailor can analyze and optimize your real experience.
              </p>
            </div>
            <Link
              href="/builder"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-neutral-900 text-white text-xs font-bold hover:bg-neutral-800 transition"
            >
              <PlusCircle className="size-4" /> Create Resume in Builder
            </Link>
          </div>
        ) : (
          <>
            {/* Inputs */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-neutral-200/90 shadow-xs space-y-3">
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider">
                  1. Choose Source Resume
                </label>
                <select
                  value={selectedResumeId}
                  onChange={(e) => setSelectedResumeId(e.target.value)}
                  className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-semibold text-neutral-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  {resumes.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.title || "Untitled Resume"} ({r.targetRole || "No Target Role"})
                    </option>
                  ))}
                </select>

                {selectedResume && (
                  <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-100 text-xs space-y-1">
                    <p className="font-bold text-neutral-900">{selectedResume.title || "Untitled Resume"}</p>
                    <p className="text-neutral-500">
                      Current ATS score: {selectedResume.atsScore !== undefined ? `${selectedResume.atsScore}/100` : "No scan yet"}
                    </p>
                    {selectedResume.summary ? (
                      <p className="text-neutral-600 text-[11px] line-clamp-2 mt-1 italic">&quot;{selectedResume.summary}&quot;</p>
                    ) : (
                      <p className="text-neutral-400 text-[11px] mt-1 italic">No summary entered yet.</p>
                    )}
                  </div>
                )}
              </div>

              <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-neutral-200/90 shadow-xs space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-neutral-700 uppercase tracking-wider">
                    2. Target Job Description
                  </label>
                  <span className="text-[11px] text-neutral-400 font-mono">{jobDescription.length} chars</span>
                </div>
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the full job posting requirements here..."
                  className="w-full h-32 p-3 text-xs font-mono bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 leading-relaxed"
                />
              </div>
            </div>

            {/* Tailor CTA */}
            <div className="flex justify-center">
              <button
                onClick={handleTailor}
                disabled={isTailoring || !jobDescription.trim()}
                className="px-8 py-3.5 rounded-xl gradient-ai text-white text-sm font-bold shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5 flex items-center gap-2 disabled:opacity-50 transition-all cursor-pointer"
              >
                {isTailoring ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Optimizing Bullets & Keyword Density...
                  </>
                ) : (
                  <>
                    <Sparkles className="size-4" />
                    Generate Tailored Version
                  </>
                )}
              </button>
            </div>

            {/* Side-by-side Before / After Comparison */}
            {tailorResult ? (
              <div className="space-y-6 animate-in fade-in-50">
                {/* Impact Metrics Bar */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">New ATS Score</p>
                      <h3 className="text-2xl font-extrabold text-emerald-600 mt-1">{tailorResult.newAtsScore}/100</h3>
                      <p className="text-[11px] text-emerald-700 font-semibold mt-0.5 flex items-center gap-1">
                        <TrendingUp className="size-3" /> +{tailorResult.keywordMatchIncrease}% Keyword Match
                      </p>
                    </div>
                    <div className="size-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs">
                      {tailorResult.newAtsScore}%
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Keywords Incorporated</p>
                      <h3 className="text-2xl font-extrabold text-indigo-700 mt-1">{tailorResult.addedKeywords.length} Terms</h3>
                      <p className="text-[11px] text-neutral-500 mt-0.5">Matched from JD requirements</p>
                    </div>
                    <div className="size-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                      <CheckCircle2 className="size-5" />
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Bullets Enhanced</p>
                      <h3 className="text-2xl font-extrabold text-purple-700 mt-1">{tailorResult.modifiedBullets.length} Bullets</h3>
                      <p className="text-[11px] text-neutral-500 mt-0.5">Structured for maximum impact</p>
                    </div>
                    <div className="size-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                      <ArrowLeftRight className="size-5" />
                    </div>
                  </div>
                </div>

                {/* Added Keywords Strip */}
                {tailorResult.addedKeywords.length > 0 && (
                  <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-100 flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-indigo-900 flex items-center gap-1">
                      <Flame className="size-3.5 text-indigo-600" /> Naturally Incorporated Keywords:
                    </span>
                    {tailorResult.addedKeywords.map((kw) => (
                      <span key={kw} className="px-2.5 py-0.5 rounded-lg bg-white border border-indigo-200 text-indigo-800 text-xs font-bold shadow-2xs">
                        +{kw}
                      </span>
                    ))}
                  </div>
                )}

                {/* Side-by-side Summary Comparison */}
                <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-xs space-y-4">
                  <h3 className="font-bold text-sm text-neutral-900 flex items-center gap-1.5">
                    <FileText className="size-4 text-indigo-600" />
                    Professional Summary Comparison
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs leading-relaxed">
                    <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Original Baseline</span>
                      <p className="text-neutral-700 pt-1">{tailorResult.originalSummary || "No original summary provided."}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-200 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">Tailored & Keyword Optimized</span>
                      <p className="text-indigo-950 font-medium pt-1">{tailorResult.optimizedSummary}</p>
                    </div>
                  </div>
                </div>

                {/* Modified Bullets Comparison */}
                {tailorResult.modifiedBullets.length > 0 && (
                  <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-xs space-y-4">
                    <h3 className="font-bold text-sm text-neutral-900 flex items-center gap-1.5">
                      <Sparkles className="size-4 text-purple-600" />
                      Enhanced Experience Bullets (Before vs. After)
                    </h3>

                    <div className="space-y-3">
                      {tailorResult.modifiedBullets.map((mb, idx) => (
                        <div key={idx} className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/30 space-y-2 text-xs">
                          <span className="font-bold text-neutral-800 text-[11px]">{mb.company}</span>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="p-3 rounded-lg bg-neutral-100 text-neutral-600">
                              <span className="text-[10px] font-bold uppercase text-neutral-400 block mb-1">Before</span>
                              <p>{mb.original}</p>
                            </div>
                            <div className="p-3 rounded-lg bg-emerald-50 text-emerald-950 border border-emerald-200">
                              <span className="text-[10px] font-bold uppercase text-emerald-700 block mb-1">After (Impact Focused)</span>
                              <p className="font-medium">{mb.optimized}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Bottom Action: Apply to Resume */}
                <div className="p-6 bg-neutral-900 text-white rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="font-bold text-base">Save & Apply Tailored Version</h4>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      Save this optimized resume into your active workspace and view it in the live builder.
                    </p>
                  </div>
                  <button
                    onClick={handleApplyToResume}
                    disabled={isApplied}
                    className="px-6 py-3 rounded-xl gradient-ai text-white font-bold text-xs shadow-md shadow-indigo-500/25 hover:opacity-95 flex items-center gap-2 self-start sm:self-auto cursor-pointer"
                  >
                    {isApplied ? (
                      <>
                        <Check className="size-4" /> Applied! Redirecting...
                      </>
                    ) : (
                      <>
                        Apply to Resume <ArrowRight className="size-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-neutral-400 bg-neutral-50 rounded-2xl border border-dashed border-neutral-200">
                Paste a target job description above and click &quot;Generate Tailored Version&quot; to inspect side-by-side keyword improvements.
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default function AITailorPage() {
  return (
    <Suspense fallback={<div className="flex-1 p-8 text-center text-xs text-neutral-400">Loading AI Tailor...</div>}>
      <AITailorContent />
    </Suspense>
  );
}
