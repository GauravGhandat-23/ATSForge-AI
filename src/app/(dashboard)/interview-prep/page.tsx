"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  ChevronDown,
  ChevronUp,
  Loader2,
  Send,
  AlertCircle,
  FileText,
  PlusCircle,
  HelpCircle,
} from "lucide-react";
import { Topbar } from "@/components/dashboard/Topbar";
import { InterviewQuestion, ResumeData } from "@/lib/types";

export default function InterviewPrepPage() {
  const [resumes, setResumes] = useState<ResumeData[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Practice state
  const [activePracticeQuestion, setActivePracticeQuestion] = useState<InterviewQuestion | null>(null);
  const [userPracticeAnswer, setUserPracticeAnswer] = useState("");
  const [practiceFeedback, setPracticeFeedback] = useState<{
    score: number;
    strengths: string[];
    improvements: string[];
  } | null>(null);
  const [isSubmittingPractice, setIsSubmittingPractice] = useState(false);

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

  const handleGenerateQuestions = async () => {
    setErrorMsg(null);
    const selected = resumes.find((r) => r.id === selectedResumeId);
    if (!selected) {
      setErrorMsg("Please select a valid resume first.");
      return;
    }

    setIsGenerating(true);
    try {
      const res = await fetch("/api/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "generate",
          resumeId: selected.id,
          resumeData: selected,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to generate interview questions");
      }
      setQuestions(data.questions || []);
      if (data.questions && data.questions.length > 0) {
        setExpandedId(data.questions[0].id);
      }
    } catch (e: any) {
      setErrorMsg(e.message || "Failed to simulate interview questions");
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePracticeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userPracticeAnswer.trim() || !activePracticeQuestion) return;

    setIsSubmittingPractice(true);
    try {
      const res = await fetch("/api/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "feedback",
          question: activePracticeQuestion.question,
          answer: userPracticeAnswer,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to evaluate practice answer");
      }
      setPracticeFeedback(data.feedback);
    } catch (e: any) {
      setErrorMsg(e.message || "Failed to evaluate practice answer");
    } finally {
      setIsSubmittingPractice(false);
    }
  };

  const filteredQuestions =
    categoryFilter === "ALL" ? questions : questions.filter((q) => q.type === categoryFilter);

  return (
    <div className="flex-1 flex flex-col">
      <Topbar title="AI Interview Coach & STAR Prep" />

      <main className="p-6 md:p-8 space-y-8 max-w-7xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
              Role-Specific Interview Simulator
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500 mt-1">
              Anticipate HR, Technical, and STAR behavioral questions tailored directly to your resume claims.
            </p>
          </div>

          {resumes.length > 0 && (
            <button
              onClick={handleGenerateQuestions}
              disabled={isGenerating}
              className="px-5 py-2.5 rounded-xl gradient-ai text-white text-xs font-bold shadow-md shadow-indigo-500/20 hover:opacity-95 flex items-center gap-1.5 self-start sm:self-auto disabled:opacity-50 cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" /> Simulating...
                </>
              ) : (
                <>
                  <Sparkles className="size-3.5" /> Simulate Interview Questions
                </>
              )}
            </button>
          )}
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
                Create or import a resume in the Resume Builder first to simulate interview questions based on your real experience.
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
            {/* Resume Selection */}
            <div className="bg-white p-4 rounded-2xl border border-neutral-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <span className="font-bold text-neutral-700 uppercase tracking-wider">Candidate Resume:</span>
                <select
                  value={selectedResumeId}
                  onChange={(e) => setSelectedResumeId(e.target.value)}
                  className="p-2 bg-neutral-50 border border-neutral-200 rounded-xl font-semibold text-neutral-800 focus:outline-none"
                >
                  {resumes.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.title || "Untitled Resume"} ({r.targetRole || "No Target Role"})
                    </option>
                  ))}
                </select>
              </div>

              {/* Filter Pills */}
              {questions.length > 0 && (
                <div className="flex flex-wrap gap-1.5 text-xs">
                  {["ALL", "HR", "Technical", "Behavioral", "STAR"].map((f) => (
                    <button
                      key={f}
                      onClick={() => setCategoryFilter(f)}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-all border cursor-pointer ${
                        categoryFilter === f
                          ? "bg-indigo-600 text-white border-indigo-600 shadow-2xs"
                          : "bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50"
                      }`}
                    >
                      {f === "ALL" ? "All" : f}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Question Cards List */}
            {questions.length > 0 ? (
              <div className="space-y-4">
                {filteredQuestions.map((q) => {
                  const isExpanded = expandedId === q.id;

                  return (
                    <div
                      key={q.id}
                      className="bg-white rounded-2xl border border-neutral-200 shadow-xs overflow-hidden transition-all"
                    >
                      <div
                        onClick={() => setExpandedId(isExpanded ? null : q.id)}
                        className="p-5 flex items-center justify-between cursor-pointer hover:bg-neutral-50/60 select-none"
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`text-[10px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider ${
                              q.type === "Technical"
                                ? "bg-blue-100 text-blue-800"
                                : q.type === "STAR"
                                ? "bg-purple-100 text-purple-800"
                                : q.type === "Behavioral"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-emerald-100 text-emerald-800"
                            }`}
                          >
                            {q.type}
                          </span>
                          <h3 className="font-bold text-xs sm:text-sm text-neutral-900">{q.question}</h3>
                        </div>

                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActivePracticeQuestion(q);
                              setUserPracticeAnswer("");
                              setPracticeFeedback(null);
                            }}
                            className="px-3 py-1 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-bold cursor-pointer"
                          >
                            Practice Answer
                          </button>
                          {isExpanded ? <ChevronUp className="size-4 text-neutral-400" /> : <ChevronDown className="size-4 text-neutral-400" />}
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="px-5 pb-5 pt-2 border-t border-neutral-100 space-y-4 text-xs bg-neutral-50/30">
                          <div className="space-y-1">
                            <span className="font-bold text-[10px] uppercase text-neutral-400 tracking-wider">
                              Why the Interviewer Asks This:
                            </span>
                            <p className="text-neutral-700 leading-relaxed">{q.whyInterviewerAsks}</p>
                          </div>

                          <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-100 space-y-1">
                            <span className="font-bold text-[10px] uppercase text-indigo-900 tracking-wider">
                              Suggested Model Answer Strategy:
                            </span>
                            <p className="text-indigo-950 leading-relaxed">{q.suggestedAnswer}</p>
                          </div>

                          <div className="space-y-1">
                            <span className="font-bold text-[10px] uppercase text-neutral-400 tracking-wider">
                              Key Improvement Tips:
                            </span>
                            <ul className="list-disc list-inside space-y-0.5 text-neutral-600">
                              {q.improvementTips.map((tip, i) => (
                                <li key={i}>{tip}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-neutral-400 bg-neutral-50 rounded-2xl border border-dashed border-neutral-200">
                Click &quot;Simulate Interview Questions&quot; above to generate targeted questions and STAR practice prompts from your selected resume.
              </div>
            )}

            {/* Practice Answer Interactive Modal */}
            {activePracticeQuestion && (
              <div className="fixed inset-0 z-50 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-2xl border border-neutral-200 w-full max-w-2xl overflow-hidden p-6 space-y-4 animate-in fade-in-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-indigo-600 tracking-wider">Practice Simulation</span>
                      <h3 className="font-bold text-sm text-neutral-900 mt-0.5">{activePracticeQuestion.question}</h3>
                    </div>
                    <button
                      onClick={() => setActivePracticeQuestion(null)}
                      className="text-neutral-400 hover:text-neutral-700 text-sm font-bold cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>

                  <form onSubmit={handlePracticeSubmit} className="space-y-3">
                    <textarea
                      value={userPracticeAnswer}
                      onChange={(e) => setUserPracticeAnswer(e.target.value)}
                      placeholder="Type your answer here using the STAR method (Situation, Task, Action, Result)..."
                      className="w-full h-36 p-3 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 leading-relaxed font-sans"
                    />

                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setActivePracticeQuestion(null)}
                        className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-600 hover:bg-neutral-100 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmittingPractice || !userPracticeAnswer.trim()}
                        className="px-5 py-2 rounded-xl gradient-ai text-white text-xs font-bold shadow-md shadow-indigo-500/25 flex items-center gap-1.5 hover:opacity-95 disabled:opacity-50 cursor-pointer"
                      >
                        {isSubmittingPractice ? (
                          <>
                            <Loader2 className="size-3.5 animate-spin" /> Evaluating Answer...
                          </>
                        ) : (
                          <>
                            <Send className="size-3.5" /> Submit for AI Feedback
                          </>
                        )}
                      </button>
                    </div>
                  </form>

                  {practiceFeedback && (
                    <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-100 space-y-3 text-xs">
                      <div className="flex justify-between items-center pb-2 border-b border-indigo-100">
                        <span className="font-bold text-indigo-900">AI Delivery Score</span>
                        <span className="text-base font-extrabold text-indigo-700">{practiceFeedback.score}/100</span>
                      </div>

                      <div>
                        <span className="font-bold text-emerald-800">Key Strengths:</span>
                        <ul className="list-disc list-inside text-emerald-950 mt-1 space-y-0.5">
                          {practiceFeedback.strengths.map((s, i) => (
                            <li key={i}>{s}</li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <span className="font-bold text-amber-800">Improvement Suggestions:</span>
                        <ul className="list-disc list-inside text-amber-950 mt-1 space-y-0.5">
                          {practiceFeedback.improvements.map((imp, i) => (
                            <li key={i}>{imp}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
