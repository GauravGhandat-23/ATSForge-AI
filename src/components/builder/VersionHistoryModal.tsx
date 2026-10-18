"use client";

import React, { useState, useEffect } from "react";
import { History, Clock, Check, X, RotateCcw, Copy, ArrowRight, Eye, ShieldCheck } from "lucide-react";
import { ResumeData, ResumeVersion } from "@/lib/types";

interface VersionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  resumeId: string;
  currentResume: ResumeData;
  onRestore: (snapshot: ResumeData) => void;
}

export function VersionHistoryModal({
  isOpen,
  onClose,
  resumeId,
  currentResume,
  onRestore,
}: VersionHistoryModalProps) {
  const [versions, setVersions] = useState<ResumeVersion[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<ResumeVersion | null>(null);
  const [isComparing, setIsComparing] = useState(false);
  const [snapshotLabel, setSnapshotLabel] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const fetchVersions = async () => {
    try {
      const res = await fetch(`/api/resumes/${resumeId}/versions`);
      if (res.ok) {
        const data = await res.json();
        setVersions(data.versions || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (isOpen && resumeId) {
      fetchVersions();
    }
  }, [isOpen, resumeId]);

  if (!isOpen) return null;

  const handleSaveSnapshot = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/resumes/${resumeId}/versions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label: snapshotLabel || `Snapshot #${versions.length + 1}` }),
      });
      if (res.ok) {
        setSnapshotLabel("");
        fetchVersions();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRestore = (ver: ResumeVersion) => {
    if (confirm(`Restore snapshot "${ver.label}"? Your current changes will be superseded.`)) {
      onRestore(ver.snapshot);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-neutral-200 w-full max-w-3xl overflow-hidden animate-in fade-in-50 zoom-in-95">
        {/* Header */}
        <div className="p-5 border-b border-neutral-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <History className="size-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-neutral-900">Version History & Snapshots</h3>
              <p className="text-xs text-neutral-500">Restore or compare past revisions of this resume</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100">
            <X className="size-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Create new snapshot bar */}
          <div className="flex gap-2 p-3 bg-neutral-50 rounded-xl border border-neutral-200 items-center">
            <input
              type="text"
              value={snapshotLabel}
              onChange={(e) => setSnapshotLabel(e.target.value)}
              placeholder="Name this snapshot (e.g. Applied to Google Cloud role)..."
              className="flex-1 px-3 py-1.5 text-xs bg-white border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
            <button
              onClick={handleSaveSnapshot}
              disabled={isSaving}
              className="px-4 py-1.5 rounded-lg gradient-ai text-white text-xs font-semibold shadow-2xs hover:opacity-95 disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Save Snapshot"}
            </button>
          </div>

          {/* List or Compare view */}
          {isComparing && selectedVersion ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="text-xs font-bold text-neutral-800">
                  Comparing: Current Editor vs Snapshot ({selectedVersion.label})
                </span>
                <button
                  onClick={() => setIsComparing(false)}
                  className="text-xs text-indigo-600 hover:underline font-semibold"
                >
                  Back to List
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs font-mono bg-neutral-50 p-4 rounded-xl border">
                <div>
                  <p className="font-bold text-neutral-900 font-sans mb-1">Current Active Resume</p>
                  <p className="text-neutral-600"><strong>Title:</strong> {currentResume.title}</p>
                  <p className="text-neutral-600"><strong>Target:</strong> {currentResume.targetRole}</p>
                  <p className="text-neutral-600 mt-2"><strong>Summary:</strong></p>
                  <p className="text-[11px] text-neutral-500 italic mt-0.5">{currentResume.summary}</p>
                </div>
                <div className="border-l pl-4 border-neutral-200">
                  <p className="font-bold text-indigo-700 font-sans mb-1">{selectedVersion.label}</p>
                  <p className="text-neutral-600"><strong>Title:</strong> {selectedVersion.snapshot.title}</p>
                  <p className="text-neutral-600"><strong>Target:</strong> {selectedVersion.snapshot.targetRole}</p>
                  <p className="text-neutral-600 mt-2"><strong>Summary:</strong></p>
                  <p className="text-[11px] text-neutral-500 italic mt-0.5">{selectedVersion.snapshot.summary}</p>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => handleRestore(selectedVersion)}
                  className="px-4 py-2 rounded-xl gradient-ai text-white text-xs font-bold shadow-xs flex items-center gap-1.5"
                >
                  <RotateCcw className="size-3.5" /> Restore This Snapshot
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {versions.length === 0 ? (
                <div className="text-center py-10 text-neutral-500 text-xs space-y-1">
                  <Clock className="size-6 mx-auto text-neutral-300 mb-1" />
                  <p className="font-semibold text-neutral-700">No saved snapshots yet</p>
                  <p>Save a snapshot above whenever you tailor for a specific application.</p>
                </div>
              ) : (
                versions.map((ver) => (
                  <div
                    key={ver.id}
                    className="p-3.5 rounded-xl border border-neutral-200 hover:border-neutral-300 bg-white flex items-center justify-between transition-all"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-neutral-900 text-xs">{ver.label}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-700 font-bold">
                          ATS: {ver.atsScore}/100
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-500 mt-0.5">
                        Target Role: {ver.targetRole} · {new Date(ver.createdAt).toLocaleString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedVersion(ver);
                          setIsComparing(true);
                        }}
                        className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-neutral-200 text-neutral-700 hover:bg-neutral-50 flex items-center gap-1"
                      >
                        <Eye className="size-3 text-neutral-500" /> Compare
                      </button>
                      <button
                        onClick={() => handleRestore(ver)}
                        className="px-3 py-1 text-xs font-semibold rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 flex items-center gap-1"
                      >
                        <RotateCcw className="size-3" /> Restore
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
