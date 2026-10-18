"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Briefcase,
  Target,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Building2,
  MapPin,
  Clock,
  Send,
  Loader2,
  PlusCircle,
  FileText,
} from "lucide-react";
import { Topbar } from "@/components/dashboard/Topbar";
import { ResumeData } from "@/lib/types";

export default function JobMatcherPage() {
  const [resumes, setResumes] = useState<ResumeData[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string>("");
  const [jobDescription, setJobDescription] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [analysis, setAnalysis] = useState<{
    jobTitle: string;
    company: string;
    location: string;
    experience: string;
    requiredSkills: string[];
    preferredSkills: string[];
    technologies: string[];
    responsibilities: string[];
    keywords: string[];
    atsMatch: number;
    jobMatch: number;
    matchedKeywords: string[];
    missingSkills: string[];
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

  const activeResume = resumes.find((r) => r.id === selectedResumeId);

  const handleAnalyzeAndMatch = async () => {
    setErrorMsg(null);
    if (!activeResume) {
      setErrorMsg("Please select or create a resume first.");
      return;
    }
    if (!jobDescription || jobDescription.trim().length === 0) {
      setErrorMsg("Please paste a job description to analyze and calculate match.");
      return;
    }

    setIsAnalyzing(true);
    try {
      // 1. Analyze Job Description
      const resAnalyze = await fetch("/api/jobs/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobDescription: jobDescription.trim() }),
      });
      const dataAnalyze = await resAnalyze.json();
      if (!resAnalyze.ok) {
        throw new Error(dataAnalyze.error || "Job analysis failed");
      }

      // 2. Calculate Match against current resume
      const resMatch = await fetch("/api/jobs/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeData: activeResume,
          jobDescription: jobDescription.trim(),
        }),
      });
      const dataMatch = await resMatch.json();
      if (!resMatch.ok) {
        throw new Error(dataMatch.error || "Match calculation failed");
      }

      setAnalysis({
        jobTitle: dataAnalyze.jobTitle || "Job Opportunity",
        company: dataAnalyze.company || "Company",
        location: dataAnalyze.location || "Location not specified",
        experience: dataAnalyze.experience || "Experience not specified",
        requiredSkills: dataAnalyze.requiredSkills || [],
        preferredSkills: dataAnalyze.preferredSkills || [],
        technologies: dataAnalyze.technologies || [],
        responsibilities: dataAnalyze.responsibilities || [],
        keywords: dataAnalyze.keywords || [],
        atsMatch: dataMatch.atsMatch ?? 0,
        jobMatch: dataMatch.jobMatch ?? 0,
        matchedKeywords: dataMatch.matchedKeywords || [],
        missingSkills: dataMatch.missingKeywords || [],
      });
    } catch (e: any) {
      setErrorMsg(e.message || "Failed to analyze and match job description");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <Topbar title="Job Description Analyzer &amp; Matcher" />

      <main className="p-6 md:p-8 space-y-8 max-w-7xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
              Job Description Analyzer &amp; Matcher
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500 mt-1">
              Extract required skills, detect hidden keywords, and calculate your deterministic match percentage.
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
                Create or import a resume in the Resume Builder first to calculate match rates against real job descriptions.
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
            {/* Input Form */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Source Resume Selection (4 cols) */}
              <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-neutral-200/90 shadow-xs space-y-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                    Target Resume for Match
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

                {activeResume && (
                  <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-100 text-xs space-y-1">
                    <p className="font-bold text-neutral-900">{activeResume.personalInfo?.fullName || "Candidate"}</p>
                    <p className="text-neutral-500">{activeResume.targetRole || "No Target Role Specified"}</p>
                    <p className="text-[11px] text-neutral-400">
                      {activeResume.skills?.technical?.length || 0} Technical Skills registered
                    </p>
                  </div>
                )}

                <button
                  onClick={handleAnalyzeAndMatch}
                  disabled={isAnalyzing || !jobDescription.trim()}
                  className="w-full py-3 rounded-xl gradient-ai text-white font-bold text-xs shadow-md shadow-indigo-500/25 flex items-center justify-center gap-2 hover:opacity-95 disabled:opacity-50 cursor-pointer"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="size-4 animate-spin" /> Analyzing Job &amp; Matching...
                    </>
                  ) : (
                    <>
                      <Sparkles className="size-4" /> Analyze &amp; Calculate Match
                    </>
                  )}
                </button>
              </div>

              {/* Job Description Textarea (8 cols) */}
              <div className="lg:col-span-8 bg-white p-5 rounded-2xl border border-neutral-200/90 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-bold text-neutral-700 uppercase tracking-wider flex items-center gap-1.5">
                      <Briefcase className="size-3.5 text-indigo-600" />
                      Paste Target Job Description
                    </label>
                    <span className="text-[11px] font-mono text-neutral-400">{jobDescription.length} characters</span>
                  </div>
                  <textarea
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste the full job description here..."
                    className="w-full h-56 p-3.5 text-xs font-mono bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 leading-relaxed text-neutral-800"
                  />
                </div>
              </div>
            </div>

            {/* Results Panel */}
            {analysis ? (
              <div className="space-y-6 animate-fadeIn">
                {/* Match Scores Banner */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-5 rounded-2xl bg-white border border-neutral-200 shadow-xs flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">ATS Match Score</span>
                      <h3 className="text-2xl font-extrabold text-emerald-600 mt-1">{analysis.atsMatch}%</h3>
                      <p className="text-[11px] text-emerald-700 font-medium mt-0.5">Deterministic Match</p>
                    </div>
                    <div className="size-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <Target className="size-5" />
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-white border border-neutral-200 shadow-xs flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Role Compatibility</span>
                      <h3 className="text-2xl font-extrabold text-indigo-600 mt-1">{analysis.jobMatch}%</h3>
                      <p className="text-[11px] text-indigo-700 font-medium mt-0.5">Skills &amp; Keywords</p>
                    </div>
                    <div className="size-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                      <Briefcase className="size-5" />
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-white border border-neutral-200 shadow-xs flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Matched Keywords</span>
                      <h3 className="text-2xl font-extrabold text-neutral-900 mt-1">{analysis.matchedKeywords.length}</h3>
                      <p className="text-[11px] text-neutral-400 mt-0.5">Found in your resume</p>
                    </div>
                    <div className="size-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                      <CheckCircle2 className="size-5" />
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-white border border-neutral-200 shadow-xs flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Missing Skills</span>
                      <h3 className="text-2xl font-extrabold text-amber-600 mt-1">{analysis.missingSkills.length}</h3>
                      <p className="text-[11px] text-neutral-400 mt-0.5">Recommended additions</p>
                    </div>
                    <div className="size-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                      <AlertCircle className="size-5" />
                    </div>
                  </div>
                </div>

                {/* Extracted Role Profile */}
                <div className="bg-white p-6 rounded-2xl border border-neutral-200/90 shadow-xs space-y-5">
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-neutral-100">
                    <div>
                      <h3 className="text-lg font-bold text-neutral-900">{analysis.jobTitle}</h3>
                      <p className="text-xs text-neutral-500 mt-0.5 flex items-center gap-3">
                        <span className="flex items-center gap-1"><Building2 className="size-3.5 text-neutral-400" /> {analysis.company}</span>
                        <span className="flex items-center gap-1"><MapPin className="size-3.5 text-neutral-400" /> {analysis.location}</span>
                        <span className="flex items-center gap-1"><Clock className="size-3.5 text-neutral-400" /> {analysis.experience}</span>
                      </p>
                    </div>

                    {activeResume && (
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/ai-tailor?resumeId=${activeResume.id}`}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl gradient-ai text-white font-bold text-xs shadow-xs hover:opacity-95"
                        >
                          <Sparkles className="size-3.5" />
                          Tailor Resume for this Job
                        </Link>

                        <Link
                          href={`/cover-letter?resumeId=${activeResume.id}`}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700 font-semibold text-xs"
                        >
                          <Send className="size-3.5 text-indigo-600" />
                          Cover Letter
                        </Link>
                      </div>
                    )}
                  </div>

                  {/* Skills Breakdown Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                    {/* Required Skills */}
                    <div className="space-y-2 p-4 rounded-xl bg-neutral-50 border border-neutral-200/80">
                      <span className="font-bold text-neutral-800 uppercase tracking-wider block">
                        Required Skills ({analysis.requiredSkills.length})
                      </span>
                      {analysis.requiredSkills.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {analysis.requiredSkills.map((s) => (
                            <span key={s} className="px-2.5 py-1 rounded-lg bg-white border border-neutral-200 font-medium text-neutral-800">
                              {s}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-neutral-400 text-xs italic">No specific hard skills isolated from JD.</p>
                      )}
                    </div>

                    {/* Preferred Skills */}
                    <div className="space-y-2 p-4 rounded-xl bg-neutral-50 border border-neutral-200/80">
                      <span className="font-bold text-neutral-800 uppercase tracking-wider block">
                        Preferred Skills ({analysis.preferredSkills.length})
                      </span>
                      {analysis.preferredSkills.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {analysis.preferredSkills.map((s) => (
                            <span key={s} className="px-2.5 py-1 rounded-lg bg-white border border-neutral-200 font-medium text-neutral-800">
                              {s}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-neutral-400 text-xs italic">No optional skills isolated.</p>
                      )}
                    </div>
                  </div>

                  {/* Missing Skills Warning */}
                  {analysis.missingSkills.length > 0 && (
                    <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-xs space-y-2">
                      <span className="font-bold text-amber-900 flex items-center gap-1.5">
                        <AlertCircle className="size-4 text-amber-600" />
                        Skills Missing in Your Resume
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {analysis.missingSkills.map((s) => (
                          <span key={s} className="px-2.5 py-1 rounded-lg bg-white border border-amber-300 font-semibold text-amber-900">
                            + {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-neutral-400 bg-neutral-50 rounded-2xl border border-dashed border-neutral-200">
                Paste a job description above and click &quot;Analyze &amp; Calculate Match&quot; to calculate your ATS match score and discover missing keywords.
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
