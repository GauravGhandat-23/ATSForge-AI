"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Sparkles,
  Upload,
  History,
  Target,
  Save,
  CheckCircle2,
  Loader2,
  Eye,
  Edit3,
} from "lucide-react";
import { ResumeForm } from "@/components/builder/ResumeForm";
import { ResumePreview } from "@/components/preview/ResumePreview";
import { AIWizardModal } from "@/components/builder/AIWizardModal";
import { ImportResumeModal } from "@/components/builder/ImportResumeModal";
import { VersionHistoryModal } from "@/components/builder/VersionHistoryModal";
import { ResumeData, createEmptyResume } from "@/lib/types";
import { calculateATSScore } from "@/lib/ats-engine";

export default function ResumeBuilderPage() {
  const router = useRouter();
  const [resume, setResume] = useState<ResumeData>(createEmptyResume());
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedToBrowserFeedback, setSavedToBrowserFeedback] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<string>("Not saved yet");
  const [mobileTab, setMobileTab] = useState<"edit" | "preview">("edit");

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize from browser localStorage or user-saved resume
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("atsforge_active_resume");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed && parsed.id) {
            setResume(parsed);
            return;
          }
        } catch (e) {
          console.error(e);
        }
      }
    }

    const fetchFirstResume = async () => {
      try {
        const res = await fetch("/api/resumes");
        if (res.ok) {
          const data = await res.json();
          if (data.resumes && data.resumes.length > 0) {
            setResume(data.resumes[0]);
          }
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchFirstResume();
  }, []);

  const saveToBrowserStorage = (data: ResumeData) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("atsforge_active_resume", JSON.stringify(data));
      // Also update list of local resumes
      const listStr = localStorage.getItem("atsforge_resumes_list");
      let list: ResumeData[] = listStr ? JSON.parse(listStr) : [];
      const idx = list.findIndex((r) => r.id === data.id);
      if (idx >= 0) {
        list[idx] = data;
      } else {
        list.unshift(data);
      }
      localStorage.setItem("atsforge_resumes_list", JSON.stringify(list));
    }
  };

  // Debounced Autosave to browser & temporary session
  const handleResumeChange = (updated: ResumeData) => {
    // Recalculate baseline ATS score in real-time
    const calculated = calculateATSScore(
      updated,
      `Job Title: ${updated.targetRole}\nRequirements: Must have strong hands-on experience, measurable achievements, and team collaboration.`
    );
    updated.atsScore = calculated.overallScore;

    setResume(updated);
    setIsSaving(true);
    saveToBrowserStorage(updated);

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

  const handleManualSaveToBrowser = () => {
    saveToBrowserStorage(resume);
    setSavedToBrowserFeedback(true);
    setTimeout(() => {
      setSavedToBrowserFeedback(false);
    }, 2000);
  };

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden">
      {/* Editor Subheader Controls */}
      <div className="h-14 bg-white border-b border-neutral-200 px-4 sm:px-6 flex items-center justify-between shrink-0 select-none">
        {/* Title & Target Role */}
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
                  <span>Saving to browser...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="size-3 text-emerald-500" />
                  <span>Saved to browser {lastSavedTime}</span>
                </>
              )}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Explicit Save to Browser CTA */}
          <button
            type="button"
            onClick={handleManualSaveToBrowser}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
              savedToBrowserFeedback
                ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                : "border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700"
            }`}
            title="Saves instantly to your local browser storage (no account needed)"
          >
            {savedToBrowserFeedback ? (
              <>
                <CheckCircle2 className="size-3.5 text-emerald-600" />
                <span>Saved to Browser!</span>
              </>
            ) : (
              <>
                <Save className="size-3.5 text-indigo-600" />
                <span>Save to Browser</span>
              </>
            )}
          </button>

          {/* Mobile Edit/Preview Tab Switcher */}
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
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-extrabold hover:bg-emerald-100 transition-colors"
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
        {/* Left Form Panel (~45%) */}
        <div
          id="editor-panel"
          className={`w-full lg:w-[45%] h-full overflow-hidden ${
            mobileTab === "preview" ? "hidden lg:block" : "block"
          }`}
        >
          <ResumeForm resume={resume} onChange={handleResumeChange} />
        </div>

        {/* Right Preview Panel (~55%) */}
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
        onGenerated={(newResume) => {
          setResume(newResume);
          handleResumeChange(newResume);
        }}
      />

      <ImportResumeModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onImportConfirmed={(parsed) => {
          const merged = { ...resume, ...parsed };
          setResume(merged);
          handleResumeChange(merged);
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
