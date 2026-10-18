"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  History,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Loader2,
  Calendar,
  CheckCircle2,
  FileText,
  AlertCircle,
} from "lucide-react";
import { Topbar } from "@/components/dashboard/Topbar";
import { ResumeData, ResumeVersion } from "@/lib/types";

export default function ResumeVersionsPage() {
  const router = useRouter();
  const [resumes, setResumes] = useState<ResumeData[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string>("");
  const [versions, setVersions] = useState<ResumeVersion[]>([]);
  const [loadingResumes, setLoadingResumes] = useState(true);
  const [loadingVersions, setLoadingVersions] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

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
        setLoadingResumes(false);
      }
    };
    fetchResumes();
  }, []);

  useEffect(() => {
    if (!selectedResumeId) {
      setVersions([]);
      return;
    }
    const fetchVersions = async () => {
      setLoadingVersions(true);
      try {
        const res = await fetch(`/api/resumes/${selectedResumeId}/versions`);
        if (res.ok) {
          const data = await res.json();
          setVersions(data.versions || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingVersions(false);
      }
    };
    fetchVersions();
  }, [selectedResumeId]);

  const handleRestore = (ver: ResumeVersion) => {
    if (!confirm(`Restore "${ver.label}" to the Resume Builder?`)) return;
    localStorage.setItem("atsforge_active_resume", JSON.stringify(ver.snapshot));
    router.push(`/builder/${selectedResumeId}`);
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-neutral-50/50">
      <Topbar title="Resume Versions" />

      <main className="flex-1 p-6 lg:p-8 max-w-5xl w-full mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Resume Versions</h1>
            <p className="text-sm text-neutral-500 mt-0.5">
              Review version snapshots, track historical edits, and restore previous iterations.
            </p>
          </div>
        </div>

        {feedback && (
          <div className="p-3 bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold rounded-xl">
            {feedback}
          </div>
        )}

        {loadingResumes ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="size-8 text-indigo-600 animate-spin" />
            <p className="text-sm text-neutral-500 font-medium">Loading resumes...</p>
          </div>
        ) : resumes.length === 0 ? (
          <div className="p-12 text-center bg-white border border-dashed border-neutral-300 rounded-2xl space-y-4">
            <div className="size-14 mx-auto rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <History className="size-7" />
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h3 className="text-base font-bold text-neutral-900">No Resumes Found</h3>
              <p className="text-xs text-neutral-500">
                You need at least one resume to view and save versions. Create a resume first!
              </p>
            </div>
            <Link
              href="/resume-builder"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
            >
              <span>Create Resume</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Resume Selector */}
            <div className="p-5 bg-white border border-neutral-200/90 rounded-2xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <label className="text-xs font-bold text-neutral-700">Select Resume:</label>
              <select
                value={selectedResumeId}
                onChange={(e) => setSelectedResumeId(e.target.value)}
                className="w-full sm:w-80 px-3 py-2 text-xs font-semibold rounded-xl border border-neutral-200 bg-neutral-50 text-neutral-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {resumes.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.title} ({r.targetRole || "Role"})
                  </option>
                ))}
              </select>
            </div>

            {/* Versions List */}
            {loadingVersions ? (
              <div className="py-12 flex justify-center">
                <Loader2 className="size-6 text-indigo-600 animate-spin" />
              </div>
            ) : versions.length === 0 ? (
              <div className="p-10 text-center bg-white border border-neutral-200 rounded-2xl space-y-3">
                <History className="size-8 text-neutral-400 mx-auto" />
                <h3 className="text-sm font-bold text-neutral-800">No Saved Versions for this Resume</h3>
                <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                  In the Resume Builder, click &quot;Version History&quot; to snapshot important revisions anytime you update your resume.
                </p>
                <Link
                  href={`/builder/${selectedResumeId}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-xl text-xs font-bold transition-colors"
                >
                  <span>Open in Builder</span>
                  <ArrowRight className="size-3.5" />
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {versions.map((ver) => (
                  <div
                    key={ver.id}
                    className="p-4 bg-white border border-neutral-200 rounded-2xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-neutral-300 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="size-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
                        v{ver.versionNumber}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-neutral-900">{ver.label}</h4>
                        <div className="flex items-center gap-3 text-[11px] text-neutral-500 mt-0.5">
                          <span>Target: {ver.targetRole || "General"}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="size-3" />
                            {new Date(ver.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs font-extrabold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        ATS {ver.atsScore}%
                      </span>
                      <button
                        onClick={() => handleRestore(ver)}
                        className="px-3 py-1.5 bg-neutral-100 hover:bg-indigo-600 hover:text-white text-neutral-700 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5"
                      >
                        <RotateCcw className="size-3.5" />
                        <span>Restore Snapshot</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
