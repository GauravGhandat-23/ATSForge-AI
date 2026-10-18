"use client";

import React, { useState } from "react";
import {
  User,
  FileText,
  Briefcase,
  GraduationCap,
  Wrench,
  FolderGit2,
  Award,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  GripVertical,
  Globe,
  Sparkles,
} from "lucide-react";
import { ResumeData, SectionType, ExperienceItem, EducationItem, ProjectItem, CertificationItem } from "@/lib/types";
import { AiImproveButton } from "./AiImproveButton";

interface ResumeFormProps {
  resume: ResumeData;
  onChange: (updated: ResumeData) => void;
}

export function ResumeForm({ resume, onChange }: ResumeFormProps) {
  const [activeTab, setActiveTab] = useState<SectionType>("personal");

  // Helper updates
  const updatePersonalInfo = (field: string, val: string) => {
    onChange({
      ...resume,
      personalInfo: { ...resume.personalInfo, [field]: val },
    });
  };

  const updateSummary = (val: string) => {
    onChange({ ...resume, summary: val });
  };

  // Experience handlers
  const handleAddExperience = () => {
    const newExp: ExperienceItem = {
      id: `exp-${Date.now()}`,
      company: "New Company",
      jobTitle: "Software Engineer",
      location: "City, State",
      startDate: "2023-01",
      endDate: "Present",
      current: true,
      bullets: ["Architected core system features, improving reliability and operational efficiency."],
    };
    onChange({ ...resume, experiences: [newExp, ...resume.experiences] });
  };

  const handleUpdateExperience = (id: string, updates: Partial<ExperienceItem>) => {
    onChange({
      ...resume,
      experiences: resume.experiences.map((exp) => (exp.id === id ? { ...exp, ...updates } : exp)),
    });
  };

  const handleDeleteExperience = (id: string) => {
    onChange({
      ...resume,
      experiences: resume.experiences.filter((exp) => exp.id !== id),
    });
  };

  const handleAddBullet = (expId: string) => {
    const exp = resume.experiences.find((e) => e.id === expId);
    if (!exp) return;
    const newBullets = [...exp.bullets, "Spearheaded key technical initiatives resulting in measurable improvements."];
    handleUpdateExperience(expId, { bullets: newBullets });
  };

  const handleUpdateBullet = (expId: string, index: number, text: string) => {
    const exp = resume.experiences.find((e) => e.id === expId);
    if (!exp) return;
    const newBullets = [...exp.bullets];
    newBullets[index] = text;
    handleUpdateExperience(expId, { bullets: newBullets });
  };

  const handleDeleteBullet = (expId: string, index: number) => {
    const exp = resume.experiences.find((e) => e.id === expId);
    if (!exp) return;
    const newBullets = exp.bullets.filter((_, i) => i !== index);
    handleUpdateExperience(expId, { bullets: newBullets });
  };

  // Education handlers
  const handleAddEducation = () => {
    const newEdu: EducationItem = {
      id: `edu-${Date.now()}`,
      institution: "State University",
      degree: "Bachelor of Science",
      field: "Computer Science",
      startDate: "2018-09",
      endDate: "2022-05",
      gpa: "3.8",
    };
    onChange({ ...resume, education: [...resume.education, newEdu] });
  };

  const handleUpdateEducation = (id: string, updates: Partial<EducationItem>) => {
    onChange({
      ...resume,
      education: resume.education.map((e) => (e.id === id ? { ...e, ...updates } : e)),
    });
  };

  const handleDeleteEducation = (id: string) => {
    onChange({
      ...resume,
      education: resume.education.filter((e) => e.id !== id),
    });
  };

  // Skills handlers
  const handleUpdateSkillsList = (category: "technical" | "soft" | "tools" | "languages", rawString: string) => {
    const list = rawString
      .split(/[,;\n]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    onChange({
      ...resume,
      skills: { ...resume.skills, [category]: list },
    });
  };

  // Projects handlers
  const handleAddProject = () => {
    const newProj: ProjectItem = {
      id: `proj-${Date.now()}`,
      name: "New Project",
      description: "Scalable cloud-native application solving domain-specific challenges.",
      technologies: ["TypeScript", "React", "Node.js"],
      projectUrl: "https://example.com",
      githubUrl: "https://github.com",
    };
    onChange({ ...resume, projects: [...resume.projects, newProj] });
  };

  const handleUpdateProject = (id: string, updates: Partial<ProjectItem>) => {
    onChange({
      ...resume,
      projects: resume.projects.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    });
  };

  const handleDeleteProject = (id: string) => {
    onChange({
      ...resume,
      projects: resume.projects.filter((p) => p.id !== id),
    });
  };

  // Section Ordering and Visibility
  const sections: { id: SectionType; label: string; icon: any }[] = [
    { id: "personal", label: "Contact Info", icon: User },
    { id: "summary", label: "Summary", icon: FileText },
    { id: "experience", label: "Experience", icon: Briefcase },
    { id: "skills", label: "Skills", icon: Wrench },
    { id: "education", label: "Education", icon: GraduationCap },
    { id: "projects", label: "Projects", icon: FolderGit2 },
    { id: "certifications", label: "Certifications", icon: Award },
  ];

  return (
    <div className="flex flex-col h-full bg-white border-r border-neutral-200">
      {/* Section Nav Tabs */}
      <div className="flex overflow-x-auto border-b border-neutral-200 px-3 bg-neutral-50/70 shrink-0 gap-1 py-1.5 select-none scrollbar-none">
        {sections.map((s) => {
          const Icon = s.icon;
          const isActive = activeTab === s.id;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => setActiveTab(s.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? "bg-white text-indigo-700 shadow-2xs border border-neutral-200/80"
                  : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100"
              }`}
            >
              <Icon className={`size-3.5 ${isActive ? "text-indigo-600" : "text-neutral-400"}`} />
              <span>{s.label}</span>
            </button>
          );
        })}
      </div>

      {/* Active Section Form Fields */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
        {/* 1. PERSONAL INFO */}
        {activeTab === "personal" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
              <h3 className="font-bold text-sm text-neutral-900">Personal & Contact Information</h3>
              <span className="text-[10px] text-neutral-400 uppercase font-semibold">ATS Core Field</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-neutral-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={resume.personalInfo.fullName}
                  onChange={(e) => updatePersonalInfo("fullName", e.target.value)}
                  placeholder="Alex Morgan"
                  className="w-full p-2.5 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-700 mb-1">Target Professional Title</label>
                <input
                  type="text"
                  value={resume.personalInfo.title}
                  onChange={(e) => {
                    updatePersonalInfo("title", e.target.value);
                    onChange({ ...resume, targetRole: e.target.value });
                  }}
                  placeholder="Senior Full-Stack Software Engineer"
                  className="w-full p-2.5 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={resume.personalInfo.email}
                  onChange={(e) => updatePersonalInfo("email", e.target.value)}
                  placeholder="alex.morgan@example.com"
                  className="w-full p-2.5 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={resume.personalInfo.phone}
                  onChange={(e) => updatePersonalInfo("phone", e.target.value)}
                  placeholder="+1 (555) 349-8201"
                  className="w-full p-2.5 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-700 mb-1">Location / Relocation</label>
                <input
                  type="text"
                  value={resume.personalInfo.location}
                  onChange={(e) => updatePersonalInfo("location", e.target.value)}
                  placeholder="San Francisco, CA (Open to Remote)"
                  className="w-full p-2.5 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-700 mb-1">LinkedIn Profile</label>
                <input
                  type="text"
                  value={resume.personalInfo.linkedin}
                  onChange={(e) => updatePersonalInfo("linkedin", e.target.value)}
                  placeholder="https://linkedin.com/in/alexmorgan"
                  className="w-full p-2.5 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-700 mb-1">GitHub / Code Portfolio</label>
                <input
                  type="text"
                  value={resume.personalInfo.github}
                  onChange={(e) => updatePersonalInfo("github", e.target.value)}
                  placeholder="https://github.com/alexmorgan"
                  className="w-full p-2.5 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-700 mb-1">Personal Website / Demo</label>
                <input
                  type="text"
                  value={resume.personalInfo.portfolio}
                  onChange={(e) => updatePersonalInfo("portfolio", e.target.value)}
                  placeholder="https://alexmorgan.dev"
                  className="w-full p-2.5 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* 2. SUMMARY */}
        {activeTab === "summary" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
              <div>
                <h3 className="font-bold text-sm text-neutral-900">Professional Summary</h3>
                <p className="text-[11px] text-neutral-500">3-4 punchy sentences highlighting core expertise and impact</p>
              </div>
              <AiImproveButton
                currentText={resume.summary}
                onImproved={updateSummary}
                context={{ role: resume.targetRole }}
                fieldLabel="Summary"
              />
            </div>

            <textarea
              value={resume.summary}
              onChange={(e) => updateSummary(e.target.value)}
              placeholder="Results-oriented engineer with 5+ years of experience architecting high-throughput distributed systems..."
              className="w-full h-44 p-3 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 leading-relaxed font-sans"
            />
            <div className="flex justify-between items-center text-[11px] text-neutral-400">
              <span>{resume.summary.split(/\s+/).filter(Boolean).length} words</span>
              <span>Recommended: 40-75 words</span>
            </div>
          </div>
        )}

        {/* 3. WORK EXPERIENCE */}
        {activeTab === "experience" && (
          <div className="space-y-5">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
              <div>
                <h3 className="font-bold text-sm text-neutral-900">Work Experience</h3>
                <p className="text-[11px] text-neutral-500">Start bullets with strong action verbs & quantifiable metrics</p>
              </div>
              <button
                type="button"
                onClick={handleAddExperience}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg gradient-ai text-white text-xs font-semibold shadow-2xs hover:opacity-95"
              >
                <Plus className="size-3.5" /> Add Experience
              </button>
            </div>

            {resume.experiences.map((exp, expIdx) => (
              <div key={exp.id} className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/40 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-neutral-800 text-xs">Role #{expIdx + 1}</span>
                  <button
                    type="button"
                    onClick={() => handleDeleteExperience(exp.id)}
                    className="text-neutral-400 hover:text-red-600 transition-colors p-1"
                    title="Delete Role"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[10px] font-bold text-neutral-600 mb-1">Company</label>
                    <input
                      type="text"
                      value={exp.company}
                      onChange={(e) => handleUpdateExperience(exp.id, { company: e.target.value })}
                      placeholder="Company Name"
                      className="w-full p-2 bg-white border border-neutral-200 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-neutral-600 mb-1">Job Title</label>
                    <input
                      type="text"
                      value={exp.jobTitle}
                      onChange={(e) => handleUpdateExperience(exp.id, { jobTitle: e.target.value })}
                      placeholder="Senior Engineer"
                      className="w-full p-2 bg-white border border-neutral-200 rounded-lg text-xs font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-neutral-600 mb-1">Start Date</label>
                    <input
                      type="text"
                      value={exp.startDate}
                      onChange={(e) => handleUpdateExperience(exp.id, { startDate: e.target.value })}
                      placeholder="2022-03"
                      className="w-full p-2 bg-white border border-neutral-200 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-neutral-600 mb-1">End Date</label>
                    <input
                      type="text"
                      disabled={exp.current}
                      value={exp.current ? "Present" : exp.endDate}
                      onChange={(e) => handleUpdateExperience(exp.id, { endDate: e.target.value })}
                      placeholder="2024-01 or Present"
                      className="w-full p-2 bg-white border border-neutral-200 rounded-lg text-xs disabled:opacity-60"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id={`current-${exp.id}`}
                    checked={exp.current}
                    onChange={(e) => handleUpdateExperience(exp.id, { current: e.target.checked })}
                    className="rounded border-neutral-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <label htmlFor={`current-${exp.id}`} className="text-[11px] text-neutral-600 cursor-pointer">
                    I currently work here
                  </label>
                </div>

                {/* Bullets */}
                <div className="space-y-2 pt-2 border-t border-neutral-200">
                  <div className="flex justify-between items-center">
                    <label className="text-[11px] font-bold text-neutral-700">Achievement Bullets</label>
                    <button
                      type="button"
                      onClick={() => handleAddBullet(exp.id)}
                      className="text-[11px] font-semibold text-indigo-600 hover:underline flex items-center gap-0.5"
                    >
                      <Plus className="size-3" /> Add Bullet
                    </button>
                  </div>

                  {exp.bullets.map((bullet, bIdx) => (
                    <div key={bIdx} className="space-y-1 bg-white p-2.5 rounded-lg border border-neutral-200">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-mono text-neutral-400">Bullet #{bIdx + 1}</span>
                        <div className="flex items-center gap-1.5">
                          <AiImproveButton
                            currentText={bullet}
                            onImproved={(newText) => handleUpdateBullet(exp.id, bIdx, newText)}
                            context={{ role: exp.jobTitle, company: exp.company }}
                          />
                          <button
                            type="button"
                            onClick={() => handleDeleteBullet(exp.id, bIdx)}
                            className="text-neutral-400 hover:text-red-500 p-1"
                            title="Remove bullet"
                          >
                            <Trash2 className="size-3" />
                          </button>
                        </div>
                      </div>
                      <textarea
                        value={bullet}
                        onChange={(e) => handleUpdateBullet(exp.id, bIdx, e.target.value)}
                        placeholder="Start with an action verb (e.g. Architected, Implemented, Spearheaded)..."
                        className="w-full p-2 text-xs bg-neutral-50/50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500/20"
                        rows={2}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 4. SKILLS */}
        {activeTab === "skills" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
              <h3 className="font-bold text-sm text-neutral-900">Skills & Tooling Matrix</h3>
              <span className="text-[10px] text-neutral-400">Comma-separated</span>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                Core Technical Skills (Languages, Frameworks, Protocols)
              </label>
              <textarea
                value={(resume.skills.technical || []).join(", ")}
                onChange={(e) => handleUpdateSkillsList("technical", e.target.value)}
                placeholder="TypeScript, Python, React, Next.js, PostgreSQL, Docker, AWS, GraphQL..."
                className="w-full h-20 p-2.5 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                Tools, Platforms & Cloud Services
              </label>
              <textarea
                value={(resume.skills.tools || []).join(", ")}
                onChange={(e) => handleUpdateSkillsList("tools", e.target.value)}
                placeholder="Git, GitHub Actions, Docker, Kubernetes, Splunk, Tenable, Wireshark, Tableau..."
                className="w-full h-20 p-2.5 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                Soft Skills & Leadership Competencies
              </label>
              <textarea
                value={(resume.skills.soft || []).join(", ")}
                onChange={(e) => handleUpdateSkillsList("soft", e.target.value)}
                placeholder="System Design, Agile Leadership, Incident Triage, Cross-Functional Communication..."
                className="w-full h-16 p-2.5 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>
        )}

        {/* 5. EDUCATION */}
        {activeTab === "education" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
              <h3 className="font-bold text-sm text-neutral-900">Education</h3>
              <button
                type="button"
                onClick={handleAddEducation}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg gradient-ai text-white text-xs font-semibold shadow-2xs"
              >
                <Plus className="size-3.5" /> Add Degree
              </button>
            </div>

            {resume.education.map((edu) => (
              <div key={edu.id} className="p-3.5 rounded-xl border border-neutral-200 bg-neutral-50/50 space-y-2.5">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-neutral-800 text-xs">Degree Details</span>
                  <button
                    type="button"
                    onClick={() => handleDeleteEducation(edu.id)}
                    className="text-neutral-400 hover:text-red-600 p-1"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={edu.institution}
                    onChange={(e) => handleUpdateEducation(edu.id, { institution: e.target.value })}
                    placeholder="Institution / University"
                    className="p-2 bg-white border border-neutral-200 rounded-lg text-xs font-semibold"
                  />
                  <input
                    type="text"
                    value={edu.degree}
                    onChange={(e) => handleUpdateEducation(edu.id, { degree: e.target.value })}
                    placeholder="Degree (e.g. Bachelor of Science)"
                    className="p-2 bg-white border border-neutral-200 rounded-lg text-xs"
                  />
                  <input
                    type="text"
                    value={edu.field}
                    onChange={(e) => handleUpdateEducation(edu.id, { field: e.target.value })}
                    placeholder="Field of Study (e.g. Computer Science)"
                    className="p-2 bg-white border border-neutral-200 rounded-lg text-xs"
                  />
                  <input
                    type="text"
                    value={edu.gpa}
                    onChange={(e) => handleUpdateEducation(edu.id, { gpa: e.target.value })}
                    placeholder="GPA (e.g. 3.8 / 4.0)"
                    className="p-2 bg-white border border-neutral-200 rounded-lg text-xs"
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 6. PROJECTS */}
        {activeTab === "projects" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
              <h3 className="font-bold text-sm text-neutral-900">Key Projects</h3>
              <button
                type="button"
                onClick={handleAddProject}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg gradient-ai text-white text-xs font-semibold shadow-2xs"
              >
                <Plus className="size-3.5" /> Add Project
              </button>
            </div>

            {resume.projects.map((proj) => (
              <div key={proj.id} className="p-3.5 rounded-xl border border-neutral-200 bg-neutral-50/50 space-y-2">
                <div className="flex justify-between items-center">
                  <input
                    type="text"
                    value={proj.name}
                    onChange={(e) => handleUpdateProject(proj.id, { name: e.target.value })}
                    placeholder="Project Title"
                    className="p-1.5 bg-white border border-neutral-200 rounded-lg text-xs font-bold w-2/3"
                  />
                  <button
                    type="button"
                    onClick={() => handleDeleteProject(proj.id)}
                    className="text-neutral-400 hover:text-red-600 p-1"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
                <textarea
                  value={proj.description}
                  onChange={(e) => handleUpdateProject(proj.id, { description: e.target.value })}
                  placeholder="Describe architecture, user problem solved, and technical metrics..."
                  className="w-full p-2 bg-white border border-neutral-200 rounded-lg text-xs h-16"
                />
                <input
                  type="text"
                  value={(proj.technologies || []).join(", ")}
                  onChange={(e) =>
                    handleUpdateProject(proj.id, {
                      technologies: e.target.value.split(",").map((t) => t.trim()).filter(Boolean),
                    })
                  }
                  placeholder="Technologies used (comma separated: TypeScript, Redis, Docker)"
                  className="w-full p-2 bg-white border border-neutral-200 rounded-lg text-xs"
                />
              </div>
            ))}
          </div>
        )}

        {/* 7. CERTIFICATIONS */}
        {activeTab === "certifications" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
              <h3 className="font-bold text-sm text-neutral-900">Certifications & Licenses</h3>
              <button
                type="button"
                onClick={() => {
                  const newCert: CertificationItem = {
                    id: `cert-${Date.now()}`,
                    name: "AWS Certified Solutions Architect",
                    issuer: "Amazon Web Services",
                    date: "2023-05",
                    credentialUrl: "",
                  };
                  onChange({ ...resume, certifications: [...resume.certifications, newCert] });
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg gradient-ai text-white text-xs font-semibold shadow-2xs"
              >
                <Plus className="size-3.5" /> Add Certification
              </button>
            </div>

            {resume.certifications.map((c) => (
              <div key={c.id} className="p-3 rounded-xl border border-neutral-200 bg-neutral-50/50 flex items-center gap-2">
                <input
                  type="text"
                  value={c.name}
                  onChange={(e) => {
                    onChange({
                      ...resume,
                      certifications: resume.certifications.map((item) =>
                        item.id === c.id ? { ...item, name: e.target.value } : item
                      ),
                    });
                  }}
                  placeholder="Certification Name"
                  className="p-2 bg-white border border-neutral-200 rounded-lg text-xs font-semibold flex-1"
                />
                <input
                  type="text"
                  value={c.issuer}
                  onChange={(e) => {
                    onChange({
                      ...resume,
                      certifications: resume.certifications.map((item) =>
                        item.id === c.id ? { ...item, issuer: e.target.value } : item
                      ),
                    });
                  }}
                  placeholder="Issuer (e.g. AWS, CompTIA)"
                  className="p-2 bg-white border border-neutral-200 rounded-lg text-xs w-36"
                />
                <button
                  type="button"
                  onClick={() => {
                    onChange({
                      ...resume,
                      certifications: resume.certifications.filter((item) => item.id !== c.id),
                    });
                  }}
                  className="text-neutral-400 hover:text-red-600 p-1"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
