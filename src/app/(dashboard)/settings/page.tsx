"use client";

import React, { useState } from "react";
import { Topbar } from "@/components/dashboard/Topbar";
import { useAuth } from "@/components/auth/AuthContext";
import {
  User,
  Shield,
  Sliders,
  CreditCard,
  Lock,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  LogOut,
  Mail,
  Calendar,
  Sparkles,
  ExternalLink,
} from "lucide-react";

type SectionTab = "profile" | "security" | "preferences" | "subscription" | "privacy";

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<SectionTab>("profile");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Preference states
  const [paperSize, setPaperSize] = useState<"a4" | "letter">("a4");
  const [defaultTemplate, setDefaultTemplate] = useState("ats-classic");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== "DELETE") {
      setDeleteError("Please type DELETE to confirm");
      return;
    }

    setIsDeleting(true);
    setDeleteError(null);

    try {
      const res = await fetch("/api/auth/delete-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmation: "DELETE" }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to delete account");
      }

      // Success: redirect to homepage
      window.location.href = "/";
    } catch (err: any) {
      setDeleteError(err.message || "Failed to delete account. Please try again.");
      setIsDeleting(false);
    }
  };

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="flex-1 flex flex-col">
      <Topbar title="Settings & Account" />

      <main className="p-6 md:p-8 space-y-6 max-w-6xl">
        <div>
          <h1 className="text-2xl font-extrabold text-neutral-900 tracking-tight">Account &amp; Settings</h1>
          <p className="text-xs text-neutral-500 mt-1">
            Manage your verified Google profile, security settings, preferences, and data privacy.
          </p>
        </div>

        {/* Section Tabs */}
        <div className="flex items-center gap-2 border-b border-neutral-200 pb-2 overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setActiveTab("profile")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all ${
              activeTab === "profile"
                ? "bg-indigo-50 text-indigo-700 shadow-xs"
                : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100"
            }`}
          >
            <User className="size-4" />
            <span>Profile</span>
          </button>

          <button
            onClick={() => setActiveTab("security")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all ${
              activeTab === "security"
                ? "bg-indigo-50 text-indigo-700 shadow-xs"
                : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100"
            }`}
          >
            <Shield className="size-4" />
            <span>Security</span>
          </button>

          <button
            onClick={() => setActiveTab("preferences")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all ${
              activeTab === "preferences"
                ? "bg-indigo-50 text-indigo-700 shadow-xs"
                : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100"
            }`}
          >
            <Sliders className="size-4" />
            <span>Preferences</span>
          </button>

          <button
            onClick={() => setActiveTab("subscription")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all ${
              activeTab === "subscription"
                ? "bg-indigo-50 text-indigo-700 shadow-xs"
                : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100"
            }`}
          >
            <CreditCard className="size-4" />
            <span>Subscription</span>
          </button>

          <button
            onClick={() => setActiveTab("privacy")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all ${
              activeTab === "privacy"
                ? "bg-indigo-50 text-indigo-700 shadow-xs"
                : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100"
            }`}
          >
            <Lock className="size-4" />
            <span>Privacy</span>
          </button>
        </div>

        {/* Tab 1: Profile */}
        {activeTab === "profile" && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-xs p-6 space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-neutral-100">
                <div className="flex items-center gap-4">
                  {user?.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={user.name}
                      className="size-16 rounded-2xl object-cover border-2 border-indigo-100 shadow-sm"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="size-16 rounded-2xl bg-indigo-100 text-indigo-700 font-extrabold text-xl flex items-center justify-center border-2 border-indigo-200">
                      {user?.first_name ? user.first_name[0] : "U"}
                    </div>
                  )}

                  <div className="space-y-1">
                    <h2 className="text-lg font-bold text-neutral-900 leading-tight">
                      {user?.name || "Verified User"}
                    </h2>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-semibold border border-emerald-200">
                        <CheckCircle2 className="size-3 text-emerald-600" />
                        Signed in with Google
                      </span>
                      <span className="text-xs text-neutral-500 font-medium">{user?.email}</span>
                    </div>
                  </div>
                </div>

                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-neutral-50 border border-neutral-200 text-xs font-semibold text-neutral-700">
                  <svg className="size-4 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                    />
                  </svg>
                  <span>Google OpenID Identity</span>
                </div>
              </div>

              {/* Verified Profile Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-neutral-50/70 border border-neutral-200/80 space-y-1">
                  <span className="font-bold text-neutral-500 uppercase text-[10px] tracking-wider">
                    Full Legal Name
                  </span>
                  <div className="text-sm font-semibold text-neutral-900">{user?.name}</div>
                  <p className="text-[11px] text-neutral-400">Imported from verified Google account profile</p>
                </div>

                <div className="p-4 rounded-xl bg-neutral-50/70 border border-neutral-200/80 space-y-1">
                  <span className="font-bold text-neutral-500 uppercase text-[10px] tracking-wider">
                    Verified Email
                  </span>
                  <div className="text-sm font-semibold text-neutral-900 flex items-center gap-1.5">
                    <Mail className="size-3.5 text-neutral-400" />
                    <span>{user?.email}</span>
                  </div>
                  <p className="text-[11px] text-emerald-600 font-medium">Verified by Google Identity Provider</p>
                </div>

                <div className="p-4 rounded-xl bg-neutral-50/70 border border-neutral-200/80 space-y-1">
                  <span className="font-bold text-neutral-500 uppercase text-[10px] tracking-wider">
                    User Identifier
                  </span>
                  <div className="text-xs font-mono text-neutral-700">{user?.id}</div>
                  <p className="text-[11px] text-neutral-400">Unique internal database entity key</p>
                </div>

                <div className="p-4 rounded-xl bg-neutral-50/70 border border-neutral-200/80 space-y-1">
                  <span className="font-bold text-neutral-500 uppercase text-[10px] tracking-wider">
                    Account Member Since
                  </span>
                  <div className="text-xs font-semibold text-neutral-800 flex items-center gap-1.5">
                    <Calendar className="size-3.5 text-neutral-400" />
                    <span>{user?.created_at ? new Date(user.created_at).toLocaleDateString() : "Active"}</span>
                  </div>
                  <p className="text-[11px] text-neutral-400">Last login: {user?.last_login_at ? new Date(user.last_login_at).toLocaleString() : "Just now"}</p>
                </div>
              </div>
            </div>

            {/* Danger Zone: Delete Account */}
            <div className="bg-red-50/50 rounded-2xl border border-red-200/80 p-6 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-red-900 flex items-center gap-2">
                    <AlertTriangle className="size-4 text-red-600" />
                    Delete Account &amp; All Associated Data
                  </h3>
                  <p className="text-xs text-red-700 max-w-xl leading-relaxed">
                    Permanently delete your profile and all resumes, resume versions, ATS scans, cover letters, and tracked applications. This action cannot be undone.
                  </p>
                </div>

                <button
                  onClick={() => {
                    setShowDeleteModal(true);
                    setDeleteConfirmation("");
                    setDeleteError(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-sm shrink-0 flex items-center gap-2"
                >
                  <Trash2 className="size-3.5" />
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Security */}
        {activeTab === "security" && (
          <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-xs p-6 space-y-6">
            <div>
              <h2 className="text-base font-bold text-neutral-900">Security &amp; Session Management</h2>
              <p className="text-xs text-neutral-500">Review your current cryptographic session and authentication protocol.</p>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/50 flex items-center justify-between">
                <div>
                  <div className="font-bold text-neutral-900">Primary Authentication Method</div>
                  <div className="text-neutral-500 mt-0.5">Google OAuth 2.0 / OpenID Connect with PKCE (SHA-256)</div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px]">
                  Active &bull; Google Verified
                </span>
              </div>

              <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/50 flex items-center justify-between">
                <div>
                  <div className="font-bold text-neutral-900">Session Cookie Security</div>
                  <div className="text-neutral-500 mt-0.5">HttpOnly, SameSite=Lax, Secure in Production. Zero tokens stored in localStorage.</div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-800 font-bold text-[11px]">
                  Protected
                </span>
              </div>

              <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/50 flex items-center justify-between">
                <div>
                  <div className="font-bold text-neutral-900">Minimum Permission Scopes</div>
                  <div className="text-neutral-500 mt-0.5">Requesting only `openid`, `email`, and `profile`. No Gmail, Drive, or Contacts access.</div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px]">
                  Least Privilege
                </span>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-neutral-100">
                <span className="text-neutral-500">Need to terminate your current session?</span>
                <button
                  onClick={logout}
                  className="px-4 py-2 rounded-xl border border-neutral-300 hover:bg-neutral-100 text-neutral-800 font-bold flex items-center gap-2 transition-colors"
                >
                  <LogOut className="size-3.5" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Preferences */}
        {activeTab === "preferences" && (
          <form onSubmit={handleSavePreferences} className="bg-white rounded-2xl border border-neutral-200/80 shadow-xs p-6 space-y-6">
            <div>
              <h2 className="text-base font-bold text-neutral-900">Workspace Preferences</h2>
              <p className="text-xs text-neutral-500">Configure your default resume formats and application defaults.</p>
            </div>

            {savedSuccess && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="size-4 text-emerald-600" />
                Preferences updated successfully!
              </div>
            )}

            <div className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-neutral-800 block mb-1">Default Paper Size</label>
                <select
                  value={paperSize}
                  onChange={(e) => setPaperSize(e.target.value as any)}
                  className="w-full sm:w-64 px-3 py-2 rounded-xl border border-neutral-300 text-xs focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value="a4">A4 (Standard International)</option>
                  <option value="letter">US Letter (North America)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-neutral-800 block mb-1">Default Resume Template</label>
                <select
                  value={defaultTemplate}
                  onChange={(e) => setDefaultTemplate(e.target.value)}
                  className="w-full sm:w-64 px-3 py-2 rounded-xl border border-neutral-300 text-xs focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value="ats-classic">ATS Classic (High Parsing Score)</option>
                  <option value="modern">Modern Tech (Clean Two-Column)</option>
                  <option value="professional">Executive Professional</option>
                  <option value="minimal">Minimalist Clean</option>
                </select>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="notifications"
                  checked={notificationsEnabled}
                  onChange={(e) => setNotificationsEnabled(e.target.checked)}
                  className="rounded border-neutral-300 text-indigo-600 focus:ring-indigo-500 size-4"
                />
                <label htmlFor="notifications" className="font-semibold text-neutral-800 cursor-pointer">
                  Enable browser notifications for completed ATS scans and resume exports
                </label>
              </div>
            </div>

            <div className="pt-4 border-t border-neutral-100 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl gradient-ai text-white font-bold text-xs shadow-sm hover:opacity-95"
              >
                Save Preferences
              </button>
            </div>
          </form>
        )}

        {/* Tab 4: Subscription */}
        {activeTab === "subscription" && (
          <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-xs p-6 space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-base font-bold text-neutral-900">Current Plan</h2>
                <p className="text-xs text-neutral-500">Your account tier and available quota</p>
              </div>
              <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 font-extrabold text-xs border border-indigo-200">
                PRO TIER (UNLIMITED)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200/80 space-y-1">
                <span className="font-bold text-neutral-500 text-[10px] uppercase">Resumes</span>
                <div className="text-xl font-extrabold text-neutral-900">Unlimited</div>
                <p className="text-neutral-400 text-[11px]">User-owned cloud persistence</p>
              </div>

              <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200/80 space-y-1">
                <span className="font-bold text-neutral-500 text-[10px] uppercase">Deterministic Scans</span>
                <div className="text-xl font-extrabold text-emerald-600">Unlimited</div>
                <p className="text-neutral-400 text-[11px]">8-factor ATS scoring</p>
              </div>

              <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200/80 space-y-1">
                <span className="font-bold text-neutral-500 text-[10px] uppercase">Career AI Suite</span>
                <div className="text-xl font-extrabold text-purple-600">Full Access</div>
                <p className="text-neutral-400 text-[11px]">AI Tailor, Cover Letter &amp; Prep</p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Privacy */}
        {activeTab === "privacy" && (
          <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-xs p-6 space-y-6">
            <div>
              <h2 className="text-base font-bold text-neutral-900">Data Privacy &amp; Isolation</h2>
              <p className="text-xs text-neutral-500">How your personal resumes and credentials are kept safe.</p>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 space-y-1">
                <h3 className="font-bold text-neutral-900">1. Strict User Isolation</h3>
                <p className="text-neutral-600 leading-relaxed">
                  Every resume, resume version, ATS scan, and cover letter in ATSForge AI is stamped with your unique user ID (`{user?.id}`). Our backend enforces that no user can query or modify another user&apos;s records.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 space-y-1">
                <h3 className="font-bold text-neutral-900">2. Application Tracking Privacy</h3>
                <p className="text-neutral-600 leading-relaxed">
                  Your tracked job applications, interview schedules, salaries, and notes remain strictly private and associated solely with your authenticated Google account.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 space-y-1">
                <h3 className="font-bold text-neutral-900">3. Right to Erasure</h3>
                <p className="text-neutral-600 leading-relaxed">
                  You hold complete ownership of your career assets. Clicking &quot;Delete Account&quot; in the Profile tab immediately wipes all your resumes, scans, and configs from the database.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Confirmation Modal for Account Deletion */}
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 bg-neutral-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-white rounded-3xl border border-neutral-200 max-w-md w-full p-6 space-y-5 shadow-2xl">
              <div className="flex items-center gap-3 text-red-600">
                <div className="size-10 rounded-2xl bg-red-100 flex items-center justify-center">
                  <AlertTriangle className="size-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-neutral-900">Confirm Account Deletion</h3>
                  <p className="text-xs text-neutral-500">Irreversible action</p>
                </div>
              </div>

              <div className="space-y-3 text-xs text-neutral-600">
                <p>
                  Deleting your account will permanently remove:
                </p>
                <ul className="list-disc list-inside space-y-1 text-neutral-700 font-medium">
                  <li>All saved resumes and template versions</li>
                  <li>All historical ATS match scans and keyword scores</li>
                  <li>All generated cover letters</li>
                  <li>All tracked job applications and notes</li>
                </ul>
                <p className="pt-1">
                  To confirm, type <strong className="text-red-600 font-mono">DELETE</strong> in the box below:
                </p>
              </div>

              {deleteError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
                  {deleteError}
                </div>
              )}

              <input
                type="text"
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                placeholder="Type DELETE"
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-xs font-mono focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  disabled={isDeleting}
                  className="px-4 py-2 rounded-xl border border-neutral-200 hover:bg-neutral-100 text-neutral-700 text-xs font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  disabled={deleteConfirmation !== "DELETE" || isDeleting}
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Trash2 className="size-3.5" />
                  {isDeleting ? "Deleting..." : "Permanently Delete"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
