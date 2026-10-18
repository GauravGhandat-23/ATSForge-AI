"use client";

import React, { useState, useEffect } from "react";
import {
  Briefcase,
  Plus,
  Search,
  ExternalLink,
  MapPin,
  Calendar,
  DollarSign,
  User,
  Trash2,
  Edit2,
  CheckCircle2,
  Clock,
  Award,
  XCircle,
  Bookmark,
  X,
  FileText,
} from "lucide-react";
import { Topbar } from "@/components/dashboard/Topbar";
import { JobApplication, ApplicationStatus } from "@/lib/types";

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showModal, setShowModal] = useState(false);
  const [editingApp, setEditingApp] = useState<JobApplication | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    company: "",
    jobTitle: "",
    jobUrl: "",
    location: "",
    applicationDate: new Date().toISOString().split("T")[0],
    status: "Applied" as ApplicationStatus,
    salary: "",
    contact: "",
    interviewDate: "",
    followUpDate: "",
    notes: "",
  });

  const fetchApplications = async () => {
    try {
      const res = await fetch("/api/applications");
      if (res.ok) {
        const data = await res.json();
        setApplications(data.applications || []);
      }
    } catch (e) {
      console.error("Failed to load applications:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const openAddModal = () => {
    setEditingApp(null);
    setFormData({
      company: "",
      jobTitle: "",
      jobUrl: "",
      location: "",
      applicationDate: new Date().toISOString().split("T")[0],
      status: "Applied",
      salary: "",
      contact: "",
      interviewDate: "",
      followUpDate: "",
      notes: "",
    });
    setFormError(null);
    setShowModal(true);
  };

  const openEditModal = (app: JobApplication) => {
    setEditingApp(app);
    setFormData({
      company: app.company,
      jobTitle: app.jobTitle,
      jobUrl: app.jobUrl || "",
      location: app.location || "",
      applicationDate: app.applicationDate || "",
      status: app.status,
      salary: app.salary || "",
      contact: app.contact || "",
      interviewDate: app.interviewDate || "",
      followUpDate: app.followUpDate || "",
      notes: app.notes || "",
    });
    setFormError(null);
    setShowModal(true);
  };

  const handleSaveApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.company.trim() || !formData.jobTitle.trim()) {
      setFormError("Company name and job title are required.");
      return;
    }

    setIsSaving(true);
    setFormError(null);

    try {
      const payload = {
        ...formData,
        id: editingApp ? editingApp.id : undefined,
      };

      const url = editingApp ? `/api/applications/${editingApp.id}` : "/api/applications";
      const method = editingApp ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save application.");
      }

      setShowModal(false);
      fetchApplications();
    } catch (err: any) {
      setFormError(err.message || "Failed to save application.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteApplication = async (id: string) => {
    if (!confirm("Are you sure you want to delete this tracked application?")) return;
    try {
      const res = await fetch(`/api/applications/${id}`, { method: "DELETE" });
      if (res.ok) {
        setApplications(applications.filter((a) => a.id !== id));
      }
    } catch (e) {
      console.error("Failed to delete application:", e);
    }
  };

  const filteredApps = applications.filter((app) => {
    if (statusFilter !== "all" && app.status !== statusFilter) return false;
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      return (
        app.company.toLowerCase().includes(q) ||
        app.jobTitle.toLowerCase().includes(q) ||
        (app.location && app.location.toLowerCase().includes(q)) ||
        (app.notes && app.notes.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const getStatusBadge = (status: ApplicationStatus) => {
    switch (status) {
      case "Wishlist":
        return (
          <span className="inline-flex items-center gap-1 font-bold text-[11px] px-2.5 py-0.5 rounded-full bg-neutral-100 text-neutral-700 border border-neutral-200">
            <Bookmark className="size-3 text-neutral-500" />
            Wishlist
          </span>
        );
      case "Applied":
        return (
          <span className="inline-flex items-center gap-1 font-bold text-[11px] px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            <Clock className="size-3 text-blue-600" />
            Applied
          </span>
        );
      case "Interviewing":
        return (
          <span className="inline-flex items-center gap-1 font-bold text-[11px] px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
            <CheckCircle2 className="size-3 text-purple-600" />
            Interviewing
          </span>
        );
      case "Offer":
        return (
          <span className="inline-flex items-center gap-1 font-bold text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Award className="size-3 text-emerald-600" />
            Offer
          </span>
        );
      case "Rejected":
        return (
          <span className="inline-flex items-center gap-1 font-bold text-[11px] px-2.5 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200">
            <XCircle className="size-3 text-red-600" />
            Rejected
          </span>
        );
      default:
        return null;
    }
  };

  const wishlistCount = applications.filter((a) => a.status === "Wishlist").length;
  const appliedCount = applications.filter((a) => a.status === "Applied").length;
  const interviewCount = applications.filter((a) => a.status === "Interviewing").length;
  const offerCount = applications.filter((a) => a.status === "Offer").length;

  return (
    <div className="flex-1 flex flex-col">
      <Topbar title="Job Application Tracker" />

      <main className="p-6 md:p-8 space-y-6 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
              Application Tracker
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500 mt-1">
              Organize and track your career opportunities, interviews, and offers in one place.
            </p>
          </div>
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-ai text-white text-xs font-bold shadow-md shadow-indigo-500/20 hover:opacity-95 self-start sm:self-auto transition-all"
          >
            <Plus className="size-4" /> Add Application
          </button>
        </div>

        {/* Metrics Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-white border border-neutral-200/90 shadow-xs">
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Total Tracked</span>
            <h3 className="text-xl font-extrabold text-neutral-900 mt-1">{applications.length}</h3>
            <p className="text-[11px] text-neutral-400 mt-0.5">Career opportunities logged</p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-neutral-200/90 shadow-xs">
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Applied</span>
            <h3 className="text-xl font-extrabold text-blue-600 mt-1">{appliedCount}</h3>
            <p className="text-[11px] text-blue-600 font-medium mt-0.5">Submitted applications</p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-neutral-200/90 shadow-xs">
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Interviewing</span>
            <h3 className="text-xl font-extrabold text-purple-600 mt-1">{interviewCount}</h3>
            <p className="text-[11px] text-purple-600 font-medium mt-0.5">Active interview stages</p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-neutral-200/90 shadow-xs">
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Offers Received</span>
            <h3 className="text-xl font-extrabold text-emerald-600 mt-1">{offerCount}</h3>
            <p className="text-[11px] text-emerald-600 font-medium mt-0.5">Job offers landed</p>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="bg-white p-4 rounded-2xl border border-neutral-200/90 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="size-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search company, job title, or location..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-xs font-semibold bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-700 focus:outline-none"
            >
              <option value="all">All Statuses ({applications.length})</option>
              <option value="Wishlist">Wishlist ({wishlistCount})</option>
              <option value="Applied">Applied ({appliedCount})</option>
              <option value="Interviewing">Interviewing ({interviewCount})</option>
              <option value="Offer">Offer ({offerCount})</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Applications Table */}
        <div className="bg-white rounded-2xl border border-neutral-200/90 shadow-xs overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center text-xs text-neutral-400">Loading your applications...</div>
          ) : filteredApps.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <Briefcase className="size-9 text-neutral-300 mx-auto" />
              <p className="text-sm font-bold text-neutral-700">No applications tracked yet.</p>
              <p className="text-xs text-neutral-400 max-w-sm mx-auto">
                Keep track of every job you apply to. Record company names, interview dates, salaries, and notes.
              </p>
              <button
                onClick={openAddModal}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl gradient-ai text-white text-xs font-semibold shadow-xs"
              >
                <Plus className="size-3.5" /> Add First Application
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-50/70 border-b border-neutral-100 text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-5">Company &amp; Role</th>
                    <th className="py-3 px-4">Location</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Applied Date</th>
                    <th className="py-3 px-4">Next Step / Interview</th>
                    <th className="py-3 px-4">Salary</th>
                    <th className="py-3 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {filteredApps.map((app) => (
                    <tr key={app.id} className="hover:bg-neutral-50/60 transition-colors">
                      <td className="py-3.5 px-5">
                        <div className="font-bold text-neutral-900">{app.company}</div>
                        <div className="text-neutral-600 font-medium text-[11px] mt-0.5">{app.jobTitle}</div>
                        {app.notes && (
                          <div className="text-[10px] text-neutral-400 truncate max-w-xs mt-0.5">
                            {app.notes}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-neutral-600 text-[11px]">
                        {app.location ? (
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="size-3 text-neutral-400" />
                            {app.location}
                          </span>
                        ) : (
                          <span className="text-neutral-300">-</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        {getStatusBadge(app.status)}
                      </td>

                      <td className="py-3.5 px-4 text-neutral-500 text-[11px]">
                        {app.applicationDate || "-"}
                      </td>

                      <td className="py-3.5 px-4 text-neutral-700 text-[11px]">
                        {app.interviewDate ? (
                          <span className="inline-flex items-center gap-1 font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                            <Calendar className="size-3" />
                            {app.interviewDate}
                          </span>
                        ) : app.followUpDate ? (
                          <span className="inline-flex items-center gap-1 text-neutral-500">
                            <Calendar className="size-3 text-neutral-400" />
                            Follow-up: {app.followUpDate}
                          </span>
                        ) : (
                          <span className="text-neutral-300">-</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-neutral-600 text-[11px]">
                        {app.salary || <span className="text-neutral-300">-</span>}
                      </td>

                      <td className="py-3.5 px-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {app.jobUrl && (
                            <a
                              href={app.jobUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1 rounded-md text-neutral-500 hover:text-indigo-600 hover:bg-neutral-100"
                              title="Open original job posting"
                            >
                              <ExternalLink className="size-3.5" />
                            </a>
                          )}
                          <button
                            onClick={() => openEditModal(app)}
                            className="p-1 rounded-md text-neutral-500 hover:text-indigo-600 hover:bg-neutral-100"
                            title="Edit application"
                          >
                            <Edit2 className="size-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteApplication(app.id)}
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

        {/* Modal: Add / Edit Application */}
        {showModal && (
          <div className="fixed inset-0 z-50 bg-neutral-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
            <div className="bg-white rounded-3xl border border-neutral-200 max-w-lg w-full p-6 space-y-5 shadow-2xl my-8">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                <h3 className="text-base font-bold text-neutral-900">
                  {editingApp ? "Edit Job Application" : "Track New Job Application"}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1.5 rounded-lg text-neutral-400 hover:bg-neutral-100"
                >
                  <X className="size-4" />
                </button>
              </div>

              {formError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
                  {formError}
                </div>
              )}

              <form onSubmit={handleSaveApplication} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-neutral-700 block mb-1">
                      Company Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      placeholder="e.g. Google, Stripe"
                      className="w-full px-3 py-2 rounded-xl border border-neutral-300 focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-neutral-700 block mb-1">
                      Job Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.jobTitle}
                      onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                      placeholder="e.g. Senior Frontend Engineer"
                      className="w-full px-3 py-2 rounded-xl border border-neutral-300 focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-neutral-700 block mb-1">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as ApplicationStatus })}
                      className="w-full px-3 py-2 rounded-xl border border-neutral-300 bg-white focus:ring-2 focus:ring-indigo-500/20 font-semibold"
                    >
                      <option value="Wishlist">Wishlist</option>
                      <option value="Applied">Applied</option>
                      <option value="Interviewing">Interviewing</option>
                      <option value="Offer">Offer</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-neutral-700 block mb-1">Application Date</label>
                    <input
                      type="date"
                      value={formData.applicationDate}
                      onChange={(e) => setFormData({ ...formData, applicationDate: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-neutral-300 focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-neutral-700 block mb-1">Location</label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="e.g. Remote, San Francisco"
                      className="w-full px-3 py-2 rounded-xl border border-neutral-300 focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-neutral-700 block mb-1">Salary / Compensation</label>
                    <input
                      type="text"
                      value={formData.salary}
                      onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                      placeholder="e.g. $140,000 / yr"
                      className="w-full px-3 py-2 rounded-xl border border-neutral-300 focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-neutral-700 block mb-1">Job URL</label>
                  <input
                    type="url"
                    value={formData.jobUrl}
                    onChange={(e) => setFormData({ ...formData, jobUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300 focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-neutral-700 block mb-1">Interview Date</label>
                    <input
                      type="date"
                      value={formData.interviewDate}
                      onChange={(e) => setFormData({ ...formData, interviewDate: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-neutral-300 focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-neutral-700 block mb-1">Follow-up Date</label>
                    <input
                      type="date"
                      value={formData.followUpDate}
                      onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-neutral-300 focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-neutral-700 block mb-1">Contact Person / Recruiter</label>
                  <input
                    type="text"
                    value={formData.contact}
                    onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                    placeholder="e.g. Jane Doe (Recruiter) - jane@company.com"
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300 focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                <div>
                  <label className="font-bold text-neutral-700 block mb-1">Notes &amp; Prep</label>
                  <textarea
                    rows={3}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Referral name, key interview questions, tech stack discussion points..."
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300 focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-neutral-100">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 rounded-xl border border-neutral-200 hover:bg-neutral-100 text-neutral-700 text-xs font-bold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-5 py-2 rounded-xl gradient-ai text-white text-xs font-bold shadow-xs hover:opacity-95 disabled:opacity-50"
                  >
                    {isSaving ? "Saving..." : editingApp ? "Save Changes" : "Track Application"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
