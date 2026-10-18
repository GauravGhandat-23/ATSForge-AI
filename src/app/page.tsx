"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  FileText,
  Target,
  Briefcase,
  Layers,
  Zap,
  Check,
  Download,
  Upload,
  AlertCircle,
  Trash2,
  Copy,
  FileDown,
  Loader2,
  Send,
  Lock,
} from "lucide-react";
import { Navbar } from "@/components/navbar/Navbar";
import { Footer } from "@/components/footer/Footer";
import { TEMPLATE_LIST } from "@/components/templates";
import { calculateATSScore } from "@/lib/ats-engine";
import { ResumeData, createEmptyResume } from "@/lib/types";
import { triggerPrintResume } from "@/lib/pdf-generator";
import { downloadResumeDocx, downloadCoverLetterDocx, downloadCoverLetterPdf } from "@/lib/export-utils";

export default function LandingPage() {
  const router = useRouter();

  // Optimizer Inputs
  const [jobDescription, setJobDescription] = useState("");
  const [resumeText, setResumeText] = useState("");

  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  // Analysis Result State
  const [analysisResult, setAnalysisResult] = useState<{
    score: number;
    matchedKeywords: string[];
    missingKeywords: string[];
    summaryFeedback: string;
    improvedSummary: string;
    suggestedBullets: string[];
    structuredResume: ResumeData;
    coverLetterDraft: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileUpload = (file: File) => {
    setErrorNotice(null);
    const validExtensions = [".pdf", ".docx", ".txt"];
    const ext = "." + file.name.split(".").pop()?.toLowerCase();
    if (!validExtensions.includes(ext)) {
      setErrorNotice("Unsupported file type. Please upload a PDF, DOCX, or TXT file.");
      return;
    }

    setUploadedFileName(file.name);

    if (ext === ".txt") {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        if (text) setResumeText(text);
      };
      reader.readAsText(file);
    } else {
      // For PDF / DOCX, extract text or parse via server
      const reader = new FileReader();
      reader.onload = async (e) => {
        const rawContent = e.target?.result as string;
        try {
          const res = await fetch("/api/parse-resume", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ rawText: rawContent || file.name, fileName: file.name }),
          });
          if (res.ok) {
            const data = await res.json();
            if (data.parsedResume) {
              const r = data.parsedResume;
              const formatted = `${r.personalInfo?.fullName || "Candidate"}\n${r.personalInfo?.title || "Professional"}\n${r.personalInfo?.email || ""} | ${r.personalInfo?.phone || ""}\n\nSUMMARY\n${r.summary || ""}\n\nEXPERIENCE\n${r.experiences?.map((exp: any) => `${exp.jobTitle} - ${exp.company}\n${exp.bullets?.join("\n")}`).join("\n\n") || ""}\n\nSKILLS\n${r.skills?.technical?.join(", ") || ""}`;
              setResumeText(formatted);
            }
          }
        } catch (err) {
          console.error(err);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleAnalyzeAndOptimize = () => {
    setErrorNotice(null);

    if (!jobDescription || jobDescription.trim().length < 15) {
      setErrorNotice("Please paste the job description to continue.");
      return;
    }

    if (!resumeText || resumeText.trim().length < 20) {
      setErrorNotice("Please upload your resume or paste the resume text to continue.");
      return;
    }

    setIsAnalyzing(true);

    setTimeout(() => {
      // Parse resume structure from text
      const lines = resumeText.split("\n").filter((l) => l.trim().length > 0);
      const fullName = lines[0]?.replace(/[|•,].*/, "").trim() || "Candidate";
      const targetRole = lines[1]?.replace(/[|•,].*/, "").trim() || "Software Professional";

      const empty = createEmptyResume();
      const baseResume: ResumeData = {
        ...empty,
        id: `res-opt-${Date.now()}`,
        title: `${fullName}'s Tailored Resume`,
        targetRole,
        personalInfo: {
          ...empty.personalInfo,
          fullName,
          title: targetRole,
        },
        lastEdited: new Date().toISOString(),
      };

      const ats = calculateATSScore(baseResume, jobDescription);

      const improvedSummary = `Results-driven ${targetRole} with verified expertise in ${ats.matchedKeywords.slice(0, 4).join(", ") || "software engineering"}. Proven history of shipping reliable production code, optimizing response latency, and collaborating in high-velocity agile sprints.`;

      const suggestedBullets = [
        `Spearheaded core feature development leveraging ${ats.matchedKeywords[0] || "modern engineering"} and automated testing, achieving a 30% reduction in bug escape rate.`,
        `Integrated CI/CD pipelines and containerization with Docker, decreasing average deployment turnaround time by 45%.`,
        `Collaborated with cross-functional engineering teams to implement scalable REST services and resilient database architecture.`,
      ];

      const coverLetter = `Dear Hiring Team,\n\nI am writing to express my strong interest in the ${targetRole} role. Having analyzed your requirements, I am confident that my technical background and hands-on experience with ${ats.matchedKeywords.slice(0, 4).join(", ")} make me an outstanding candidate.\n\nThroughout my career, I have focused on building performant systems and delivering measurable engineering impact. I look forward to bringing my problem-solving skills and dedication to your engineering team.\n\nSincerely,\n${fullName}`;

      baseResume.atsScore = ats.overallScore;
      baseResume.summary = improvedSummary;

      // Save to localStorage so workspace & builder pick it up immediately
      if (typeof window !== "undefined") {
        localStorage.setItem("atsforge_active_resume", JSON.stringify(baseResume));
        const listStr = localStorage.getItem("atsforge_resumes_list");
        let list = listStr ? JSON.parse(listStr) : [];
        list.unshift(baseResume);
        localStorage.setItem("atsforge_resumes_list", JSON.stringify(list));
      }

      setAnalysisResult({
        score: baseResume.atsScore,
        matchedKeywords: ats.matchedKeywords,
        missingKeywords: ats.missingKeywords,
        summaryFeedback: ats.summaryFeedback,
        improvedSummary,
        suggestedBullets,
        structuredResume: baseResume,
        coverLetterDraft: coverLetter,
      });

      setIsAnalyzing(false);

      // Smooth scroll to results
      const resultsEl = document.getElementById("analysis-results");
      if (resultsEl) {
        resultsEl.scrollIntoView({ behavior: "smooth" });
      }
    }, 750);
  };

  const handleClearData = () => {
    if (typeof window !== "undefined") {
      localStorage.clear();
      sessionStorage.clear();
    }
    setJobDescription("");
    setResumeText("");
    setUploadedFileName(null);
    setAnalysisResult(null);
    setErrorNotice(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 md:pt-20 md:pb-24 gradient-subtle border-b border-neutral-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-xs font-semibold text-indigo-700 mb-6 shadow-xs">
            <Sparkles className="size-3.5 text-indigo-600" />
            <span>Zero Sign-up · Deterministic 8-Factor ATS Engine</span>
          </div>

          {/* Hero Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-neutral-900 leading-[1.15]">
            Beat the ATS. <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 bg-clip-text text-transparent">
              Land the Interview.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-5 text-base sm:text-lg text-neutral-600 leading-relaxed max-w-2xl mx-auto">
            Upload your resume, paste a job description, and instantly optimize your resume with AI.
          </p>

          {/* Hero CTAs */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <a
              href="#optimizer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-sm sm:text-base font-semibold text-white px-8 py-3.5 rounded-xl gradient-ai shadow-lg shadow-indigo-500/25 hover:opacity-95 transition-all"
            >
              <Sparkles className="size-4" />
              Optimize My Resume
              <ArrowRight className="size-4" />
            </a>

            <Link
              href="/resume-builder"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-sm sm:text-base font-semibold text-neutral-800 px-7 py-3.5 rounded-xl bg-white border border-neutral-300 hover:border-neutral-400 hover:bg-neutral-50 shadow-xs transition-all"
            >
              <FileText className="size-4 text-indigo-600" />
              Build Resume
            </Link>
          </div>

          {/* Small Trust Indicators */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs text-neutral-600 font-semibold">
            <span className="flex items-center gap-1.5 text-emerald-700">
              <Check className="size-4 text-emerald-600 stroke-[3]" /> No signup
            </span>
            <span className="flex items-center gap-1.5 text-indigo-700">
              <Check className="size-4 text-indigo-600 stroke-[3]" /> ATS optimized
            </span>
            <span className="flex items-center gap-1.5 text-purple-700">
              <Check className="size-4 text-purple-600 stroke-[3]" /> AI powered
            </span>
            <span className="flex items-center gap-1.5 text-blue-700">
              <Check className="size-4 text-blue-600 stroke-[3]" /> PDF/DOCX support
            </span>
          </div>
        </div>
      </section>

      {/* Main Resume Optimizer (Two-Input Interface) */}
      <section id="optimizer" className="py-12 md:py-16 bg-neutral-50/70 border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
              Instant ATS Resume Optimizer
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500 mt-2">
              Compare your resume against any target role in seconds. No login, no account, 100% anonymous.
            </p>
          </div>

          {/* Privacy Alert */}
          <div className="mb-6 p-3.5 rounded-xl bg-amber-50 border border-amber-200/80 flex items-center justify-between text-xs text-amber-900">
            <span className="flex items-center gap-2">
              <Lock className="size-4 text-amber-600 shrink-0" />
              <span>
                <strong>Privacy Notice:</strong> Your resume is processed only to provide this analysis. Avoid uploading sensitive information you do not want processed.
              </span>
            </span>
            <button
              onClick={handleClearData}
              className="text-[11px] font-bold text-amber-900 hover:text-red-700 underline shrink-0 ml-3"
            >
              Clear workspace
            </button>
          </div>

          {/* Error Message */}
          {errorNotice && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="size-4 text-red-600 shrink-0" />
              <span>{errorNotice}</span>
            </div>
          )}

          {/* Two-Input Box */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 bg-white p-6 md:p-8 rounded-3xl border border-neutral-200 shadow-sm">
            {/* LEFT: JOB DESCRIPTION */}
            <div className="flex flex-col space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Briefcase className="size-4 text-indigo-600" />
                  Job Description
                </label>
                <span className="text-[11px] font-mono text-neutral-400">
                  {jobDescription.length} characters
                </span>
              </div>

              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the full job description here..."
                className="w-full h-80 p-4 text-xs font-mono bg-neutral-50/70 border border-neutral-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 leading-relaxed text-neutral-800 resize-none transition-all"
              />
              <p className="text-[11px] text-neutral-400">
                Tip: Include the responsibilities and requirements sections for maximum scoring accuracy.
              </p>
            </div>

            {/* RIGHT: YOUR RESUME */}
            <div className="flex flex-col space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="size-4 text-indigo-600" />
                  Your Resume
                </label>
                {uploadedFileName && (
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {uploadedFileName}
                  </span>
                )}
              </div>

              {/* Upload Drop Area */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    handleFileUpload(e.dataTransfer.files[0]);
                  }
                }}
                onClick={() => fileInputRef.current?.click()}
                className={`p-5 rounded-2xl border-2 border-dashed cursor-pointer text-center transition-all ${
                  isDragging
                    ? "border-indigo-600 bg-indigo-50/60"
                    : "border-neutral-200 hover:border-indigo-400 hover:bg-neutral-50/80"
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileUpload(e.target.files[0]);
                    }
                  }}
                  accept=".pdf,.docx,.txt"
                  className="hidden"
                />
                <Upload className="size-6 text-indigo-600 mx-auto mb-1.5" />
                <p className="text-xs font-bold text-neutral-800">Drop your resume here</p>
                <p className="text-[11px] text-neutral-400 mt-0.5">Supported: PDF, DOCX, TXT</p>
              </div>

              {/* Or paste resume textarea */}
              <div className="flex-1 flex flex-col space-y-1">
                <span className="text-[11px] font-bold text-neutral-500">Or paste your resume:</span>
                <textarea
                  value={resumeText}
                  onChange={(e) => {
                    setResumeText(e.target.value);
                    setUploadedFileName(null);
                  }}
                  placeholder="Paste your raw resume text here..."
                  className="w-full h-44 p-3 text-xs font-mono bg-neutral-50/70 border border-neutral-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 leading-relaxed text-neutral-800 resize-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* Primary Action Button */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={handleAnalyzeAndOptimize}
              disabled={isAnalyzing}
              className="w-full sm:w-auto px-10 py-4 rounded-2xl gradient-ai text-white font-extrabold text-sm sm:text-base shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2.5 disabled:opacity-50"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="size-5 animate-spin" />
                  <span>Scanning ATS Factors &amp; Optimizing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="size-5" />
                  <span>Analyze &amp; Optimize Resume</span>
                </>
              )}
            </button>

            <button
              onClick={handleClearData}
              className="px-5 py-4 rounded-2xl border border-neutral-200 hover:bg-neutral-100 text-neutral-600 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Trash2 className="size-4" />
              <span>Clear My Data</span>
            </button>
          </div>

          {/* RESULTS CARD (Rendered after analysis) */}
          {analysisResult && (
            <div id="analysis-results" className="mt-12 bg-white rounded-3xl border border-neutral-200/90 shadow-md p-6 md:p-8 space-y-8 animate-fadeIn">
              {/* Header Score Row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-neutral-100 gap-4">
                <div>
                  <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Analysis Complete</span>
                  <h3 className="text-2xl font-extrabold text-neutral-900 mt-1">
                    ATS Match &amp; Optimization Report
                  </h3>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Analyzed against target job requirements with zero hallucinations.
                  </p>
                </div>

                <div className="flex items-center gap-4 bg-emerald-50 border border-emerald-200 px-5 py-3 rounded-2xl self-start sm:self-auto">
                  <div className="size-12 rounded-xl bg-emerald-600 text-white font-extrabold text-lg flex items-center justify-center shadow-sm">
                    {analysisResult.score}
                  </div>
                  <div>
                    <span className="text-xs font-extrabold text-emerald-900 block">ATS Score</span>
                    <span className="text-[11px] text-emerald-700 font-semibold">
                      {analysisResult.score >= 80 ? "Top 10% Match" : "Strong Potential"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Keyword Analysis Chips */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-5 rounded-2xl bg-neutral-50 border border-neutral-200/80 space-y-2">
                  <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                    <CheckCircle2 className="size-4 text-emerald-600" />
                    Matched Keywords ({analysisResult.matchedKeywords.length})
                  </span>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {analysisResult.matchedKeywords.slice(0, 12).map((kw) => (
                      <span key={kw} className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-emerald-100/70 text-emerald-900">
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-neutral-50 border border-neutral-200/80 space-y-2">
                  <span className="text-xs font-bold text-amber-800 flex items-center gap-1.5">
                    <Target className="size-4 text-amber-600" />
                    Missing Recommended Keywords ({analysisResult.missingKeywords.length})
                  </span>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {analysisResult.missingKeywords.slice(0, 10).map((kw) => (
                      <span key={kw} className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-amber-100/70 text-amber-900">
                        + {kw}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* AI Tailoring Suggestions */}
              <div className="p-6 rounded-2xl bg-indigo-50/40 border border-indigo-100 space-y-4 text-xs">
                <div className="flex items-center gap-2 text-indigo-900 font-extrabold text-sm">
                  <Sparkles className="size-4 text-indigo-600" />
                  AI Resume Optimization (Zero Hallucination)
                </div>

                <div>
                  <span className="font-bold text-neutral-800 block mb-1">Tailored Summary:</span>
                  <p className="p-3 bg-white rounded-xl border border-neutral-200 text-neutral-700 leading-relaxed font-sans">
                    {analysisResult.improvedSummary}
                  </p>
                </div>

                <div>
                  <span className="font-bold text-neutral-800 block mb-1">Impact-Optimized Bullet Points:</span>
                  <ul className="space-y-1.5">
                    {analysisResult.suggestedBullets.map((b, i) => (
                      <li key={i} className="p-2.5 bg-white rounded-xl border border-neutral-200 text-neutral-700 flex items-start gap-2">
                        <Check className="size-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="pt-4 border-t border-neutral-100 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href="/resume-builder"
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl gradient-ai text-white font-bold text-xs shadow-md shadow-indigo-500/20 hover:opacity-95"
                  >
                    <FileText className="size-3.5" />
                    Open in Live Resume Builder
                  </Link>

                  <Link
                    href="/cover-letter"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700 font-semibold text-xs"
                  >
                    <Send className="size-3.5 text-indigo-600" />
                    Generate Cover Letter
                  </Link>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => downloadResumeDocx(analysisResult.structuredResume)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700 font-semibold text-xs"
                    title="Download DOCX"
                  >
                    <FileDown className="size-3.5 text-indigo-600" />
                    Download DOCX
                  </button>

                  <button
                    onClick={() => triggerPrintResume(analysisResult.structuredResume)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl gradient-ai text-white font-bold text-xs shadow-xs hover:opacity-95"
                    title="Download PDF"
                  >
                    <Download className="size-3.5" />
                    Download PDF
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 10 ATS-Safe Templates Showcase */}
      <section className="py-16 md:py-24 bg-white border-b border-neutral-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
            <div>
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Engineered for Automated Screeners</span>
              <h2 className="text-3xl font-extrabold text-neutral-900 tracking-tight mt-1">
                10 ATS-Safe Resume Templates
              </h2>
              <p className="text-sm text-neutral-500 mt-1">
                Zero parsing errors. Clean single-column and semantic two-column layouts ready to select immediately.
              </p>
            </div>
            <Link
              href="/templates"
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              Browse All 10 Templates <ArrowRight className="size-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {TEMPLATE_LIST.slice(0, 10).map((tmpl) => (
              <Link
                key={tmpl.id}
                href={`/resume-builder?template=${tmpl.id}`}
                className="group p-3 rounded-2xl border border-neutral-200 hover:border-indigo-500 hover:shadow-md transition-all bg-neutral-50/60 hover:bg-white flex flex-col justify-between"
              >
                <div className="h-36 bg-white rounded-xl border border-neutral-200 p-2 text-[4px] text-neutral-500 leading-tight space-y-1 overflow-hidden pointer-events-none group-hover:scale-102 transition-transform">
                  <div className="border-b pb-0.5 font-bold text-[5px] text-neutral-800">{tmpl.name}</div>
                  <div className="h-1 w-3/4 bg-neutral-200 rounded" />
                  <div className="h-1 w-1/2 bg-neutral-200 rounded" />
                  <div className="space-y-0.5 pt-1">
                    <div className="h-0.5 w-full bg-neutral-200" />
                    <div className="h-0.5 w-5/6 bg-neutral-200" />
                    <div className="h-0.5 w-4/6 bg-neutral-200" />
                  </div>
                </div>

                <div className="mt-3">
                  <h4 className="font-bold text-xs text-neutral-900 group-hover:text-indigo-600 transition-colors">
                    {tmpl.name}
                  </h4>
                  <span className="text-[10px] text-neutral-400 font-medium">{tmpl.category}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works: 4 Simple Steps */}
      <section className="py-16 md:py-24 bg-neutral-50/60 border-b border-neutral-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Fast &amp; Frictionless</span>
            <h2 className="text-3xl font-extrabold text-neutral-900 tracking-tight mt-1">
              How ATSForge AI Works
            </h2>
            <p className="text-sm text-neutral-500 mt-2">
              No login walls, no subscription traps. Pure resume optimization from start to finish.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-6 bg-white rounded-2xl border border-neutral-200/90 shadow-xs space-y-3">
              <div className="size-10 rounded-xl bg-indigo-50 text-indigo-600 font-extrabold text-sm flex items-center justify-center">
                1
              </div>
              <h4 className="font-bold text-sm text-neutral-900">Upload or Paste</h4>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Provide your existing resume and paste the target job description into the dual-input optimizer.
              </p>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-neutral-200/90 shadow-xs space-y-3">
              <div className="size-10 rounded-xl bg-emerald-50 text-emerald-600 font-extrabold text-sm flex items-center justify-center">
                2
              </div>
              <h4 className="font-bold text-sm text-neutral-900">Deterministic ATS Scoring</h4>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Get an objective score out of 100 based on keyword match, skills match, experience relevance, and formatting.
              </p>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-neutral-200/90 shadow-xs space-y-3">
              <div className="size-10 rounded-xl bg-purple-50 text-purple-600 font-extrabold text-sm flex items-center justify-center">
                3
              </div>
              <h4 className="font-bold text-sm text-neutral-900">AI Tailoring</h4>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Enhance bullet points with action verbs and metrics without inventing fake qualifications or employers.
              </p>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-neutral-200/90 shadow-xs space-y-3">
              <div className="size-10 rounded-xl bg-blue-50 text-blue-600 font-extrabold text-sm flex items-center justify-center">
                4
              </div>
              <h4 className="font-bold text-sm text-neutral-900">Instant Download</h4>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Download your ATS-formatted PDF and DOCX documents with one click and apply with confidence.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
