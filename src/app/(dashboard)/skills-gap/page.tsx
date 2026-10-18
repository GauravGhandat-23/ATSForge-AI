"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  AlertTriangle,
  Flame,
  GraduationCap,
  Loader2,
  AlertCircle,
  FileText,
  PlusCircle,
  Sparkles,
} from "lucide-react";
import { Topbar } from "@/components/dashboard/Topbar";
import { ResumeData, SkillsGapItem } from "@/lib/types";

export default function SkillsGapPage() {
  const [resumes, setResumes] = useState<ResumeData[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string>("");
  const [jobDescription, setJobDescription] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [gapItems, setGapItems] = useState<SkillsGapItem[]>([]);
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
            setSelectedResumeId(data.resumes[0].id);
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchResumes();
  }, []);

  const fetchGap = async () => {
    setErrorMsg(null);
    if (!jobDescription || jobDescription.trim().length === 0) {
      setErrorMsg("Please paste a target job description to analyze skills gaps.");
      return;
    }
    const selected = resumes.find((r) => r.id === selectedResumeId);
    if (!selected) {
      setErrorMsg("Please select a valid resume.");
      return;
    }

    setIsAnalyzing(true);
    try {
      const res = await fetch("/api/skills-gap", {
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
        throw new Error(data.error || "Skills gap analysis failed");
      }
      setGapItems(data.gapItems || []);
    } catch (e: any) {
      setErrorMsg(e.message || "Failed to analyze skills gap");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const strongMatches = gapItems.filter((g) => g.status === "strong");
  const partialMatches = gapItems.filter((g) => g.status === "partial");
  const missingSkills = gapItems.filter((g) => g.status === "missing");

  return (
    <div className="flex-1 flex flex-col">
      <Topbar title="Skills Gap & Learning Roadmap" />

      <main className="p-6 md:p-8 space-y-8 max-w-7xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
              Skills Gap Matrix & Career Upskilling
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500 mt-1">
              Identify missing technical proficiencies and follow tailored learning roadmaps.
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
                Create or import a resume in the Resume Builder first to calculate real skills gaps against job postings.
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
                  1. Candidate Resume
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
              </div>

              <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-neutral-200/90 shadow-xs space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-neutral-700 uppercase tracking-wider">
                    2. Target Job Requirements
                  </label>
                  <button
                    onClick={fetchGap}
                    disabled={isAnalyzing || !jobDescription.trim()}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 disabled:opacity-50 flex items-center gap-1 cursor-pointer"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="size-3 animate-spin" /> Calculating Gap...
                      </>
                    ) : (
                      <>
                        <Sparkles className="size-3" /> Calculate Gap
                      </>
                    )}
                  </button>
                </div>
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the target job description or requirements here..."
                  className="w-full h-24 p-2.5 text-xs font-mono bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </div>

            {/* Gap Columns: Strong vs Partial vs Missing */}
            {gapItems.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {/* Strong */}
                  <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-xs space-y-3">
                    <div className="flex items-center gap-2 pb-2 border-b border-neutral-100">
                      <CheckCircle2 className="size-4 text-emerald-600" />
                      <h3 className="font-bold text-xs uppercase tracking-wider text-emerald-800">
                        Strong Matches ({strongMatches.length})
                      </h3>
                    </div>
                    <div className="space-y-2">
                      {strongMatches.length > 0 ? (
                        strongMatches.map((item, i) => (
                          <div key={i} className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-100 text-xs">
                            <p className="font-bold text-emerald-950">{item.skill}</p>
                            <p className="text-[11px] text-emerald-700 mt-1 leading-snug">{item.recommendation}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-neutral-400 italic">No strong skill matches identified.</p>
                      )}
                    </div>
                  </div>

                  {/* Partial */}
                  <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-xs space-y-3">
                    <div className="flex items-center gap-2 pb-2 border-b border-neutral-100">
                      <AlertTriangle className="size-4 text-amber-600" />
                      <h3 className="font-bold text-xs uppercase tracking-wider text-amber-800">
                        Partial Matches ({partialMatches.length})
                      </h3>
                    </div>
                    <div className="space-y-2">
                      {partialMatches.length > 0 ? (
                        partialMatches.map((item, i) => (
                          <div key={i} className="p-3 rounded-xl bg-amber-50/50 border border-amber-100 text-xs">
                            <p className="font-bold text-amber-950">{item.skill}</p>
                            <p className="text-[11px] text-amber-800 mt-1 leading-snug">{item.recommendation}</p>
                            <span className="inline-block mt-2 text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                              Est. Study: {item.estimatedTimeToLearn}
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-neutral-400 italic">No partial matches identified.</p>
                      )}
                    </div>
                  </div>

                  {/* Missing */}
                  <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-xs space-y-3">
                    <div className="flex items-center gap-2 pb-2 border-b border-neutral-100">
                      <Flame className="size-4 text-red-600" />
                      <h3 className="font-bold text-xs uppercase tracking-wider text-red-800">
                        Missing High-Priority ({missingSkills.length})
                      </h3>
                    </div>
                    <div className="space-y-2">
                      {missingSkills.length > 0 ? (
                        missingSkills.map((item, i) => (
                          <div key={i} className="p-3 rounded-xl bg-red-50/50 border border-red-100 text-xs">
                            <p className="font-bold text-red-950">{item.skill}</p>
                            <p className="text-[11px] text-red-800 mt-1 leading-snug">{item.recommendation}</p>
                            <span className="inline-block mt-2 text-[10px] font-bold px-2 py-0.5 rounded bg-red-100 text-red-800">
                              Est. Study: {item.estimatedTimeToLearn}
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-neutral-400 italic">No missing high-priority skills identified.</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actionable Learning Resources */}
                {missingSkills.some((m) => m.resources && m.resources.length > 0) && (
                  <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-xs space-y-4">
                    <h3 className="font-bold text-sm text-neutral-900 flex items-center gap-1.5">
                      <GraduationCap className="size-4 text-indigo-600" />
                      Curated Upskilling Recommendations
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                      {missingSkills.flatMap((m) => m.resources || []).map((res, idx) => (
                        <div key={idx} className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200 space-y-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">{res.type}</span>
                          <p className="font-bold text-neutral-900">{res.name}</p>
                          <p className="text-[11px] text-neutral-500">Accelerated curriculum to close ATS gap</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="p-8 text-center text-xs text-neutral-400 bg-neutral-50 rounded-2xl border border-dashed border-neutral-200">
                Paste a target job description above and click &quot;Calculate Gap&quot; to inspect real skill overlaps and missing proficiencies.
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
