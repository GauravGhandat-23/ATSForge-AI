"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Sparkles,
  Upload,
  History,
  Target,
  CheckCircle2,
  Loader2,
  ArrowRight,
  Eye,
  Edit3,
} from "lucide-react";
import { ResumeForm } from "@/components/builder/ResumeForm";
import { ResumePreview } from "@/components/preview/ResumePreview";
import { AIWizardModal } from "@/components/builder/AIWizardModal";
import { ImportResumeModal } from "@/components/builder/ImportResumeModal";
import { VersionHistoryModal } from "@/components/builder/VersionHistoryModal";
import { ResumeData } from "@/lib/types";
import { calculateATSScore } from "@/lib/ats-engine";

export default function BuilderByIdPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();

  const [resume, setResume] = useState<ResumeData | null>(null);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<string>("Not saved yet");
  const [mobileTab, setMobileTab] = useState<"edit" | "preview">("edit");
  const [isLoading, setIsLoading] = useState(true);

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchResume = async () => {
      try {
        if (typeof window !== "undefined") {
          const localListStr = localStorage.getItem("atsforge_resumes_list");
          if (localListStr) {
            const list: ResumeData[] = JSON.parse(localListStr);
            const found = list.find((r) => r.id === id);
            if (found) {
              setResume(found);
              setIsLoading(false);
              return;
            }
          }
        }

        const res = await fetch(`/api/resumes/${id}`);
        if (res.ok) {
          const data = await res.json();
          setResume(data.resume);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    if (id) fetchResume();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-20 text-xs text-neutral-500">
        <Loader2 className="size-6 animate-spin text-indigo-600 mr-2" />
        Loading resume...
      </div>
    );
  }

  if (!resume) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-20 text-center space-y-3">
        <h3 className="font-bold text-neutral-800 text-lg">Resume Not Found</h3>
        <p className="text-xs text-neutral-500">The resume could not be retrieved.</p>
        <Link href="/builder" className="px-4 py-2 rounded-xl gradient-ai text-white text-xs font-semibold">
          Open Resume Builder
        </Link>
      </div>
    );
  }

  const handleResumeChange = (updated: ResumeData) => {
    const calculated = calculateATSScore(
      updated,
      `Job Title: ${updated.targetRole}\nRequirements: Must have strong hands-on experience, measurable achievements, and team collaboration.`
    );
    updated.atsScore = calculated.overallScore;

    setResume(updated);
    setIsSaving(true);

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        await fetch(`/api/resumes/${updated.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updated),
        });
        setLastSavedTime("Just now");
      } catch (e) {
        console.error("Autosave error:", e);
      } finally {
        setIsSaving(false);
      }
    }, 1200);
  };

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden">
      {/* Editor Subheader Controls */}
      <div className="h-14 bg-white border-b border-neutral-200 px-4 sm:px-6 flex items-center justify-between shrink-0 select-none">
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={resume.title}
            onChange={(e) => handleResumeChange({ ...resume, title: e.target.value })}
            className="text-sm font-extrabold text-neutral-900 bg-transparent hover:bg-neutral-50 px-2 py-1 rounded-md border border-transparent hover:border-neutral-200 focus:border-indigo-500 focus:outline-none max-w-[200px] sm:max-w-[280px]"
            title="Click to rename"
          />

          <div className="hidden sm:flex items-center gap-1.5 text-xs text-neutral-400">
            <span>•</span>
            <span className="flex items-center gap-1">
              {isSaving ? (
                <>
                  <Loader2 className="size-3 animate-spin text-indigo-500" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="size-3 text-emerald-500" />
                  <span>Saved {lastSavedTime}</span>
                </>
              )}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex lg:hidden bg-neutral-100 p-0.5 rounded-lg border border-neutral-200">
            <button
              onClick={() => setMobileTab("edit")}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md ${
                mobileTab === "edit" ? "bg-white text-indigo-700 shadow-2xs" : "text-neutral-600"
              }`}
            >
              <Edit3 className="size-3.5 inline mr-1" /> Edit
            </button>
            <button
              onClick={() => setMobileTab("preview")}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md ${
                mobileTab === "preview" ? "bg-white text-indigo-700 shadow-2xs" : "text-neutral-600"
              }`}
            >
              <Eye className="size-3.5 inline mr-1" /> Preview
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsWizardOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl gradient-ai text-white text-xs font-bold shadow-xs hover:opacity-95"
          >
            <Sparkles className="size-3.5" />
            <span className="hidden sm:inline">AI Wizard</span>
          </button>

          <button
            type="button"
            onClick={() => setIsImportOpen(true)}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700 text-xs font-semibold"
          >
            <Upload className="size-3.5" />
            <span>Import</span>
          </button>

          <button
            type="button"
            onClick={() => setIsHistoryOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700 text-xs font-semibold"
            title="View snapshots"
          >
            <History className="size-3.5" />
            <span className="hidden sm:inline">Versions</span>
          </button>

          <Link
            href={`/ats-scanner?resumeId=${resume.id}`}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-extrabold hover:bg-emerald-100"
            title="Scan ATS Score"
          >
            <Target className="size-3.5 text-emerald-600" />
            <span>{resume.atsScore || 90}/100</span>
          </Link>

          <Link
            href={`/ai-tailor?resumeId=${resume.id}`}
            className="hidden md:inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-purple-50 border border-purple-200 text-purple-800 text-xs font-bold hover:bg-purple-100"
          >
            <Sparkles className="size-3.5 text-purple-600" />
            <span>Tailor</span>
          </Link>
        </div>
      </div>

      {/* Main Two-Panel Layout */}
      <div className="flex-1 flex overflow-hidden">
        <div
          id="editor-panel"
          className={`w-full lg:w-[45%] h-full overflow-hidden ${
            mobileTab === "preview" ? "hidden lg:block" : "block"
          }`}
        >
          <ResumeForm resume={resume} onChange={handleResumeChange} />
        </div>

        <div
          className={`w-full lg:w-[55%] h-full overflow-hidden border-l border-neutral-200 ${
            mobileTab === "edit" ? "hidden lg:block" : "block"
          }`}
        >
          <ResumePreview
            resume={resume}
            onUpdateTemplate={(t) => handleResumeChange({ ...resume, templateId: t })}
            onUpdateAccentColor={(c) =>
              handleResumeChange({
                ...resume,
                templateConfig: { ...resume.templateConfig, accentColor: c },
              })
            }
            onUpdateFont={(f) =>
              handleResumeChange({
                ...resume,
                templateConfig: { ...resume.templateConfig, fontFamily: f },
              })
            }
            onUpdatePaperSize={(s) =>
              handleResumeChange({
                ...resume,
                templateConfig: { ...resume.templateConfig, paperSize: s },
              })
            }
          />
        </div>
      </div>

      {/* Modals */}
      <AIWizardModal
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        onGenerated={(newResume) => setResume(newResume)}
      />

      <ImportResumeModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onImportConfirmed={(parsed) => {
          setResume({ ...resume, ...parsed });
          handleResumeChange({ ...resume, ...parsed });
        }}
      />

      <VersionHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        resumeId={resume.id}
        currentResume={resume}
        onRestore={(snapshot) => {
          setResume(snapshot);
          handleResumeChange(snapshot);
        }}
      />
    </div>
  );
}
