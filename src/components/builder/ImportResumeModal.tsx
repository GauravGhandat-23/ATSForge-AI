"use client";

import React, { useState } from "react";
import { Upload, FileText, CheckCircle2, AlertTriangle, X, Loader2, ArrowRight } from "lucide-react";
import { ResumeData } from "@/lib/types";

interface ImportResumeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportConfirmed: (parsedResume: Partial<ResumeData>) => void;
}

export function ImportResumeModal({ isOpen, onClose, onImportConfirmed }: ImportResumeModalProps) {
  const [pasteText, setPasteText] = useState("");
  const [fileName, setFileName] = useState("");
  const [isParsing, setIsParsing] = useState(false);
  const [extractedData, setExtractedData] = useState<Partial<ResumeData> | null>(null);
  const [detectedSections, setDetectedSections] = useState<string[]>([]);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setFileName(file.name);
    setPasteText(`[File Attached: ${file.name} (${(file.size / 1024).toFixed(1)} KB)]`);
  };

  const handleParse = async () => {
    if (!selectedFile && !pasteText.trim()) {
      alert("Please upload a file or paste resume text first.");
      return;
    }

    setIsParsing(true);
    try {
      let res: Response;
      if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);
        res = await fetch("/api/parse-resume", {
          method: "POST",
          body: formData,
        });
      } else {
        res = await fetch("/api/parse-resume", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            rawText: pasteText,
            fileName: fileName || "Pasted Resume Content",
          }),
        });
      }

      if (res.ok) {
        const data = await res.json();
        setExtractedData(data.parsedResume);
        setDetectedSections(data.detectedSections || []);
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(errData.error || "Unable to extract resume text.");
      }
    } catch (e: any) {
      console.error(e);
      alert("Unable to extract resume text.");
    } finally {
      setIsParsing(false);
    }
  };

  const handleConfirm = () => {
    if (extractedData) {
      onImportConfirmed(extractedData);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-neutral-200 w-full max-w-2xl overflow-hidden animate-in fade-in-50 zoom-in-95">
        {/* Header */}
        <div className="p-5 border-b border-neutral-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Upload className="size-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-neutral-900">Import & Parse Existing Resume</h3>
              <p className="text-xs text-neutral-500">Supports PDF, DOCX, TXT files or direct text paste</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100">
            <X className="size-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {!extractedData ? (
            <>
              {/* File Dropzone */}
              <label className="border-2 border-dashed border-neutral-200 hover:border-indigo-500 hover:bg-indigo-50/20 rounded-xl p-6 text-center cursor-pointer transition-all block">
                <input
                  type="file"
                  accept=".txt,.pdf,.docx,.doc"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Upload className="size-7 text-neutral-400 mx-auto mb-2" />
                <p className="text-xs font-bold text-neutral-800">
                  {fileName ? `Selected: ${fileName}` : "Click to select or drop resume file"}
                </p>
                <p className="text-[11px] text-neutral-400 mt-1">Accepts .pdf, .docx, or .txt</p>
              </label>

              <div className="flex items-center gap-3">
                <div className="h-[1px] flex-1 bg-neutral-200" />
                <span className="text-[11px] font-bold text-neutral-400 uppercase">Or Paste Text</span>
                <div className="h-[1px] flex-1 bg-neutral-200" />
              </div>

              <textarea
                value={pasteText}
                onChange={(e) => setPasteText(e.target.value)}
                placeholder="Paste the full text of your existing resume here..."
                className="w-full h-36 p-3 text-xs font-mono bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  disabled={isParsing || !pasteText.trim()}
                  onClick={handleParse}
                  className="px-5 py-2.5 rounded-xl gradient-ai text-white text-xs font-bold shadow-md shadow-indigo-500/25 flex items-center gap-1.5 hover:opacity-95 disabled:opacity-50 transition-all"
                >
                  {isParsing ? (
                    <>
                      <Loader2 className="size-3.5 animate-spin" />
                      Parsing Resume Content...
                    </>
                  ) : (
                    <>
                      <FileText className="size-3.5" />
                      Extract Resume Sections
                    </>
                  )}
                </button>
              </div>
            </>
          ) : (
            /* Confirmation step */
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
                <AlertTriangle className="size-4 shrink-0 text-amber-600" />
                <span>
                  Please review the parsed information below. Confirming will populate this data into the active editor.
                </span>
              </div>

              <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-200 space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3 pb-3 border-b border-neutral-200">
                  <div>
                    <span className="text-neutral-400 uppercase text-[10px] font-bold">Detected Name</span>
                    <p className="font-bold text-neutral-900 mt-0.5">{extractedData.personalInfo?.fullName || "Not found"}</p>
                  </div>
                  <div>
                    <span className="text-neutral-400 uppercase text-[10px] font-bold">Target Role</span>
                    <p className="font-bold text-neutral-900 mt-0.5">{extractedData.targetRole || "Software Professional"}</p>
                  </div>
                  <div>
                    <span className="text-neutral-400 uppercase text-[10px] font-bold">Email</span>
                    <p className="text-neutral-700 mt-0.5">{extractedData.personalInfo?.email || "None"}</p>
                  </div>
                  <div>
                    <span className="text-neutral-400 uppercase text-[10px] font-bold">Phone</span>
                    <p className="text-neutral-700 mt-0.5">{extractedData.personalInfo?.phone || "None"}</p>
                  </div>
                </div>

                <div>
                  <span className="text-neutral-400 uppercase text-[10px] font-bold">Summary</span>
                  <p className="text-neutral-700 mt-1 line-clamp-2 italic">{extractedData.summary}</p>
                </div>

                <div>
                  <span className="text-neutral-400 uppercase text-[10px] font-bold">Extracted Sections</span>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {detectedSections.map((s) => (
                      <span key={s} className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[11px] font-semibold flex items-center gap-1">
                        <CheckCircle2 className="size-3 text-emerald-600" /> {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setExtractedData(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-600 hover:bg-neutral-100"
                >
                  Back to Upload
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  className="px-6 py-2.5 rounded-xl gradient-ai text-white text-xs font-bold shadow-md shadow-indigo-500/25 hover:opacity-95 flex items-center gap-1.5"
                >
                  Confirm & Load into Editor
                  <ArrowRight className="size-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
