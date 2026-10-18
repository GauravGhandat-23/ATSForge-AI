"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileText,
  Target,
  Sparkles,
  Send,
  Plus,
  Trash2,
  Copy,
  Download,
  Briefcase,
  CheckCircle2,
  ShieldCheck,
  FileDown,
  ArrowRight,
  Calendar,
  Clock,
  Award,
  Layers,
} from "lucide-react";
import { Topbar } from "@/components/dashboard/Topbar";
import { ResumeData, JobApplication } from "@/lib/types";
import { triggerPrintResume } from "@/lib/pdf-generator";
import { downloadResumeDocx } from "@/lib/export-utils";
import { useAuth } from "@/components/auth/AuthContext";

interface UserScan {
  id: string;
  resumeId?: string;
  jobTitle: string;
  score: number;
  createdAt: string;
}

export default function WorkspacePage() {
  const { user } = useAuth();
  const [resumes, setResumes] = useState<ResumeData[]>([]);
  const [scans, setScans] = useState<UserScan[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [systemHealth, setSystemHealth] = useState<any>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // 1. Fetch user-owned resumes directly from database
  const fetchResumes = async () => {
    try {
      const res = await fetch("/api/resumes");
      if (res.ok) {
        const data = await res.json();
        setResumes(data.resumes || []);
      }
    } catch (e) {
      console.error("[Workspace] Failed to fetch resumes:", e);
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Fetch user-owned ATS scans directly from database
  const fetchScans = async () => {
    try {
      const res = await fetch("/api/ats/scans");
      if (res.ok) {
        const data = await res.json();
        setScans(data.scans || []);
      }
    } catch (e) {
      console.error("[Workspace] Failed to fetch scans:", e);
    }
  };

  // 3. Fetch user-owned manual applications directly from database
  const fetchApplications = async () => {
    try {
      const res = await fetch("/api/applications");
      if (res.ok) {
        const data = await res.json();
        setApplications(data.applications || []);
      }
    } catch (e) {
      console.error("[Workspace] Failed to fetch applications:", e);
    }
  };

  const fetchHealth = async () => {
    try {
      const res = await fetch("/api/system/health");
      if (res.ok) {
        const data = await res.json();
        setSystemHealth(data);
      }
    } catch (e) {
      console.error("[Workspace] Failed to fetch health:", e);
    }
  };

  useEffect(() => {
    fetchResumes();
    fetchScans();
    fetchApplications();
    fetchHealth();
  }, []);

  const handleDeleteResume = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this resume?")) return;
    try {
      const res = await fetch(`/api/resumes/${id}`, { method: "DELETE" });
      if (res.ok) {
        setResumes(resumes.filter((r) => r.id !== id));
        setActionNotice("Resume deleted successfully.");
        setTimeout(() => setActionNotice(null), 3000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDuplicateResume = async (id: string) => {
    try {
      const res = await fetch(`/api/resumes/${id}/duplicate`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        if (data.resume) {
          setResumes([data.resume, ...resumes]);
          setActionNotice(`Duplicated "${data.resume.title}" successfully.`);
          setTimeout(() => setActionNotice(null), 3000);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const primaryResume = resumes.length > 0 ? resumes[0] : null;
  const atsScoreDisplay = primaryResume?.atsScore
    ? `${primaryResume.atsScore}/100`
    : scans.length > 0
    ? `${scans[0].score}/100`
    : "No scans yet";

  const interviewingCount = applications.filter((a) => a.status === "Interviewing").length;
  const offersCount = applications.filter((a) => a.status === "Offer").length;

  return (
    <div className="flex-1 flex flex-col">
      <Topbar title="Career Command Center" />

      <main className="p-6 md:p-8 space-y-7 max-w-7xl">
        {/* System Health Diagnostic Bar */}
        {systemHealth && (
          <div className="p-3.5 rounded-2xl bg-white border border-neutral-200/90 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-neutral-800">System Status:</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200 text-[11px]">
                <CheckCircle2 className="size-3" /> Node.js {systemHealth.node?.version}
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200 text-[11px]">
                <CheckCircle2 className="size-3" /> Database: {systemHealth.database?.status}
              </span>
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-semibold border text-[11px] ${
                  systemHealth.aiProvider?.status === "READY"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-blue-50 text-blue-700 border-blue-200"
                }`}
              >
                <CheckCircle2 className="size-3" />
                AI: {systemHealth.aiProvider?.provider?.toUpperCase()}
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200 text-[11px]">
                <ShieldCheck className="size-3" /> Google OAuth Active
              </span>
            </div>
            <Link href="/settings" className="text-indigo-600 font-semibold hover:underline text-[11px]">
              Account Settings &rarr;
            </Link>
          </div>
        )}

        {/* Authenticated User Isolation Notice */}
        <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200/90 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-start gap-2.5 text-emerald-950">
            <ShieldCheck className="size-4.5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Google Cloud Storage Active:</span> Logged in as{" "}
              <strong>{user?.email || "Google User"}</strong>. Your resumes, ATS scores, and tracked applications are strictly isolated to your authenticated account.
            </div>
          </div>
          <Link
            href="/settings"
            className="px-3.5 py-1.5 rounded-xl border border-emerald-300 bg-white hover:bg-emerald-100 text-emerald-900 font-semibold text-xs shrink-0 transition-colors"
          >
            Manage Profile
          </Link>
        </div>

        {actionNotice && (
          <div className="p-3.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="size-4 text-indigo-600" />
            {actionNotice}
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
              Welcome back, {user?.first_name || (user?.name ? user.name.split(" ")[0] : "Career Builder")}
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500 mt-1">
              Build. Optimize. Apply. Get Hired. Create ATS-ready resumes, tailor applications, and track interviews.
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <Link
              href="/applications"
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-800 text-xs font-semibold shadow-xs transition-all"
            >
              <Briefcase className="size-4 text-indigo-600" />
              Application Tracker
            </Link>
            <Link
              href="/resume-builder"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-ai text-white text-xs font-semibold shadow-md shadow-indigo-500/20 hover:opacity-95 transition-all"
            >
              <Plus className="size-4" />
              Create Resume
            </Link>
          </div>
        </div>

        {/* 5 Core Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Card 1: ATS Score */}
          <div className="p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-xs flex flex-col justify-between hover:border-indigo-300 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">ATS Score</span>
              <div className="size-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Target className="size-4" />
              </div>
            </div>
            <div className="mt-3">
              <div
                className={`text-xl font-extrabold ${
                  primaryResume?.atsScore || scans.length > 0
                    ? "text-emerald-600 text-2xl"
                    : "text-neutral-500"
                }`}
              >
                {atsScoreDisplay}
              </div>
              <p className="text-[11px] text-neutral-500 mt-0.5">
                {scans.length > 0 ? `${scans.length} verified scans logged` : "Scan against a job description"}
              </p>
            </div>
            <Link
              href="/ats-scanner"
              className="mt-3 text-[11px] font-bold text-indigo-600 flex items-center gap-1 hover:underline"
            >
              {scans.length > 0 ? "View scan history" : "Start ATS scan"} <ArrowRight className="size-3" />
            </Link>
          </div>

          {/* Card 2: Saved Resumes */}
          <div className="p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-xs flex flex-col justify-between hover:border-indigo-300 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">Saved Resumes</span>
              <div className="size-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <FileText className="size-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-extrabold text-neutral-900">{resumes.length}</div>
              <p className="text-[11px] text-neutral-500 mt-0.5">
                {resumes.length > 0 ? "Saved in cloud storage" : "No resumes created yet"}
              </p>
            </div>
            <Link
              href="/resume-builder"
              className="mt-3 text-[11px] font-bold text-indigo-600 flex items-center gap-1 hover:underline"
            >
              {resumes.length > 0 ? "Edit resume" : "Create resume"} <ArrowRight className="size-3" />
            </Link>
          </div>

          {/* Card 3: Tracked Applications */}
          <div className="p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-xs flex flex-col justify-between hover:border-indigo-300 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">Applications</span>
              <div className="size-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Briefcase className="size-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-extrabold text-neutral-900">{applications.length}</div>
              <p className="text-[11px] text-neutral-500 mt-0.5">
                {applications.length > 0 ? "Recorded in tracker" : "No applications logged yet"}
              </p>
            </div>
            <Link
              href="/applications"
              className="mt-3 text-[11px] font-bold text-blue-600 flex items-center gap-1 hover:underline"
            >
              View tracker <ArrowRight className="size-3" />
            </Link>
          </div>

          {/* Card 4: Active Interviews */}
          <div className="p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-xs flex flex-col justify-between hover:border-indigo-300 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">Interviews</span>
              <div className="size-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                <Clock className="size-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-extrabold text-purple-600">{interviewingCount}</div>
              <p className="text-[11px] text-neutral-500 mt-0.5">
                {interviewingCount > 0 ? "Active interview rounds" : "Ready for opportunities"}
              </p>
            </div>
            <Link
              href="/interview-prep"
              className="mt-3 text-[11px] font-bold text-purple-600 flex items-center gap-1 hover:underline"
            >
              Interview prep <ArrowRight className="size-3" />
            </Link>
          </div>

          {/* Card 5: Job Offers */}
          <div className="p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-xs flex flex-col justify-between hover:border-indigo-300 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">Offers</span>
              <div className="size-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Award className="size-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-extrabold text-emerald-600">{offersCount}</div>
              <p className="text-[11px] text-neutral-500 mt-0.5">
                {offersCount > 0 ? "Offers in hand" : "Aiming for offers"}
              </p>
            </div>
            <Link
              href="/applications"
              className="mt-3 text-[11px] font-bold text-emerald-600 flex items-center gap-1 hover:underline"
            >
              Manage offers <ArrowRight className="size-3" />
            </Link>
          </div>
        </div>

        {/* Quick Actions (6 Actions) */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Career Tools &amp; Actions</h2>
            <span className="text-[11px] text-neutral-400">One-click workflow shortcuts</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <Link
              href="/resume-builder"
              className="p-4 rounded-xl bg-white border border-neutral-200/80 hover:border-indigo-400 hover:shadow-xs transition-all flex flex-col items-start gap-2.5 text-neutral-900 group"
            >
              <div className="size-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Plus className="size-4" />
              </div>
              <div>
                <div className="text-xs font-bold">Resume Builder</div>
                <div className="text-[10px] text-neutral-400">Two-column A4 editor</div>
              </div>
            </Link>

            <Link
              href="/ats-scanner"
              className="p-4 rounded-xl bg-white border border-neutral-200/80 hover:border-emerald-400 hover:shadow-xs transition-all flex flex-col items-start gap-2.5 text-neutral-900 group"
            >
              <div className="size-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Target className="size-4" />
              </div>
              <div>
                <div className="text-xs font-bold">ATS Scanner</div>
                <div className="text-[10px] text-neutral-400">8-factor deterministic score</div>
              </div>
            </Link>

            <Link
              href="/ai-tailor"
              className="p-4 rounded-xl bg-white border border-neutral-200/80 hover:border-purple-400 hover:shadow-xs transition-all flex flex-col items-start gap-2.5 text-neutral-900 group"
            >
              <div className="size-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Sparkles className="size-4" />
              </div>
              <div>
                <div className="text-xs font-bold">AI Resume Tailor</div>
                <div className="text-[10px] text-neutral-400">Role keyword sync</div>
              </div>
            </Link>

            <Link
              href="/cover-letter"
              className="p-4 rounded-xl bg-white border border-neutral-200/80 hover:border-blue-400 hover:shadow-xs transition-all flex flex-col items-start gap-2.5 text-neutral-900 group"
            >
              <div className="size-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Send className="size-4" />
              </div>
              <div>
                <div className="text-xs font-bold">Cover Letter</div>
                <div className="text-[10px] text-neutral-400">3 tones &amp; PDF/DOCX</div>
              </div>
            </Link>

            <Link
              href="/job-matcher"
              className="p-4 rounded-xl bg-white border border-neutral-200/80 hover:border-amber-400 hover:shadow-xs transition-all flex flex-col items-start gap-2.5 text-neutral-900 group"
            >
              <div className="size-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Briefcase className="size-4" />
              </div>
              <div>
                <div className="text-xs font-bold">Job Matcher</div>
                <div className="text-[10px] text-neutral-400">Parse JD &amp; skills gap</div>
              </div>
            </Link>

            <Link
              href="/applications"
              className="p-4 rounded-xl bg-white border border-neutral-200/80 hover:border-indigo-500 hover:shadow-xs transition-all flex flex-col items-start gap-2.5 text-neutral-900 group"
            >
              <div className="size-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Calendar className="size-4" />
              </div>
              <div>
                <div className="text-xs font-bold">Track Applications</div>
                <div className="text-[10px] text-neutral-400">Log interviews &amp; status</div>
              </div>
            </Link>
          </div>
        </div>

        {/* Section: Saved User-Owned Resumes */}
        <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-xs overflow-hidden flex flex-col">
          <div className="p-5 border-b border-neutral-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-neutral-900 text-base">Your Resumes</h3>
              <p className="text-xs text-neutral-500">
                Persisted in your Google cloud account. Edit, duplicate, restore versions, or export anytime.
              </p>
            </div>
            <Link
              href="/resume-builder"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              <Plus className="size-3.5" /> New Resume
            </Link>
          </div>

          {isLoading ? (
            <div className="p-12 text-center text-xs text-neutral-500">Loading your workspace...</div>
          ) : resumes.length === 0 ? (
            <div className="p-12 text-center space-y-3 my-auto">
              <FileText className="size-8 text-neutral-300 mx-auto" />
              <p className="text-sm font-semibold text-neutral-700">No resumes saved in your account yet</p>
              <p className="text-xs text-neutral-400">
                Click below to build an ATS-optimized resume. It will be automatically saved under your Google account.
              </p>
              <Link
                href="/resume-builder"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl gradient-ai text-white text-xs font-semibold"
              >
                <Plus className="size-3.5" /> Build Your First Resume
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-50/70 border-b border-neutral-100 text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-5">Resume Name</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">ATS Score</th>
                    <th className="py-3 px-4">Template</th>
                    <th className="py-3 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {resumes.map((r) => (
                    <tr key={r.id} className="hover:bg-neutral-50/60 transition-colors">
                      <td className="py-3.5 px-5 font-bold text-neutral-900">
                        <Link href={`/resume-builder/${r.id}`} className="hover:text-indigo-600 flex items-center gap-2">
                          <FileText className="size-3.5 text-neutral-400" />
                          <span>{r.title || "Untitled Resume"}</span>
                        </Link>
                      </td>
                      <td className="py-3.5 px-4 text-neutral-600 font-medium">
                        {r.targetRole || "Unspecified Role"}
                      </td>
                      <td className="py-3.5 px-4">
                        {r.atsScore ? (
                          <span className="inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-full text-[11px] bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="size-3 text-emerald-600" />
                            {r.atsScore}/100
                          </span>
                        ) : (
                          <span className="text-[11px] text-neutral-400">Not scanned</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-[11px] capitalize text-neutral-500 font-medium bg-neutral-100 px-2 py-0.5 rounded">
                          {r.templateId || "ats-classic"}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/resume-builder/${r.id}`}
                            className="px-2 py-1 rounded-md text-[11px] font-semibold text-neutral-700 hover:bg-neutral-100 transition-colors"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => handleDuplicateResume(r.id)}
                            className="p-1 rounded-md text-neutral-500 hover:text-indigo-600 hover:bg-neutral-100"
                            title="Duplicate Resume"
                          >
                            <Copy className="size-3.5" />
                          </button>
                          <Link
                            href={`/ats-scanner?resumeId=${r.id}`}
                            className="px-2 py-1 rounded-md text-[11px] font-semibold text-indigo-600 hover:bg-indigo-50"
                            title="Analyze ATS Score"
                          >
                            Analyze
                          </Link>
                          <button
                            onClick={() => downloadResumeDocx(r)}
                            className="p-1 rounded-md text-neutral-500 hover:text-indigo-600 hover:bg-neutral-100"
                            title="Download DOCX"
                          >
                            <FileDown className="size-3.5" />
                          </button>
                          <button
                            onClick={() => triggerPrintResume(r)}
                            className="p-1 rounded-md text-neutral-500 hover:text-indigo-600 hover:bg-neutral-100"
                            title="Download PDF"
                          >
                            <Download className="size-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteResume(r.id)}
                            className="p-1 rounded-md text-neutral-400 hover:text-red-600 hover:bg-red-50"
                            title="Delete"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Section: Recent ATS Scans */}
        <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-xs overflow-hidden flex flex-col">
          <div className="p-5 border-b border-neutral-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-neutral-900 text-base">Recent ATS Scans</h3>
              <p className="text-xs text-neutral-500">
                Deterministic 8-factor ATS score history saved under your account.
              </p>
            </div>
            <Link
              href="/ats-scanner"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              <Target className="size-3.5" /> New Scan
            </Link>
          </div>

          {scans.length === 0 ? (
            <div className="p-8 text-center text-xs text-neutral-400 space-y-2">
              <Target className="size-8 text-neutral-300 mx-auto" />
              <p className="font-semibold text-neutral-700">No ATS scans completed yet</p>
              <p>Scans run against job descriptions will appear here under your account.</p>
              <Link
                href="/ats-scanner"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-neutral-300 hover:bg-neutral-50 text-neutral-800 font-semibold text-xs mt-2"
              >
                Scan A Resume &rarr;
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-50/70 border-b border-neutral-100 text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-5">Target Job</th>
                    <th className="py-3 px-4">ATS Match Score</th>
                    <th className="py-3 px-4">Evaluation Date</th>
                    <th className="py-3 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {scans.map((s) => (
                    <tr key={s.id} className="hover:bg-neutral-50/60 transition-colors">
                      <td className="py-3.5 px-5 font-bold text-neutral-900">
                        <div className="flex items-center gap-2">
                          <Briefcase className="size-3.5 text-neutral-400" />
                          <span>{s.jobTitle || "Software Professional"}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 font-bold px-2.5 py-0.5 rounded-full text-[11px] border ${
                            s.score >= 80
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : s.score >= 60
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : "bg-red-50 text-red-700 border-red-200"
                          }`}
                        >
                          <Target className="size-3" />
                          {s.score}/100
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-neutral-500 font-medium">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="size-3 text-neutral-400" />
                          <span>{new Date(s.createdAt).toLocaleDateString()}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <Link
                          href="/ats-scanner"
                          className="px-2.5 py-1 rounded-md text-[11px] font-semibold text-indigo-600 hover:bg-indigo-50"
                        >
                          Review Scan
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Section: Tracked Applications Preview */}
        <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-xs overflow-hidden flex flex-col">
          <div className="p-5 border-b border-neutral-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-neutral-900 text-base">Tracked Job Applications</h3>
              <p className="text-xs text-neutral-500">Your manual job application pipeline and interview schedule</p>
            </div>
            <Link
              href="/applications"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              <Plus className="size-3.5" /> Add Application
            </Link>
          </div>

          <div className="p-4 space-y-3 flex-1">
            {applications.length === 0 ? (
              <div className="p-8 text-center text-xs text-neutral-400 space-y-2">
                <Briefcase className="size-6 text-neutral-300 mx-auto" />
                <p className="font-medium text-neutral-600">No applications tracked yet</p>
                <p>Record companies you are applying to, interview dates, and recruiter details.</p>
                <Link
                  href="/applications"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-neutral-300 hover:bg-neutral-50 text-neutral-800 font-semibold text-xs mt-2"
                >
                  Open Application Tracker &rarr;
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {applications.slice(0, 6).map((app) => (
                  <div
                    key={app.id}
                    className="p-3.5 rounded-xl border border-neutral-200/80 hover:border-neutral-300 bg-neutral-50/50 flex flex-col justify-between gap-2 text-xs transition-colors"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-neutral-900 truncate">{app.company}</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            app.status === "Offer"
                              ? "bg-emerald-100 text-emerald-800"
                              : app.status === "Interviewing"
                              ? "bg-purple-100 text-purple-800"
                              : app.status === "Applied"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-neutral-200 text-neutral-700"
                          }`}
                        >
                          {app.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-600 mt-0.5 font-medium">{app.jobTitle}</p>
                      {app.location && (
                        <p className="text-[10px] text-neutral-400 mt-1">{app.location}</p>
                      )}
                    </div>

                    <div className="pt-2 border-t border-neutral-200/60 flex items-center justify-between text-[10px] text-neutral-400">
                      <span>Applied: {app.applicationDate}</span>
                      {app.interviewDate && (
                        <span className="text-purple-600 font-semibold">
                          Interview: {app.interviewDate}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {applications.length > 0 && (
            <div className="p-3 border-t border-neutral-100 bg-neutral-50/70 text-center">
              <Link
                href="/applications"
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center justify-center gap-1"
              >
                View All {applications.length} Applications <ArrowRight className="size-3" />
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
