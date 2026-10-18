"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Layers, CheckCircle2, ArrowRight, Sparkles, Sliders, Palette, Type } from "lucide-react";
import { Topbar } from "@/components/dashboard/Topbar";
import { TEMPLATE_LIST } from "@/components/templates";

export default function TemplatesPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [activeTemplate, setActiveTemplate] = useState("modern");

  const categories = ["ALL", "ATS Classic", "Modern", "Minimal", "Professional", "Technical", "Executive", "Student", "Fresher", "Corporate", "Simple"];

  const filtered = selectedCategory === "ALL"
    ? TEMPLATE_LIST
    : TEMPLATE_LIST.filter((t) => t.category.toLowerCase().includes(selectedCategory.toLowerCase()));

  const handleSelectTemplate = (templateId: string) => {
    setActiveTemplate(templateId);
    router.push(`/builder?template=${templateId}`);
  };

  return (
    <div className="flex-1 flex flex-col">
      <Topbar title="ATS-Safe Templates Gallery" />

      <main className="p-6 md:p-8 space-y-8 max-w-7xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
              10 Original ATS-Compliant Templates
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500 mt-1">
              Zero parsing errors. Engineered with clean semantic hierarchy, standard typography, and printable margins.
            </p>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2 text-xs">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setSelectedCategory(c)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all border ${
                selectedCategory === c
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-2xs"
                  : "bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Template Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((tmpl) => (
            <div
              key={tmpl.id}
              className="bg-white rounded-2xl border border-neutral-200/90 overflow-hidden shadow-xs hover:border-indigo-400 hover:shadow-lg transition-all group flex flex-col justify-between"
            >
              {/* Realistic CSS Thumbnail Mockup */}
              <div className="h-60 bg-neutral-100 p-4 border-b border-neutral-200 flex items-center justify-center relative overflow-hidden group-hover:bg-indigo-50/20 transition-colors">
                <div className="w-44 h-56 bg-white rounded shadow-md border border-neutral-200 p-3 scale-95 group-hover:scale-100 transition-transform text-[5px] text-neutral-600 font-sans leading-tight space-y-1 select-none pointer-events-none">
                  {/* Miniature header */}
                  <div className="border-b pb-1 mb-1">
                    <p className="font-bold text-[7px] text-neutral-900">ALEX MORGAN</p>
                    <p className="text-indigo-600 font-semibold">{tmpl.name} Specialist</p>
                    <p className="text-neutral-400">San Francisco, CA • alex@example.com</p>
                  </div>
                  {/* Miniature summary */}
                  <div>
                    <p className="font-bold text-[6px] text-neutral-800 uppercase">Profile</p>
                    <p className="text-neutral-500 line-clamp-2">Experienced technology leader delivering scalable architectures and measurable business outcomes...</p>
                  </div>
                  {/* Miniature experience */}
                  <div>
                    <p className="font-bold text-[6px] text-neutral-800 uppercase">Experience</p>
                    <p className="font-semibold text-neutral-800">Senior Engineer — Veloce Corp</p>
                    <p className="text-neutral-500">• Architected microservices with 99.99% uptime.</p>
                    <p className="text-neutral-500">• Cut p99 latency by 35% across endpoints.</p>
                  </div>
                  {/* Miniature skills */}
                  <div>
                    <p className="font-bold text-[6px] text-neutral-800 uppercase">Skills</p>
                    <p className="text-neutral-500">TypeScript, React, Python, Cloud, SQL</p>
                  </div>
                </div>

                {/* Overlay hover CTA */}
                <div className="absolute inset-0 bg-neutral-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={() => handleSelectTemplate(tmpl.id)}
                    className="px-4 py-2 rounded-xl gradient-ai text-white text-xs font-bold shadow-lg"
                  >
                    Use Template
                  </button>
                </div>
              </div>

              {/* Template details */}
              <div className="p-5 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-neutral-900 text-sm">{tmpl.name}</h3>
                    <p className="text-xs text-neutral-500 mt-0.5">{tmpl.description}</p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                    ATS Safe
                  </span>
                </div>

                <div className="pt-2 border-t border-neutral-100 flex items-center justify-between">
                  <span className="text-[11px] text-neutral-400 font-medium">{tmpl.category}</span>
                  <button
                    onClick={() => handleSelectTemplate(tmpl.id)}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                  >
                    Select in Builder <ArrowRight className="size-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
