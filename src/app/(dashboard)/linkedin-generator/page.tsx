"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Sparkles, Copy, Check, FileText, Share2, Loader2, AlertCircle, PlusCircle } from "lucide-react";
import { Topbar } from "@/components/dashboard/Topbar";
import { LinkedInProfile, ResumeData } from "@/lib/types";

export default function LinkedInGeneratorPage() {
  const [resumes, setResumes] = useState<ResumeData[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [profile, setProfile] = useState<LinkedInProfile | null>(null);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
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

  const handleGenerate = async () => {
    setErrorMsg(null);
    const selected = resumes.find((r) => r.id === selectedResumeId);
    if (!selected) {
      setErrorMsg("Please select a valid resume first.");
      return;
    }

    setIsGenerating(true);
    try {
      const res = await fetch("/api/linkedin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeId: selected.id,
          resumeData: selected,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to generate LinkedIn profile");
      }
      setProfile(data.profile);
    } catch (e: any) {
      setErrorMsg(e.message || "Failed to generate LinkedIn profile");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string, sectionName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionName);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  return (
    <div className="flex-1 flex flex-col">
      <Topbar title="LinkedIn Profile Optimizer" />

      <main className="p-6 md:p-8 space-y-8 max-w-7xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
              LinkedIn Profile Generator
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500 mt-1">
              Transform your resume into a high-visibility LinkedIn presence that attracts technical recruiters.
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
                Create or import a resume in the Resume Builder first to generate optimized LinkedIn headlines and summaries.
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
            {/* Top Controls Card */}
            <div className="bg-white p-5 rounded-2xl border border-neutral-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-neutral-700 uppercase tracking-wider">Source Resume:</span>
                <select
                  value={selectedResumeId}
                  onChange={(e) => setSelectedResumeId(e.target.value)}
                  className="p-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-semibold text-neutral-800"
                >
                  {resumes.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.title || "Untitled Resume"} ({r.targetRole || "No Target Role"})
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="px-6 py-2.5 rounded-xl gradient-ai text-white font-bold text-xs shadow-md shadow-indigo-500/25 flex items-center gap-1.5 hover:opacity-95 disabled:opacity-50 cursor-pointer"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" /> Generating Profile Copy...
                  </>
                ) : (
                  <>
                    <Sparkles className="size-3.5" /> Generate Complete Profile
                  </>
                )}
              </button>
            </div>

            {/* Profile Output */}
            {profile ? (
              <div className="space-y-6 animate-in fade-in-50">
                {/* 1. Headline */}
                <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-xs space-y-2">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-xs uppercase tracking-wider text-neutral-500">
                      Targeted LinkedIn Headline (220 max chars)
                    </h3>
                    <button
                      onClick={() => copyToClipboard(profile.headline, "headline")}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                    >
                      {copiedSection === "headline" ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5" />}
                      <span>{copiedSection === "headline" ? "Copied!" : "Copy Headline"}</span>
                    </button>
                  </div>
                  <p className="text-sm font-bold text-neutral-900 bg-neutral-50 p-3 rounded-xl border border-neutral-200">
                    {profile.headline}
                  </p>
                </div>

                {/* 2. About Section */}
                <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-xs space-y-2">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-xs uppercase tracking-wider text-neutral-500">
                      Professional About / Bio
                    </h3>
                    <button
                      onClick={() => copyToClipboard(profile.about, "about")}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                    >
                      {copiedSection === "about" ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5" />}
                      <span>{copiedSection === "about" ? "Copied!" : "Copy About"}</span>
                    </button>
                  </div>
                  <div className="text-xs text-neutral-800 bg-neutral-50 p-4 rounded-xl border border-neutral-200 whitespace-pre-line leading-relaxed">
                    {profile.about}
                  </div>
                </div>

                {/* 3. Skills Matrix */}
                <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-xs space-y-3">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-xs uppercase tracking-wider text-neutral-500">
                      Recommended Endorsement Skills (Top Ranked)
                    </h3>
                    <button
                      onClick={() => copyToClipboard(profile.skillsList.join(", "), "skills")}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                    >
                      {copiedSection === "skills" ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5" />}
                      <span>{copiedSection === "skills" ? "Copied!" : "Copy Skills"}</span>
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {profile.skillsList.map((skill) => (
                      <span key={skill} className="px-3 py-1 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs font-semibold">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* 4. Featured Section Ideas */}
                <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-xs space-y-3">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-neutral-500">
                    Featured Section Recommendations
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                    {profile.featuredSectionIdeas.map((idea, i) => (
                      <div key={i} className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200 space-y-1">
                        <span className="font-bold text-indigo-700">Suggestion #{i + 1}</span>
                        <p className="text-neutral-700">{idea}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-20 text-center space-y-3 bg-white rounded-2xl border border-neutral-200 p-8">
                <Share2 className="size-10 text-neutral-300 mx-auto" />
                <h3 className="font-bold text-neutral-800 text-base">Generate Your LinkedIn Presence</h3>
                <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                  Select your resume above and click &quot;Generate Complete Profile&quot; to receive custom headlines, about sections, and skills.
                </p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
