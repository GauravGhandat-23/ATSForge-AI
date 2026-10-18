"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/auth/AuthContext";
import {
  Sparkles,
  Menu,
  X,
  User,
  LayoutDashboard,
  Settings,
  LogOut,
  ChevronDown,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

export function Navbar() {
  const { user, loading, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  interface NavLink {
    label: string;
    href: string;
    badge?: string;
  }

  const loggedOutLinks: NavLink[] = [
    { label: "Resume Builder", href: "/resume-builder" },
    { label: "ATS Scanner", href: "/ats-scanner" },
    { label: "AI Tailor", href: "/ai-tailor" },
    { label: "Templates", href: "/templates" },
  ];

  const loggedInLinks: NavLink[] = [
    { label: "Dashboard", href: "/workspace" },
    { label: "Resume Builder", href: "/resume-builder" },
    { label: "ATS Scanner", href: "/ats-scanner" },
    { label: "AI Tailor", href: "/ai-tailor" },
    { label: "Applications", href: "/applications" },
  ];

  const navLinks: NavLink[] = user ? loggedInLinks : loggedOutLinks;

  return (
    <header className="sticky top-0 z-50 glass border-b border-neutral-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand Logo & Tagline */}
        <Link href="/" className="flex items-center gap-2.5 font-bold text-lg text-neutral-900 group">
          <div className="size-9 rounded-xl gradient-ai flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <Sparkles className="size-5" />
          </div>
          <div className="flex flex-col">
            <span className="tracking-tight leading-tight">
              ATSForge <span className="text-indigo-600">AI</span>
            </span>
            <span className="text-[9px] font-medium text-neutral-400 -mt-0.5 tracking-tight hidden sm:inline">
              Build. Optimize. Apply. Get Hired.
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-6">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                  isActive ? "text-indigo-600 font-bold" : "text-neutral-600 hover:text-indigo-600"
                }`}
              >
                <span>{link.label}</span>
                {link.badge && (
                  <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 uppercase animate-pulse">
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right CTA / Auth Status */}
        <div className="hidden sm:flex items-center gap-3">
          {loading ? (
            <div className="h-8 w-24 rounded-xl bg-neutral-100 animate-pulse" />
          ) : user ? (
            /* Logged IN: User avatar, User name, Dropdown */
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2.5 p-1.5 pr-3 rounded-2xl hover:bg-neutral-100 border border-neutral-200/80 transition-colors"
                aria-expanded={dropdownOpen}
                aria-haspopup="true"
              >
                {user.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.name}
                    className="size-7 rounded-xl object-cover border border-neutral-200"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="size-7 rounded-xl bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center">
                    {user.first_name ? user.first_name[0] : "U"}
                  </div>
                )}

                <div className="text-left flex flex-col">
                  <span className="text-xs font-bold text-neutral-800 leading-tight truncate max-w-[120px]">
                    {user.name}
                  </span>
                  <span className="text-[9px] text-emerald-600 font-medium leading-none">
                    Verified Google
                  </span>
                </div>

                <ChevronDown className="size-3.5 text-neutral-400" />
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border border-neutral-200 shadow-xl py-2 z-50 animate-fadeIn text-xs">
                  <div className="px-4 py-2 border-b border-neutral-100 mb-1">
                    <p className="font-bold text-neutral-900 truncate">{user.name}</p>
                    <p className="text-[11px] text-neutral-500 truncate">{user.email}</p>
                  </div>

                  <Link
                    href="/workspace"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-neutral-700 hover:bg-neutral-50 hover:text-indigo-600 font-medium"
                  >
                    <LayoutDashboard className="size-4" />
                    <span>Dashboard</span>
                  </Link>

                  <Link
                    href="/settings"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-neutral-700 hover:bg-neutral-50 hover:text-indigo-600 font-medium"
                  >
                    <Settings className="size-4" />
                    <span>Settings</span>
                  </Link>

                  <div className="border-t border-neutral-100 my-1" />

                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-red-600 hover:bg-red-50 font-semibold text-left"
                  >
                    <LogOut className="size-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Logged OUT: Sign In, Get Started */
            <div className="flex items-center gap-2">
              <Link
                href="/sign-in"
                className="text-xs font-bold text-neutral-700 hover:text-indigo-600 px-3.5 py-2 rounded-xl hover:bg-neutral-100 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-white px-4 py-2 rounded-xl gradient-ai shadow-md shadow-indigo-500/25 hover:opacity-95 transition-all"
              >
                <span>Get Started</span>
                <ArrowRight className="size-3.5" />
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 rounded-lg text-neutral-600 hover:bg-neutral-100"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-neutral-200 bg-white px-4 py-4 space-y-1 text-sm font-semibold shadow-lg animate-fadeIn">
          {user && (
            <div className="p-3 mb-2 rounded-xl bg-neutral-50 border border-neutral-200/80 flex items-center gap-3">
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.name}
                  className="size-8 rounded-lg object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="size-8 rounded-lg bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center">
                  {user.first_name ? user.first_name[0] : "U"}
                </div>
              )}
              <div className="truncate">
                <p className="text-xs font-bold text-neutral-900 truncate">{user.name}</p>
                <p className="text-[10px] text-neutral-500 truncate">{user.email}</p>
              </div>
            </div>
          )}

          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 text-neutral-700"
            >
              <span>{link.label}</span>
              {link.badge && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  {link.badge}
                </span>
              )}
            </Link>
          ))}

          <div className="pt-3 border-t border-neutral-100 space-y-2">
            {user ? (
              <>
                <Link
                  href="/settings"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-neutral-200 text-xs font-bold text-neutral-700 hover:bg-neutral-50"
                >
                  <Settings className="size-3.5" />
                  Settings
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-red-50 text-red-700 text-xs font-bold hover:bg-red-100 transition-colors"
                >
                  <LogOut className="size-3.5" />
                  Sign Out
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/sign-in"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center py-2.5 rounded-xl border border-neutral-200 text-xs font-bold text-neutral-800"
                >
                  Sign In
                </Link>
                <Link
                  href="/sign-up"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center py-2.5 rounded-xl gradient-ai text-white text-xs font-bold"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
