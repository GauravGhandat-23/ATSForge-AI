"use client";

import React, { useState } from "react";
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Minimize2,
  Printer,
  Download,
  Palette,
  Type,
  FileCheck2,
  Sparkles,
  FileDown,
} from "lucide-react";
import { ResumeData, TemplateId } from "@/lib/types";
import { ResumeDocument, TEMPLATE_LIST } from "@/components/templates";
import { triggerPrintResume } from "@/lib/pdf-generator";
import { downloadResumeDocx, downloadResumeTxt } from "@/lib/export-utils";

interface ResumePreviewProps {
  resume: ResumeData;
  onUpdateTemplate: (templateId: TemplateId) => void;
  onUpdateAccentColor: (color: string) => void;
  onUpdateFont: (font: "Inter" | "Roboto" | "Geist" | "Merriweather") => void;
  onUpdatePaperSize: (size: "a4" | "letter") => void;
}

export function ResumePreview({
  resume,
  onUpdateTemplate,
  onUpdateAccentColor,
  onUpdateFont,
  onUpdatePaperSize,
}: ResumePreviewProps) {
  const [zoom, setZoom] = useState(85); // 85% is ideal default fit on desktop
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);

  const colors = [
    { label: "Indigo", hex: "#4f46e5" },
    { label: "Sky Blue", hex: "#0284c7" },
    { label: "Emerald", hex: "#059669" },
    { label: "Teal", hex: "#0f766e" },
    { label: "Charcoal Slate", hex: "#1e293b" },
    { label: "Rose", hex: "#e11d48" },
  ];

  const fonts: ("Inter" | "Roboto" | "Geist" | "Merriweather")[] = ["Inter", "Roboto", "Geist", "Merriweather"];

  return (
    <div
      className={`flex flex-col bg-neutral-100/90 relative ${
        isFullscreen ? "fixed inset-0 z-50 bg-neutral-900/95" : "h-full"
      }`}
    >
      {/* Toolbar */}
      <div
        id="toolbar"
        className="h-14 bg-white border-b border-neutral-200 px-4 flex items-center justify-between shrink-0 select-none shadow-2xs z-10"
      >
        {/* Left: Template Selector */}
        <div className="flex items-center gap-2">
          <select
            value={resume.templateId}
            onChange={(e) => onUpdateTemplate(e.target.value as TemplateId)}
            className="text-xs font-bold text-neutral-800 bg-neutral-50 border border-neutral-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            {TEMPLATE_LIST.map((t) => (
              <option key={t.id} value={t.id}>
                Template: {t.name}
              </option>
            ))}
          </select>

          {/* Color Presets */}
          <div className="hidden sm:flex items-center gap-1 pl-2 border-l border-neutral-200">
            {colors.map((c) => (
              <button
                key={c.hex}
                type="button"
                onClick={() => onUpdateAccentColor(c.hex)}
                style={{ backgroundColor: c.hex }}
                className={`size-4.5 rounded-full transition-transform ${
                  resume.templateConfig?.accentColor === c.hex
                    ? "ring-2 ring-offset-1 ring-neutral-700 scale-110"
                    : "hover:scale-105 opacity-80 hover:opacity-100"
                }`}
                title={c.label}
              />
            ))}
          </div>

          {/* Font Selector */}
          <select
            value={resume.templateConfig?.fontFamily || "Inter"}
            onChange={(e) => onUpdateFont(e.target.value as any)}
            className="hidden lg:block text-xs text-neutral-600 bg-neutral-50 border border-neutral-200 rounded-lg px-2 py-1.5 ml-1"
          >
            {fonts.map((f) => (
              <option key={f} value={f}>
                Font: {f}
              </option>
            ))}
          </select>
        </div>

        {/* Right: Zoom & Export Controls */}
        <div className="flex items-center gap-2">
          {/* Zoom Controls */}
          <div className="flex items-center gap-1 bg-neutral-50 border border-neutral-200 rounded-lg p-0.5 text-neutral-600">
            <button
              onClick={() => setZoom(Math.max(50, zoom - 10))}
              className="p-1 hover:bg-neutral-200 rounded text-neutral-700"
              title="Zoom out"
            >
              <ZoomOut className="size-3.5" />
            </button>
            <span className="text-[11px] font-mono px-1 font-semibold text-neutral-700">{zoom}%</span>
            <button
              onClick={() => setZoom(Math.min(140, zoom + 10))}
              className="p-1 hover:bg-neutral-200 rounded text-neutral-700"
              title="Zoom in"
            >
              <ZoomIn className="size-3.5" />
            </button>
            <button
              onClick={() => setZoom(85)}
              className="p-1 hover:bg-neutral-200 rounded text-neutral-500"
              title="Reset 85%"
            >
              <RotateCcw className="size-3" />
            </button>
          </div>

          {/* Paper format selector */}
          <button
            onClick={() => onUpdatePaperSize(resume.templateConfig?.paperSize === "a4" ? "letter" : "a4")}
            className="text-[10px] font-bold uppercase tracking-wider px-2 py-1.5 rounded-lg border border-neutral-200 bg-neutral-50 text-neutral-600 hover:bg-neutral-100"
            title="Toggle A4 / Letter format"
          >
            {resume.templateConfig?.paperSize || "a4"}
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-lg text-neutral-600 hover:bg-neutral-100 border border-neutral-200"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen View"}
          >
            {isFullscreen ? <Minimize2 className="size-3.5" /> : <Maximize2 className="size-3.5" />}
          </button>

          {/* Download DOCX */}
          <button
            type="button"
            onClick={() => downloadResumeDocx(resume)}
            className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700 text-xs font-semibold"
            title="Download formatted DOCX"
          >
            <FileDown className="size-3.5 text-indigo-600" />
            <span>DOCX</span>
          </button>

          {/* Download PDF / Print */}
          <button
            type="button"
            onClick={() => triggerPrintResume(resume)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg gradient-ai text-white text-xs font-bold shadow-xs hover:opacity-95 transition-all"
            title="Export high-resolution PDF"
          >
            <Download className="size-3.5" />
            <span>Download PDF</span>
          </button>
        </div>
      </div>

      {/* Document View Canvas */}
      <div
        id="resume-document-container"
        className="flex-1 overflow-auto p-8 flex justify-center items-start bg-neutral-200/60"
      >
        <div
          style={{
            transform: `scale(${zoom / 100})`,
            transformOrigin: "top center",
            transition: "transform 0.15s ease",
          }}
        >
          <ResumeDocument resume={resume} />
        </div>
      </div>
    </div>
  );
}
