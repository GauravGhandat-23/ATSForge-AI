"use client";

import React, { useState } from "react";
import { Sparkles, Loader2, Check, ChevronDown, Wand2 } from "lucide-react";

interface AiImproveButtonProps {
  currentText: string;
  onImproved: (newText: string) => void;
  context?: { role?: string; company?: string };
  fieldLabel?: string;
  className?: string;
}

export function AiImproveButton({
  currentText,
  onImproved,
  context,
  fieldLabel,
  className = "",
}: AiImproveButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [justApplied, setJustApplied] = useState(false);

  const operations = [
    { id: "improve", label: "Improve with AI", desc: "Elevate tone, clarity, and ATS readability" },
    { id: "rewrite", label: "Rewrite", desc: "Active voice and professional phrasing" },
    { id: "make_professional", label: "Make Professional", desc: "Executive business tone" },
    { id: "make_concise", label: "Make Concise", desc: "Trim filler words and tighten structure" },
    { id: "generate_bullet", label: "Generate Bullet", desc: "Format as strong action bullet" },
    { id: "add_impact", label: "Add Impact", desc: "Emphasize scope, responsibility and results" },
    { id: "fix_grammar", label: "Fix Grammar", desc: "Correct punctuation, syntax and typos" },
  ];

  const handleApply = async (operationId: string) => {
    if (!currentText || currentText.trim().length === 0) {
      alert("Please enter some initial text first for AI to improve.");
      return;
    }

    setIsLoading(true);
    setIsOpen(false);

    try {
      const res = await fetch("/api/ai/improve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: currentText,
          operation: operationId,
          context,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.improved) {
          onImproved(data.improved);
          setJustApplied(true);
          setTimeout(() => setJustApplied(false), 2000);
        }
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(errData.error || "AI provider is not configured. Please set AI_PROVIDER and AI_API_KEY environment variables.");
      }
    } catch (e: any) {
      console.error(e);
      alert(e.message || "Failed to reach AI service.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`relative inline-block ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-semibold transition-all border shadow-2xs ${
          justApplied
            ? "bg-emerald-50 text-emerald-700 border-emerald-300"
            : "bg-indigo-50/80 text-indigo-700 border-indigo-200 hover:bg-indigo-100 hover:border-indigo-300"
        }`}
        title="Improve this field with AI"
      >
        {isLoading ? (
          <Loader2 className="size-3 animate-spin text-indigo-600" />
        ) : justApplied ? (
          <Check className="size-3 text-emerald-600" />
        ) : (
          <Sparkles className="size-3 text-indigo-600" />
        )}
        <span>{isLoading ? "Improving..." : justApplied ? "Applied!" : "AI Improve"}</span>
        <ChevronDown className="size-2.5 text-indigo-500" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full mt-1.5 w-64 bg-white rounded-xl shadow-xl border border-neutral-200 py-1.5 z-50 text-left animate-in fade-in-50 zoom-in-95">
            <div className="px-3 py-1 border-b border-neutral-100 mb-1">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                AI Optimization Actions
              </span>
            </div>
            {operations.map((op) => (
              <button
                key={op.id}
                type="button"
                onClick={() => handleApply(op.id)}
                className="w-full text-left px-3 py-1.5 hover:bg-indigo-50/60 transition-colors flex flex-col"
              >
                <span className="text-xs font-semibold text-neutral-800">{op.label}</span>
                <span className="text-[10px] text-neutral-400">{op.desc}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
