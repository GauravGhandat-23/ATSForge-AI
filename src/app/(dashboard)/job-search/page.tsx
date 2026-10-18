"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  MapPin,
  Briefcase,
  ExternalLink,
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Filter,
} from "lucide-react";
import { Topbar } from "@/components/dashboard/Topbar";

interface JobPosting {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  salary: string;
  postedDate: string;
  url: string;
  description: string;
  skills: string[];
}

const SAMPLE_CURATED_JOBS: JobPosting[] = [
  {
    id: "job-1",
    title: "Senior Full-Stack Engineer",
    company: "Vercel",
    location: "Remote (Global)",
    type: "Full-Time",
    salary: "$160,000 - $210,000",
    postedDate: "2 days ago",
    url: "https://vercel.com/careers",
    description: "Looking for an experienced engineer to scale Next.js serverless primitives, developer experience tooling, and edge runtime architectures.",
    skills: ["Next.js", "TypeScript", "Node.js", "Serverless", "React", "PostgreSQL"],
  },
  {
    id: "job-2",
    title: "Frontend Platform Engineer",
    company: "Stripe",
    location: "San Francisco, CA (Hybrid)",
    type: "Full-Time",
    salary: "$175,000 - $225,000",
    postedDate: "3 days ago",
    url: "https://stripe.com/jobs",
    description: "Build robust, accessible, high-performance UI design systems and checkout surfaces utilized by millions of developers worldwide.",
    skills: ["React", "TypeScript", "Design Systems", "Web Performance", "Accessibility"],
  },
  {
    id: "job-3",
    title: "Backend Cloud Infrastructure Specialist",
    company: "Linear",
    location: "Remote (US/EU)",
    type: "Full-Time",
    salary: "$150,000 - $190,000",
    postedDate: "1 day ago",
    url: "https://linear.app/careers",
    description: "Architect ultra-fast synchronization protocols, PostgreSQL database migrations, and real-time collaborative state management engines.",
    skills: ["TypeScript", "Node.js", "PostgreSQL", "WebSockets", "Distributed Systems"],
  },
  {
    id: "job-4",
    title: "AI Solutions & Prompt Engineer",
    company: "Anthropic",
    location: "San Francisco, CA",
    type: "Full-Time",
    salary: "$180,000 - $240,000",
    postedDate: "Just now",
    url: "https://anthropic.com/careers",
    description: "Design LLM workflows, evals, and multi-turn agent systems with high alignment, robustness, and factual consistency standards.",
    skills: ["Python", "Prompt Engineering", "LLM Evals", "Machine Learning", "FastAPI"],
  },
  {
    id: "job-5",
    title: "Product Designer & UI Engineer",
    company: "Supabase",
    location: "Remote (Anywhere)",
    type: "Full-Time",
    salary: "$140,000 - $185,000",
    postedDate: "4 days ago",
    url: "https://supabase.com/careers",
    description: "Craft state-of-the-art developer consoles, interactive database tables, schema visualizers, and seamless onboarding flows.",
    skills: ["Figma", "React", "Tailwind CSS", "TypeScript", "UI/UX Architecture"],
  },
];

