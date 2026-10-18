"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  Sparkles,
  Loader2,
  AlertCircle,
  FileText,
  PlusCircle,
} from "lucide-react";
import { Topbar } from "@/components/dashboard/Topbar";
import { ResumeData, JobDescriptionAnalysis } from "@/lib/types";

export default function JobAnalyzerPage() {
  const [resumes, setResumes] = useState<ResumeData[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string>("");
  const [jobDescription, setJobDescription] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [analysis, setAnalysis] = useState<JobDescriptionAnalysis | null>(null);
  const [matchData, setMatchData] = useState<{
    matchTier: string;
    overallMatch: number;
    skillsMatch: number;
    experienceMatch: number;
    keywordMatch: number;
  } | null>(null);

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

  const handleAnalyze = async () => {
    setErrorMsg(null);
    if (!jobDescription || jobDescription.trim().length === 0) {
      setErrorMsg("Please paste a job description to analyze.");
      return;
    }
    const selected = resumes.find((r) => r.id === selectedResumeId);
    if (!selected) {
      setErrorMsg("Please select a valid resume.");
      return;
    }

    setIsAnalyzing(true);
    try {
      // 1. Analyze JD
      const resJd = await fetch("/api/jobs/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobDescription: jobDescription.trim() }),
      });
      const dataJd = await resJd.json();
      if (!resJd.ok) {
        throw new Error(dataJd.error || "Failed to analyze job description");
      }
      setAnalysis(dataJd.analysis);

      // 2. Calculate match
      const resMatch = await fetch("/api/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeId: selectedResumeId,
          resumeData: selected,
          jobDescription: jobDescription.trim(),
        }),
      });
      const dataMatch = await resMatch.json();
      if (!resMatch.ok) {
        throw new Error(dataMatch.error || "Failed to calculate match");
      }
      setMatchData(dataMatch);
    } catch (e: any) {
      setErrorMsg(e.message || "Failed to analyze job and calculate match");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <Topbar title="Job Description & Match Analyzer" />

      <main className="p-6 md:p-8 space-y-8 max-w-7xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
              Job Description Intelligence & Matching
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500 mt-1">
              Extract hidden ATS requirements, required skills, and calculate exact role alignment.
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
                Create or import a resume in the Resume Builder first to compare against real job descriptions.
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
            {/* Input Card */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              <div className="lg:col-span-8 bg-white p-5 rounded-2xl border border-neutral-200/90 shadow-xs space-y-3">
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider">
                  Paste Target Job Description
                </label>
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the complete job post here..."
                  className="w-full h-44 p-3 text-xs font-mono bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 leading-relaxed text-neutral-800"
                />
              </div>

              <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-neutral-200/90 shadow-xs flex flex-col justify-between">
                <div className="space-y-3">
                  <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider">
                    Compare Against Resume
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
                  <p className="text-xs text-neutral-500">
                    Calculates keyword alignment, missing technical stacks, and fit score.
                  </p>
                </div>

                <button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || !jobDescription.trim()}
                  className="mt-4 w-full py-2.5 rounded-xl gradient-ai text-white font-bold text-xs shadow-md shadow-indigo-500/25 flex items-center justify-center gap-2 hover:opacity-95 disabled:opacity-50 cursor-pointer"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="size-3.5 animate-spin" /> Extracting Requirements...
                    </>
                  ) : (
                    <>
                      <Search className="size-3.5" /> Analyze Job & Calculate Match
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Results */}
            {analysis && matchData ? (
              <div className="space-y-6 animate-in fade-in-50">
                {/* Match Tier Scoreboard */}
                <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="size-16 rounded-2xl bg-indigo-50 border-2 border-indigo-500 flex flex-col items-center justify-center text-indigo-700">
                      <span className="text-2xl font-extrabold">{matchData.overallMatch}%</span>
                      <span className="text-[9px] font-bold uppercase tracking-wider">Match</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wide text-neutral-400">Match Tier:</span>
                        <span className="text-sm font-extrabold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                          {matchData.matchTier}
                        </span>
                      </div>
                      <h3 className="font-bold text-neutral-900 text-base mt-1">
                        {analysis.jobTitle} @ {analysis.company}
                      </h3>
                      <p className="text-xs text-neutral-500">Requirements: {analysis.experienceRequirements}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Link
                      href={`/ai-tailor?resumeId=${selectedResumeId}`}
                      className="px-5 py-2.5 rounded-xl gradient-ai text-white text-xs font-bold shadow-md shadow-indigo-500/20 hover:opacity-95 flex items-center gap-1.5"
                    >
                      <Sparkles className="size-3.5" />
                      Tailor Resume for this Job
                    </Link>
                  </div>
                </div>

                {/* Extracted Breakdown Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Required & Preferred Skills */}
                  <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs space-y-3">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-neutral-700">
                      Extracted Required Skills ({analysis.requiredSkills.length})
                    </h4>
                    {analysis.requiredSkills.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {analysis.requiredSkills.map((s) => (
                          <span key={s} className="px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs font-semibold">
                            {s}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-neutral-400 italic">No specific required skills identified.</p>
                    )}

                    <h4 className="font-bold text-xs uppercase tracking-wider text-neutral-700 pt-3">
                      Preferred / Bonus Skills ({analysis.preferredSkills.length})
                    </h4>
                    {analysis.preferredSkills.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {analysis.preferredSkills.map((s) => (
                          <span key={s} className="px-2.5 py-1 rounded-lg bg-neutral-100 text-neutral-700 text-xs font-medium">
                            {s}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-neutral-400 italic">No optional skills identified.</p>
                    )}
                  </div>

                  {/* Responsibilities & Education */}
                  <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs space-y-3 text-xs">
                    <h4 className="font-bold uppercase tracking-wider text-neutral-700">Core Responsibilities</h4>
                    {analysis.responsibilities.length > 0 ? (
                      <ul className="space-y-1.5 text-neutral-600">
                        {analysis.responsibilities.map((r, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="size-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                            <span>{r}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-neutral-400 italic">No specific responsibilities identified.</p>
                    )}

                    <h4 className="font-bold uppercase tracking-wider text-neutral-700 pt-2">Education Requirements</h4>
                    <p className="text-neutral-600">{analysis.educationRequirements || "Not explicitly specified."}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-neutral-400 bg-neutral-50 rounded-2xl border border-dashed border-neutral-200">
                Paste a job description above and click &quot;Analyze Job &amp; Calculate Match&quot; to inspect role requirements.
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
