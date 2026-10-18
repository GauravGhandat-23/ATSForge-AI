"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Send,
  Copy,
  Download,
  Check,
  Sparkles,
  FileText,
  Loader2,
  FileDown,
  AlertCircle,
  PlusCircle,
} from "lucide-react";
import { Topbar } from "@/components/dashboard/Topbar";
import { CoverLetter, ResumeData } from "@/lib/types";
import { downloadCoverLetterDocx, downloadCoverLetterPdf } from "@/lib/export-utils";

export default function CoverLetterPage() {
  const [resumes, setResumes] = useState<ResumeData[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string>("");

  const [company, setCompany] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [tone, setTone] = useState<"Professional" | "Confident" | "Concise">("Professional");

  const [generatedLetter, setGeneratedLetter] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [savedLetters, setSavedLetters] = useState<CoverLetter[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchLetters = async () => {
    try {
      const res = await fetch("/api/cover-letter");
      if (res.ok) {
        const data = await res.json();
        setSavedLetters(data.letters || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

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
    fetchLetters();
  }, []);

  const activeResume = resumes.find((r) => r.id === selectedResumeId);

  const handleGenerate = async () => {
    setErrorMsg(null);
    if (!activeResume) {
      setErrorMsg("Please select or create a resume first.");
      return;
    }
    if (!company.trim()) {
      setErrorMsg("Company name is required. Please specify the target company.");
      return;
    }
    if (!jobTitle.trim()) {
      setErrorMsg("Job title is required. Please specify the target job title.");
      return;
    }
    if (!jobDescription.trim()) {
      setErrorMsg("Job description is required. Please paste the job requirements.");
      return;
    }

    setIsGenerating(true);
    try {
      const res = await fetch("/api/cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeData: activeResume,
          company: company.trim(),
          jobTitle: jobTitle.trim(),
          jobDescription: jobDescription.trim(),
          tone,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Cover letter generation failed");
      }
      setGeneratedLetter(data.content);
      fetchLetters();
    } catch (e: any) {
      setErrorMsg(e.message || "Failed to generate cover letter");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedLetter);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDownloadTxt = () => {
    const blob = new Blob([generatedLetter], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${company ? company.replace(/\s+/g, "_") : "Cover_Letter"}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadDocx = () => {
    downloadCoverLetterDocx(generatedLetter, activeResume?.personalInfo?.fullName || "Candidate", company || "Company");
  };

  const handleDownloadPdf = () => {
    downloadCoverLetterPdf(generatedLetter, activeResume?.personalInfo?.fullName || "Candidate", company || "Company");
  };

  return (
    <div className="flex-1 flex flex-col">
      <Topbar title="Cover Letter Studio" />

      <main className="p-6 md:p-8 space-y-8 max-w-7xl">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
            AI Cover Letter Generator
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Generate tailored, recruiter-ready cover letters built around your real qualifications and tone of voice.
          </p>
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
                Create or import a resume in the Resume Builder first to generate cover letters tailored to your real background.
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
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Inputs Column (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-white p-5 rounded-2xl border border-neutral-200/90 shadow-xs space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-neutral-700 uppercase tracking-wider mb-1">
                    Source Resume
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

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-neutral-700 uppercase tracking-wider mb-1">
                      Company Name
                    </label>
                    <input
                      type="text"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="e.g. Google, Stripe"
                      className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-semibold text-neutral-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-neutral-700 uppercase tracking-wider mb-1">
                      Job Title
                    </label>
                    <input
                      type="text"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      placeholder="e.g. Senior Frontend Dev"
                      className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-semibold text-neutral-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 uppercase tracking-wider mb-1">
                    Tone of Voice
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["Professional", "Confident", "Concise"] as const).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setTone(t)}
                        className={`py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                          tone === t
                            ? "border-indigo-600 bg-indigo-50 text-indigo-700 shadow-2xs"
                            : "border-neutral-200 text-neutral-600 hover:bg-neutral-50"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 uppercase tracking-wider mb-1">
                    Job Description / Role Requirements
                  </label>
                  <textarea
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste the target job description requirements here..."
                    className="w-full h-28 p-2.5 text-xs font-mono bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                <button
                  onClick={handleGenerate}
                  disabled={isGenerating || !company.trim() || !jobTitle.trim() || !jobDescription.trim()}
                  className="w-full py-2.5 rounded-xl gradient-ai text-white font-bold text-xs shadow-md shadow-indigo-500/25 flex items-center justify-center gap-1.5 hover:opacity-95 disabled:opacity-50 cursor-pointer"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="size-3.5 animate-spin" /> Generating Cover Letter...
                    </>
                  ) : (
                    <>
                      <Sparkles className="size-3.5" /> Generate Tailored Letter
                    </>
                  )}
                </button>
              </div>

              {/* Saved Letters List */}
              {savedLetters.length > 0 && (
                <div className="bg-white p-4 rounded-2xl border border-neutral-200 text-xs space-y-2">
                  <span className="font-bold text-neutral-700 text-xs block">Saved Cover Letters</span>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    {savedLetters.map((cl) => (
                      <div
                        key={cl.id}
                        onClick={() => setGeneratedLetter(cl.content)}
                        className="p-2 rounded-lg bg-neutral-50 hover:bg-indigo-50/60 border border-neutral-200 cursor-pointer flex justify-between items-center transition-colors"
                      >
                        <div>
                          <p className="font-bold text-neutral-900">{cl.jobTitle} @ {cl.company}</p>
                          <p className="text-[10px] text-neutral-500">{cl.tone} · {new Date(cl.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Generated Letter Output (7 cols) */}
            <div className="lg:col-span-7 bg-white rounded-2xl border border-neutral-200/90 shadow-xs flex flex-col justify-between overflow-hidden">
              <div className="p-4 border-b border-neutral-100 flex items-center justify-between">
                <span className="font-bold text-xs text-neutral-900 flex items-center gap-1.5">
                  <FileText className="size-4 text-indigo-600" />
                  Cover Letter Preview &amp; Editor
                </span>

                {generatedLetter && (
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={handleCopy}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg border border-neutral-200 text-neutral-700 hover:bg-neutral-50 cursor-pointer"
                    >
                      {isCopied ? <Check className="size-3 text-emerald-600" /> : <Copy className="size-3" />}
                      <span>{isCopied ? "Copied!" : "Copy"}</span>
                    </button>

                    <button
                      onClick={handleDownloadDocx}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700 cursor-pointer"
                      title="Download Word Document"
                    >
                      <FileDown className="size-3 text-indigo-600" />
                      <span>DOCX</span>
                    </button>

                    <button
                      onClick={handleDownloadPdf}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg gradient-ai text-white shadow-2xs hover:opacity-95 cursor-pointer"
                      title="Download Print PDF"
                    >
                      <Download className="size-3" />
                      <span>PDF</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="p-6 flex-1 min-h-[460px]">
                {generatedLetter ? (
                  <textarea
                    value={generatedLetter}
                    onChange={(e) => setGeneratedLetter(e.target.value)}
                    className="w-full h-full min-h-[420px] p-4 text-xs font-sans bg-transparent border-0 focus:outline-none leading-relaxed text-neutral-800 resize-none"
                  />
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-12 text-neutral-400 space-y-2">
                    <Send className="size-8 text-neutral-300 mx-auto" />
                    <p className="text-xs font-semibold text-neutral-600">No cover letter generated yet</p>
                    <p className="text-[11px] max-w-xs text-neutral-400">
                      Fill in the target company, job title, and job description requirements on the left, then click &quot;Generate Tailored Letter&quot;.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