export default function JobSearchPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [locationTerm, setLocationTerm] = useState("");
  const [savedJobIds, setSavedJobIds] = useState<Set<string>>(new Set());
  const [trackedJobIds, setTrackedJobIds] = useState<Set<string>>(new Set());
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const filteredJobs = SAMPLE_CURATED_JOBS.filter((job) => {
    const matchesKeyword =
      !searchTerm ||
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.skills.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesLocation =
      !locationTerm || job.location.toLowerCase().includes(locationTerm.toLowerCase());

    return matchesKeyword && matchesLocation;
  });

  const handleSaveJob = (job: JobPosting) => {
    setSavedJobIds((prev) => {
      const next = new Set(prev);
      if (next.has(job.id)) {
        next.delete(job.id);
        setActionNotice(`Removed ${job.title} from Saved Jobs`);
      } else {
        next.add(job.id);
        setActionNotice(`Saved ${job.title} to Saved Jobs`);
      }
      return next;
    });
    setTimeout(() => setActionNotice(null), 3000);
  };

  const handleTrackApplication = async (job: JobPosting) => {
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company: job.company,
          jobTitle: job.title,
          jobUrl: job.url,
          location: job.location,
          status: "Wishlist",
          salary: job.salary,
          notes: `Discovered via ATSForge Job Search. Skills: ${job.skills.join(", ")}`,
        }),
      });

      if (res.ok) {
        setTrackedJobIds((prev) => new Set(prev).add(job.id));
        setActionNotice(`Added ${job.title} to Application Tracker`);
      } else {
        setActionNotice("Please sign in to track applications");
      }
    } catch {
      setActionNotice("Could not save to Application Tracker");
    }
    setTimeout(() => setActionNotice(null), 3500);
  };

  const handleMatchResume = (job: JobPosting) => {
    sessionStorage.setItem("atsforge_target_job_title", job.title);
    sessionStorage.setItem("atsforge_target_job_description", job.description);
    router.push("/job-matcher");
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-neutral-50/50">
      <Topbar title="Job Search" />

      <main className="flex-1 p-6 lg:p-8 max-w-6xl w-full mx-auto space-y-6">
        {actionNotice && (
          <div className="p-3 bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold rounded-xl flex items-center justify-between">
            <span>{actionNotice}</span>
            <button onClick={() => setActionNotice(null)} className="text-indigo-500 hover:text-indigo-800">
              &times;
            </button>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Job Search</h1>
            <p className="text-sm text-neutral-500 mt-0.5">
              Explore open roles, analyze keyword match with your resume, and track applications manually.
            </p>
          </div>
          <Link
            href="/saved-jobs"
            className="px-4 py-2 text-xs font-bold text-neutral-700 bg-white border border-neutral-200 rounded-xl hover:bg-neutral-50 transition-colors flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Bookmark className="size-3.5 text-indigo-600" />
            <span>Saved Jobs ({savedJobIds.size})</span>
          </Link>
        </div>

        {/* Search Controls */}
        <div className="p-4 bg-white border border-neutral-200/90 rounded-2xl shadow-xs grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-6 relative">
            <Search className="size-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Job title, company, or keyword (e.g. Next.js, Engineer)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 text-xs font-semibold rounded-xl border border-neutral-200 bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="md:col-span-4 relative">
            <MapPin className="size-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Location or Remote..."
              value={locationTerm}
              onChange={(e) => setLocationTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 text-xs font-semibold rounded-xl border border-neutral-200 bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="md:col-span-2">
            <button
              onClick={() => {
                setSearchTerm("");
                setLocationTerm("");
              }}
              className="w-full py-2 text-xs font-bold text-neutral-600 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200 rounded-xl transition-colors"
            >
              Reset Filters
            </button>
          </div>
        </div>

        {/* Search Results */}
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-bold text-neutral-500 px-1">
            <span>Showing {filteredJobs.length} Positions</span>
            <span>Direct Apply • No Browser Automation</span>
          </div>

          {filteredJobs.length === 0 ? (
            <div className="p-12 text-center bg-white border border-dashed border-neutral-300 rounded-2xl space-y-3">
              <Briefcase className="size-8 text-neutral-400 mx-auto" />
              <h3 className="text-sm font-bold text-neutral-800">No positions match your search criteria</h3>
              <p className="text-xs text-neutral-500">Try broadening your keywords or location filter.</p>
            </div>
          ) : (
            filteredJobs.map((job) => {
              const isSaved = savedJobIds.has(job.id);
              const isTracked = trackedJobIds.has(job.id);

              return (
                <div
                  key={job.id}
                  className="p-5 bg-white border border-neutral-200/90 rounded-2xl shadow-xs hover:border-neutral-300 transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-neutral-900">{job.title}</h3>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-neutral-100 text-neutral-700">
                          {job.type}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-500 font-medium">
                        <span className="font-bold text-indigo-600">{job.company}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="size-3 text-neutral-400" />
                          {job.location}
                        </span>
                        <span>•</span>
                        <span>{job.salary}</span>
                        <span>•</span>
                        <span>{job.postedDate}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <button
                        onClick={() => handleSaveJob(job)}
                        className={`p-2 rounded-xl border transition-colors ${
                          isSaved
                            ? "bg-indigo-50 border-indigo-200 text-indigo-600"
                            : "bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50"
                        }`}
                        title={isSaved ? "Saved" : "Save Job"}
                      >
                        {isSaved ? (
                          <BookmarkCheck className="size-4" />
                        ) : (
                          <Bookmark className="size-4" />
                        )}
                      </button>

                      <a
                        href={job.url}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-xl border border-neutral-200 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 transition-colors"
                        title="Open Original Job Website"
                      >
                        <ExternalLink className="size-4" />
                      </a>
                    </div>
                  </div>

                  <p className="text-xs text-neutral-600 leading-relaxed">{job.description}</p>

                  <div className="flex flex-wrap items-center gap-1.5">
                    {job.skills.map((s) => (
                      <span
                        key={s}
                        className="px-2 py-0.5 bg-neutral-100 text-neutral-700 rounded-md text-[10px] font-semibold"
                      >
                        {s}
                      </span>
                    ))}
                  </div>

                  <div className="pt-3 border-t border-neutral-100 flex flex-wrap items-center justify-between gap-3">
                    <button
                      onClick={() => handleMatchResume(job)}
                      className="px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5"
                    >
                      <Sparkles className="size-3.5 text-indigo-600" />
                      <span>Match With My Resume</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleTrackApplication(job)}
                        disabled={isTracked}
                        className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 ${
                          isTracked
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default"
                            : "bg-neutral-100 hover:bg-neutral-200 text-neutral-800"
                        }`}
                      >
                        <CheckCircle2 className="size-3.5" />
                        <span>{isTracked ? "Tracked in Applications" : "Track Application"}</span>
                      </button>

                      <a
                        href={job.url}
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1"
                      >
                        <span>Apply on Website</span>
                        <ArrowRight className="size-3.5" />
                      </a>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}
