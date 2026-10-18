import React from "react";
import Link from "next/link";
import { Sparkles, Shield, CheckCircle2 } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-white border-t border-neutral-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 font-bold text-lg text-neutral-900 mb-3">
              <div className="size-8 rounded-lg gradient-ai flex items-center justify-center text-white">
                <Sparkles className="size-4" />
              </div>
              <span>
                ATSForge <span className="text-indigo-600">AI</span>
              </span>
            </Link>
            <p className="text-sm text-neutral-500 max-w-sm leading-relaxed mb-4">
              Free, anonymous AI resume builder and deterministic 8-factor ATS scoring engine. No account or signup required.
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-500 mb-4">
              <span className="flex items-center gap-1"><Shield className="size-3.5 text-emerald-600" /> 100% Free &amp; Anonymous</span>
              <span className="flex items-center gap-1"><CheckCircle2 className="size-3.5 text-indigo-600" /> Ephemeral Processing</span>
            </div>
            <p className="text-xs text-neutral-400 bg-neutral-50 border border-neutral-200/80 rounded-lg p-2.5 max-w-md">
              <strong className="text-neutral-600 font-semibold">Privacy Notice:</strong> Your resume is processed only to provide this analysis. Avoid uploading sensitive information you do not want processed.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wider mb-3">Tools</h4>
            <ul className="space-y-2 text-sm text-neutral-600">
              <li><Link href="/resume-builder" className="hover:text-indigo-600">Resume Builder</Link></li>
              <li><Link href="/ats-scanner" className="hover:text-indigo-600">ATS Resume Scanner</Link></li>
              <li><Link href="/ai-tailor" className="hover:text-indigo-600">AI Resume Tailor</Link></li>
              <li><Link href="/cover-letter" className="hover:text-indigo-600">Cover Letter</Link></li>
              <li><Link href="/templates" className="hover:text-indigo-600">Templates</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wider mb-3">Workspace</h4>
            <ul className="space-y-2 text-sm text-neutral-600">
              <li><Link href="/workspace" className="hover:text-indigo-600">Session Workspace</Link></li>
              <li><Link href="/job-analyzer" className="hover:text-indigo-600">Job Description Parser</Link></li>
              <li><Link href="/interview-prep" className="hover:text-indigo-600">Interview Coach</Link></li>
              <li><Link href="/career-tools" className="hover:text-indigo-600">Career Tools</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-neutral-100 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-500 gap-4">
          <p>© {new Date().getFullYear()} ATSForge AI. All rights reserved. Zero sign-up required.</p>
          <div className="flex gap-6">
            <span className="hover:text-neutral-700">Privacy First</span>
            <span className="hover:text-neutral-700">Client-Side Temporary Storage</span>
            <span className="hover:text-neutral-700">Deterministic ATS Scoring</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
