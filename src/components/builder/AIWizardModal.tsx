"use client";

import React, { useState } from "react";
import { Sparkles, X, ArrowRight, ArrowLeft, Check, Loader2, Wand2 } from "lucide-react";
import { ResumeData } from "@/lib/types";

interface AIWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerated: (newResume: ResumeData) => void;
}

export function AIWizardModal({ isOpen, onClose, onGenerated }: AIWizardModalProps) {
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);

  // Form states
  const [targetJob, setTargetJob] = useState("Full-Stack Software Engineer");
  const [experienceLevel, setExperienceLevel] = useState("Mid-Level (3-5 years)");
  const [skills, setSkills] = useState("TypeScript, React, Node.js, PostgreSQL, Docker, AWS, REST APIs");
  const [education, setEducation] = useState("University of California, Computer Science B.S.");
  const [experience, setExperience] = useState("3 years developing enterprise web services, optimizing PostgreSQL queries, and creating React UI components.");
  const [projects, setProjects] = useState("High-throughput message queue worker, open-source CLI utility for database migrations.");

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetJob,
          experienceLevel,
          skills,
          education,
          experience,
          projects,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.resume) {
          onGenerated(data.resume);
          onClose();
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-neutral-200 w-full max-w-xl overflow-hidden animate-in fade-in-50 zoom-in-95">
        {/* Header */}
        <div className="p-5 border-b border-neutral-100 flex items-center justify-between gradient-ai text-white">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-lg bg-white/20 flex items-center justify-center text-white">
              <Sparkles className="size-4" />
            </div>
            <div>
              <h3 className="font-bold text-base">Create Resume with AI</h3>
              <p className="text-xs text-indigo-100">Step {step} of 6 — Tailored around your real experience</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10">
            <X className="size-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="h-1 bg-neutral-100">
          <div
            className="h-full gradient-ai transition-all duration-300"
            style={{ width: `${(step / 6) * 100}%` }}
          />
        </div>

        {/* Step Body */}
        <div className="p-6 min-h-[280px] flex flex-col justify-between">
          {step === 1 && (
            <div className="space-y-3">
              <h4 className="font-bold text-neutral-900 text-sm">Step 1: What target role are you applying for?</h4>
              <p className="text-xs text-neutral-500">
                This sets your header title, keyword focus, and ATS classification.
              </p>
              <input
                type="text"
                value={targetJob}
                onChange={(e) => setTargetJob(e.target.value)}
                placeholder="e.g. Senior Cybersecurity Analyst, Cloud Architect, Data Engineer"
                className="w-full p-3 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
              />
              <div className="flex flex-wrap gap-1.5 pt-2">
                {["Software Engineer", "Cybersecurity Analyst", "Cloud Engineer", "Data Analyst", "Product Manager"].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setTargetJob(preset)}
                    className="text-[11px] px-2 py-1 rounded-lg bg-neutral-100 hover:bg-indigo-50 hover:text-indigo-600 text-neutral-700 transition-colors"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3">
              <h4 className="font-bold text-neutral-900 text-sm">Step 2: What is your current career seniority?</h4>
              <p className="text-xs text-neutral-500">
                Calibrates executive tone, metric expectations, and bullet complexity.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  { label: "Fresher / Student", desc: "0-1 years / Academic projects" },
                  { label: "Junior Level", desc: "1-3 years of work experience" },
                  { label: "Mid-Level", desc: "3-5 years of industry experience" },
                  { label: "Senior / Lead", desc: "5-10+ years & technical mentorship" },
                ].map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => setExperienceLevel(item.label)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      experienceLevel.startsWith(item.label.split(" ")[0])
                        ? "border-indigo-600 bg-indigo-50/60 shadow-xs"
                        : "border-neutral-200 hover:border-neutral-300"
                    }`}
                  >
                    <p className="text-xs font-bold text-neutral-900">{item.label}</p>
                    <p className="text-[10px] text-neutral-500 mt-0.5">{item.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-3">
              <h4 className="font-bold text-neutral-900 text-sm">Step 3: What skills and tools do you know?</h4>
              <p className="text-xs text-neutral-500">
                Comma-separated list of programming languages, libraries, platforms, or tools you have worked with.
              </p>
              <textarea
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="Python, React, TypeScript, Docker, SQL, AWS, Splunk..."
                className="w-full h-28 p-3 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          )}

          {step === 4 && (
            <div className="space-y-3">
              <h4 className="font-bold text-neutral-900 text-sm">Step 4: Your Educational Background</h4>
              <p className="text-xs text-neutral-500">
                College/University, Degree title, and major field of study.
              </p>
              <input
                type="text"
                value={education}
                onChange={(e) => setEducation(e.target.value)}
                placeholder="e.g. University of Texas, B.S. Computer Engineering"
                className="w-full p-3 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          )}

          {step === 5 && (
            <div className="space-y-3">
              <h4 className="font-bold text-neutral-900 text-sm">Step 5: Summarize your experience so far</h4>
              <p className="text-xs text-neutral-500">
                Write a quick rough summary or paste notes. AI will structure and polish into impact bullets without fabricating.
              </p>
              <textarea
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                placeholder="Describe your responsibilities, projects worked on, technologies used..."
                className="w-full h-28 p-3 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          )}

          {step === 6 && (
            <div className="space-y-3">
              <h4 className="font-bold text-neutral-900 text-sm">Step 6: Notable projects or achievements</h4>
              <p className="text-xs text-neutral-500">
                Any key open-source repos, capstone projects, or technical initiatives you would like highlighted.
              </p>
              <textarea
                value={projects}
                onChange={(e) => setProjects(e.target.value)}
                placeholder="e.g. Built automated threat intelligence parser in Python with 99% accuracy..."
                className="w-full h-28 p-3 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          )}

          {/* Navigation Controls */}
          <div className="pt-4 border-t border-neutral-100 flex items-center justify-between mt-4">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-600 hover:bg-neutral-100 flex items-center gap-1.5 transition-colors"
              >
                <ArrowLeft className="size-3.5" /> Back
              </button>
            ) : <div />}

            {step < 6 ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                className="px-5 py-2.5 rounded-xl gradient-ai text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 hover:opacity-95 transition-opacity"
              >
                Continue <ArrowRight className="size-3.5" />
              </button>
            ) : (
              <button
                type="button"
                disabled={isGenerating}
                onClick={handleGenerate}
                className="px-6 py-2.5 rounded-xl gradient-ai text-white text-xs font-bold shadow-md shadow-indigo-500/25 flex items-center gap-1.5 hover:opacity-95 disabled:opacity-50 transition-all"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    Generating Resume Structure...
                  </>
                ) : (
                  <>
                    <Wand2 className="size-3.5" />
                    Generate & Open in Editor
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
