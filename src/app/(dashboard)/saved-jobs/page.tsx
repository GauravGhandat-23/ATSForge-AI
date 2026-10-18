"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bookmark,
  ExternalLink,
  Sparkles,
  ArrowRight,
  Briefcase,
  Trash2,
  Loader2,
  Calendar,
  CheckCircle2,
} from "lucide-react";
import { Topbar } from "@/components/dashboard/Topbar";
import { JobApplication } from "@/lib/types";

export default function SavedJobsPage() {
  const router = useRouter();
  const [wishlistJobs, setWishlistJobs] = useState<JobApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);

  const fetchWishlist = async () => {
    try {
      const res = await fetch("/api/applications");
      if (res.ok) {
        const data = await res.json();
        // Wishlist items are saved jobs
        const saved = (data.applications || []).filter(
          (a: JobApplication) => a.status === "Wishlist"
        );
        setWishlistJobs(saved);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleMarkApplied = async (app: JobApplication) => {
    try {
      const res = await fetch(`/api/applications/${app.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Applied" }),
      });
      if (res.ok) {
        setNotice(`Moved "${app.jobTitle}" to Applied tracker!`);
        fetchWishlist();
      }
    } catch {
      setNotice("Failed to update status");
    }
    setTimeout(() => setNotice(null), 3000);
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/applications/${id}`, { method: "DELETE" });
      if (res.ok) {
        setNotice("Removed from saved jobs");
        fetchWishlist();
      }
    } catch {
      setNotice("Failed to remove job");
    }
    setTimeout(() => setNotice(null), 3000);
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-neutral-50/50">
      <Topbar title="Saved Jobs" />

      <main className="flex-1 p-6 lg:p-8 max-w-5xl w-full mx-auto space-y-6">
        {notice && (
          <div className="p-3 bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold rounded-xl">
            {notice}
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Saved Jobs</h1>
            <p className="text-sm text-neutral-500 mt-0.5">
              Review saved job opportunities, match your resume, and track your manual application status.
            </p>
          </div>
          <Link
            href="/job-search"
            className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-sm transition-all flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Briefcase className="size-3.5" />
            <span>Search More Jobs</span>
          </Link>
        </div>

        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="size-8 text-indigo-600 animate-spin" />
            <p className="text-sm text-neutral-500 font-medium">Loading saved jobs...</p>
          </div>
        ) : wishlistJobs.length === 0 ? (
          <div className="p-12 text-center bg-white border border-dashed border-neutral-300 rounded-2xl space-y-4">
            <div className="size-14 mx-auto rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Bookmark className="size-7" />
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h3 className="text-base font-bold text-neutral-900">No Saved Jobs Yet</h3>
              <p className="text-xs text-neutral-500">
                Bookmark exciting jobs from Job Search to keep track of deadlines and resume tailoring.
              </p>
            </div>
            <Link
              href="/job-search"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
            >
              <span>Explore Open Jobs</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {wishlistJobs.map((job) => (
              <div
                key={job.id}
                className="p-5 bg-white border border-neutral-200/90 rounded-2xl shadow-xs hover:border-neutral-300 transition-all flex flex-col justify-between space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-bold text-neutral-900">{job.jobTitle}</h3>
                    <div className="flex items-center gap-3 text-xs text-neutral-500 mt-0.5">
                      <span className="font-bold text-indigo-600">{job.company}</span>
                      {job.location && (
                        <>
                          <span>•</span>
                          <span>{job.location}</span>
                        </>
                      )}
                      {job.salary && (
                        <>
                          <span>•</span>
                          <span>{job.salary}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {job.jobUrl && (
                      <a
                        href={job.jobUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-xl border border-neutral-200 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50"
                        title="Open Job Posting"
                      >
                        <ExternalLink className="size-4" />
                      </a>
                    )}
                    <button
                      onClick={() => handleDelete(job.id)}
                      className="p-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50"
                      title="Remove from Saved"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>

                {job.notes && (
                  <p className="text-xs text-neutral-600 bg-neutral-50 p-2.5 rounded-xl border border-neutral-100">
                    {job.notes}
                  </p>
                )}

                <div className="pt-3 border-t border-neutral-100 flex flex-wrap items-center justify-between gap-3">
                  <button
                    onClick={() => {
                      sessionStorage.setItem("atsforge_target_job_title", job.jobTitle);
                      router.push("/job-matcher");
                    }}
                    className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5"
                  >
                    <Sparkles className="size-3.5" />
                    <span>Match Resume</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleMarkApplied(job)}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="size-3.5" />
                      <span>Mark as Applied</span>
                    </button>
                    {job.jobUrl && (
                      <a
                        href={job.jobUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3.5 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold rounded-xl transition-colors flex items-center gap-1"
                      >
                        <span>Apply</span>
                        <ArrowRight className="size-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
