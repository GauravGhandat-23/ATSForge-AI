"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  User,
  Mail,
  Calendar,
  CheckCircle2,
  ShieldCheck,
  Settings,
  LogOut,
  FileText,
  Briefcase,
  Target,
  ArrowRight,
} from "lucide-react";
import { Topbar } from "@/components/dashboard/Topbar";
import { useAuth } from "@/components/auth/AuthContext";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const [resumeCount, setResumeCount] = useState(0);
  const [appCount, setAppCount] = useState(0);
  const [scanCount, setScanCount] = useState(0);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const [rRes, aRes, sRes] = await Promise.all([
          fetch("/api/resumes"),
          fetch("/api/applications"),
          fetch("/api/ats/scans"),
        ]);
        if (rRes.ok) {
          const data = await rRes.json();
          setResumeCount(data.resumes?.length || 0);
        }
        if (aRes.ok) {
          const data = await aRes.json();
          setAppCount(data.applications?.length || 0);
        }
        if (sRes.ok) {
          const data = await sRes.json();
          setScanCount(data.scans?.length || 0);
        }
      } catch {
        // Safe fallback
      }
    };
    if (user) {
      fetchCounts();
    }
  }, [user]);

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-neutral-50/50">
      <Topbar title="User Profile" />

      <main className="flex-1 p-6 lg:p-8 max-w-4xl w-full mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Account Profile</h1>
            <p className="text-sm text-neutral-500 mt-0.5">
              Manage your personal credentials, identity provider connection, and account security.
            </p>
          </div>
          <Link
            href="/settings"
            className="px-4 py-2 text-xs font-bold text-neutral-700 bg-white border border-neutral-200 rounded-xl hover:bg-neutral-50 transition-colors flex items-center gap-1.5"
          >
            <Settings className="size-3.5 text-neutral-500" />
            <span>Settings</span>
          </Link>
        </div>

        {user ? (
          <div className="space-y-6">
            {/* Identity Card */}
            <div className="p-6 bg-white border border-neutral-200/90 rounded-2xl shadow-xs flex flex-col sm:flex-row items-center sm:items-start gap-5">
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.name}
                  className="size-20 rounded-2xl object-cover border-2 border-indigo-100 shadow-sm"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="size-20 rounded-2xl bg-indigo-50 text-indigo-700 font-extrabold text-2xl flex items-center justify-center border-2 border-indigo-100">
                  {user.first_name ? user.first_name[0] : "U"}
                </div>
              )}

              <div className="flex-1 text-center sm:text-left space-y-1.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h2 className="text-xl font-bold text-neutral-900">{user.name}</h2>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 self-center sm:self-auto">
                    <CheckCircle2 className="size-3 text-emerald-600" />
                    <span>Google OAuth Verified</span>
                  </span>
                </div>

                <div className="flex items-center justify-center sm:justify-start gap-2 text-xs text-neutral-600">
                  <Mail className="size-3.5 text-neutral-400" />
                  <span>{user.email}</span>
                </div>

                <div className="flex items-center justify-center sm:justify-start gap-4 text-[11px] text-neutral-400 font-medium pt-2">
                  <span className="flex items-center gap-1">
                    <Calendar className="size-3" />
                    Member since {new Date(user.created_at).toLocaleDateString()}
                  </span>
                  <span>•</span>
                  <span>Last active: {new Date(user.last_login_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Metrics Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 bg-white border border-neutral-200/90 rounded-2xl shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-neutral-500">My Resumes</span>
                  <FileText className="size-4 text-indigo-600" />
                </div>
                <div className="text-2xl font-extrabold text-neutral-900">{resumeCount}</div>
                <Link
                  href="/resumes"
                  className="text-xs text-indigo-600 font-semibold hover:underline flex items-center gap-1"
                >
                  <span>Manage Resumes</span>
                  <ArrowRight className="size-3" />
                </Link>
              </div>

              <div className="p-5 bg-white border border-neutral-200/90 rounded-2xl shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-neutral-500">Applications Tracked</span>
                  <Briefcase className="size-4 text-emerald-600" />
                </div>
                <div className="text-2xl font-extrabold text-neutral-900">{appCount}</div>
                <Link
                  href="/applications"
                  className="text-xs text-indigo-600 font-semibold hover:underline flex items-center gap-1"
                >
                  <span>View Tracker</span>
                  <ArrowRight className="size-3" />
                </Link>
              </div>

              <div className="p-5 bg-white border border-neutral-200/90 rounded-2xl shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-neutral-500">ATS Scans Run</span>
                  <Target className="size-4 text-amber-600" />
                </div>
                <div className="text-2xl font-extrabold text-neutral-900">{scanCount}</div>
                <Link
                  href="/ats-scanner"
                  className="text-xs text-indigo-600 font-semibold hover:underline flex items-center gap-1"
                >
                  <span>Run New Scan</span>
                  <ArrowRight className="size-3" />
                </Link>
              </div>
            </div>

            {/* Account Actions */}
            <div className="p-5 bg-white border border-neutral-200/90 rounded-2xl shadow-xs flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-neutral-900">Sign Out</h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Securely sign out of your session on this device.
                </p>
              </div>
              <button
                onClick={logout}
                className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5"
              >
                <LogOut className="size-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="p-12 text-center bg-white border border-neutral-200 rounded-2xl space-y-4">
            <ShieldCheck className="size-10 text-indigo-600 mx-auto" />
            <div className="space-y-1">
              <h3 className="text-base font-bold text-neutral-900">Sign in with Google</h3>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                Sign in to link your Google identity, persist resumes, track applications, and view your profile.
              </p>
            </div>
            <Link
              href="/sign-in"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
            >
              <span>Sign In with Google</span>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
