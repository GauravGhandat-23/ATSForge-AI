import React from "react";
import { ResumeData, TemplateConfig } from "@/lib/types";

interface TemplateProps {
  resume: ResumeData;
  config?: Partial<TemplateConfig>;
}

// -------------------------------------------------------------
// 1. ATS CLASSIC TEMPLATE
// -------------------------------------------------------------
export function ATSClassicTemplate({ resume }: TemplateProps) {
  const { personalInfo, summary, experiences, education, skills, projects, certifications, achievements } = resume;

  return (
    <div className="font-sans text-neutral-900 leading-relaxed text-sm p-8 space-y-4">
      {/* Header */}
      <div className="text-center border-b pb-3 border-neutral-300">
        <h1 className="text-2xl font-bold uppercase tracking-wider text-neutral-900">{personalInfo.fullName || "Your Name"}</h1>
        <p className="text-sm font-medium text-neutral-700 mt-1">{personalInfo.title || "Professional Title"}</p>
        <div className="flex flex-wrap justify-center gap-2 text-xs text-neutral-600 mt-2">
          {personalInfo.location && <span>{personalInfo.location}</span>}
          {personalInfo.phone && <span>• {personalInfo.phone}</span>}
          {personalInfo.email && (
            <span>
              • <a href={`mailto:${personalInfo.email}`} className="text-neutral-900 underline">{personalInfo.email}</a>
            </span>
          )}
          {personalInfo.linkedin && (
            <span>
              • <a href={personalInfo.linkedin} target="_blank" rel="noreferrer" className="text-blue-700 underline">LinkedIn</a>
            </span>
          )}
          {personalInfo.github && (
            <span>
              • <a href={personalInfo.github} target="_blank" rel="noreferrer" className="text-blue-700 underline">GitHub</a>
            </span>
          )}
        </div>
      </div>

      {/* Professional Summary */}
      {summary && (
        <section>
          <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-800 border-b border-neutral-300 pb-0.5 mb-1.5">
            Professional Summary
          </h2>
          <p className="text-xs leading-normal text-neutral-800 text-justify">{summary}</p>
        </section>
      )}

      {/* Experience */}
      {experiences && experiences.length > 0 && (
        <section>
          <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-800 border-b border-neutral-300 pb-0.5 mb-2">
            Work Experience
          </h2>
          <div className="space-y-3">
            {experiences.map((exp) => (
              <div key={exp.id}>
                <div className="flex justify-between items-baseline font-semibold text-xs">
                  <span>{exp.jobTitle} — <span className="font-normal text-neutral-700">{exp.company}</span></span>
                  <span className="text-neutral-500 font-normal">{exp.startDate} - {exp.current ? "Present" : exp.endDate}</span>
                </div>
                {exp.location && <p className="text-[11px] text-neutral-500 italic mb-1">{exp.location}</p>}
                <ul className="list-disc list-inside text-xs space-y-1 text-neutral-800 ml-1">
                  {exp.bullets.map((b, i) => (
                    <li key={i} className="leading-snug">{b}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Skills */}
      {skills && (
        <section>
          <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-800 border-b border-neutral-300 pb-0.5 mb-1.5">
            Technical & Professional Skills
          </h2>
          <div className="text-xs space-y-1 text-neutral-800">
            {skills.technical?.length > 0 && (
              <p><strong className="font-semibold">Core Technical:</strong> {skills.technical.join(", ")}</p>
            )}
            {skills.tools?.length > 0 && (
              <p><strong className="font-semibold">Tools & Frameworks:</strong> {skills.tools.join(", ")}</p>
            )}
            {skills.soft?.length > 0 && (
              <p><strong className="font-semibold">Competencies:</strong> {skills.soft.join(", ")}</p>
            )}
          </div>
        </section>
      )}

      {/* Education */}
      {education && education.length > 0 && (
        <section>
          <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-800 border-b border-neutral-300 pb-0.5 mb-1.5">
            Education
          </h2>
          <div className="space-y-2">
            {education.map((edu) => (
              <div key={edu.id} className="flex justify-between items-baseline text-xs">
                <div>
                  <span className="font-semibold">{edu.degree} in {edu.field}</span>
                  <p className="text-neutral-600">{edu.institution} {edu.gpa ? `• GPA: ${edu.gpa}` : ""}</p>
                </div>
                <span className="text-neutral-500">{edu.startDate} - {edu.endDate}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Projects */}
      {projects && projects.length > 0 && (
        <section>
          <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-800 border-b border-neutral-300 pb-0.5 mb-1.5">
            Key Projects
          </h2>
          <div className="space-y-2">
            {projects.map((proj) => (
              <div key={proj.id} className="text-xs">
                <div className="flex justify-between font-semibold">
                  <span>{proj.name}</span>
                  {proj.projectUrl && (
                    <a href={proj.projectUrl} target="_blank" rel="noreferrer" className="text-blue-700 underline font-normal">
                      Live Link
                    </a>
                  )}
                </div>
                <p className="text-neutral-700 mt-0.5">{proj.description}</p>
                {proj.technologies?.length > 0 && (
                  <p className="text-[11px] text-neutral-500 mt-0.5">Technologies: {proj.technologies.join(", ")}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Certifications */}
      {certifications && certifications.length > 0 && (
        <section>
          <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-800 border-b border-neutral-300 pb-0.5 mb-1.5">
            Certifications
          </h2>
          <div className="space-y-1 text-xs">
            {certifications.map((c) => (
              <div key={c.id} className="flex justify-between">
                <span><strong>{c.name}</strong> — {c.issuer}</span>
                <span className="text-neutral-500">{c.date}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

// -------------------------------------------------------------
// 2. MODERN TEMPLATE
// -------------------------------------------------------------
export function ModernTemplate({ resume }: TemplateProps) {
  const { personalInfo, summary, experiences, education, skills, projects, certifications } = resume;
  const accent = resume.templateConfig?.accentColor || "#4f46e5";

  return (
    <div className="font-sans text-neutral-900 text-sm p-8 space-y-5">
      {/* Header with accent title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: accent }}>
          {personalInfo.fullName || "Your Name"}
        </h1>
        <p className="text-base font-semibold text-neutral-700 mt-0.5">{personalInfo.title}</p>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-neutral-500 mt-2.5">
          {personalInfo.location && <span>📍 {personalInfo.location}</span>}
          {personalInfo.email && <span>✉️ {personalInfo.email}</span>}
          {personalInfo.phone && <span>📞 {personalInfo.phone}</span>}
          {personalInfo.linkedin && (
            <a href={personalInfo.linkedin} target="_blank" rel="noreferrer" className="hover:underline" style={{ color: accent }}>
              🔗 LinkedIn
            </a>
          )}
          {personalInfo.github && (
            <a href={personalInfo.github} target="_blank" rel="noreferrer" className="hover:underline" style={{ color: accent }}>
              💻 GitHub
            </a>
          )}
        </div>
      </div>

      {/* Summary */}
      {summary && (
        <div className="p-3 bg-neutral-50 rounded border-l-4" style={{ borderColor: accent }}>
          <p className="text-xs leading-relaxed text-neutral-700">{summary}</p>
        </div>
      )}

      {/* Experience */}
      {experiences?.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-800">Experience</h2>
            <div className="h-[2px] flex-1 bg-neutral-200" />
          </div>
          <div className="space-y-4">
            {experiences.map((exp) => (
              <div key={exp.id}>
                <div className="flex justify-between font-semibold text-xs text-neutral-900">
                  <span className="text-sm font-bold">{exp.jobTitle}</span>
                  <span className="text-xs text-neutral-500 font-medium">{exp.startDate} – {exp.current ? "Present" : exp.endDate}</span>
                </div>
                <div className="text-xs font-medium text-neutral-600 mb-1">{exp.company} {exp.location ? `• ${exp.location}` : ""}</div>
                <ul className="list-disc list-outside text-xs space-y-1.5 text-neutral-700 ml-4">
                  {exp.bullets.map((b, i) => (
                    <li key={i} className="leading-relaxed">{b}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Skills Pill Badges */}
      {skills && (
        <section>
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-800">Key Skills</h2>
            <div className="h-[2px] flex-1 bg-neutral-200" />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {[...(skills.technical || []), ...(skills.tools || [])].map((s, i) => (
              <span
                key={i}
                className="text-[11px] font-medium px-2 py-0.5 rounded bg-neutral-100 text-neutral-800 border border-neutral-200"
              >
                {s}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Education */}
      {education?.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-800">Education</h2>
            <div className="h-[2px] flex-1 bg-neutral-200" />
          </div>
          <div className="space-y-2">
            {education.map((edu) => (
              <div key={edu.id} className="flex justify-between text-xs">
                <div>
                  <p className="font-bold text-neutral-900">{edu.degree} in {edu.field}</p>
                  <p className="text-neutral-600">{edu.institution} {edu.gpa ? `• GPA: ${edu.gpa}` : ""}</p>
                </div>
                <span className="text-neutral-500 font-medium">{edu.startDate} – {edu.endDate}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Projects */}
      {projects?.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-800">Featured Projects</h2>
            <div className="h-[2px] flex-1 bg-neutral-200" />
          </div>
          <div className="space-y-2.5">
            {projects.map((p) => (
              <div key={p.id} className="text-xs">
                <div className="flex justify-between items-baseline font-semibold">
                  <span className="font-bold text-neutral-900">{p.name}</span>
                  {p.projectUrl && (
                    <a href={p.projectUrl} target="_blank" rel="noreferrer" style={{ color: accent }} className="underline font-normal">
                      Demo ↗
                    </a>
                  )}
                </div>
                <p className="text-neutral-700 mt-0.5">{p.description}</p>
                {p.technologies?.length > 0 && (
                  <p className="text-[11px] text-neutral-500 mt-0.5">Stack: {p.technologies.join(" · ")}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

// -------------------------------------------------------------
// 3. MINIMAL TEMPLATE
// -------------------------------------------------------------
export function MinimalTemplate({ resume }: TemplateProps) {
  const { personalInfo, summary, experiences, education, skills, projects } = resume;

  return (
    <div className="font-sans text-neutral-800 text-xs p-8 space-y-4">
      <div className="pb-3 border-b border-neutral-200">
        <h1 className="text-2xl font-light tracking-wide text-neutral-900">{personalInfo.fullName}</h1>
        <p className="text-xs text-neutral-500 uppercase tracking-widest mt-0.5">{personalInfo.title}</p>
        <p className="text-[11px] text-neutral-400 mt-1">
          {[personalInfo.location, personalInfo.email, personalInfo.phone].filter(Boolean).join("  /  ")}
        </p>
      </div>

      {summary && (
        <section>
          <p className="text-neutral-700 leading-relaxed italic">{summary}</p>
        </section>
      )}

      {experiences?.length > 0 && (
        <section>
          <h2 className="text-[11px] font-semibold tracking-wider uppercase text-neutral-400 mb-2">Experience</h2>
          <div className="space-y-3">
            {experiences.map((exp) => (
              <div key={exp.id}>
                <div className="flex justify-between font-medium text-neutral-900">
                  <span>{exp.jobTitle}, <span className="text-neutral-600">{exp.company}</span></span>
                  <span className="text-neutral-400 text-[11px]">{exp.startDate} - {exp.current ? "Present" : exp.endDate}</span>
                </div>
                <ul className="list-disc list-inside mt-1 space-y-1 text-neutral-600">
                  {exp.bullets.map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}

      {skills && (
        <section>
          <h2 className="text-[11px] font-semibold tracking-wider uppercase text-neutral-400 mb-1.5">Skills</h2>
          <p className="text-neutral-700 leading-relaxed">
            {[...(skills.technical || []), ...(skills.tools || [])].join(" • ")}
          </p>
        </section>
      )}

      {education?.length > 0 && (
        <section>
          <h2 className="text-[11px] font-semibold tracking-wider uppercase text-neutral-400 mb-1.5">Education</h2>
          {education.map((edu) => (
            <div key={edu.id} className="flex justify-between text-neutral-700">
              <span>{edu.degree} in {edu.field} — {edu.institution}</span>
              <span className="text-neutral-400 text-[11px]">{edu.startDate} - {edu.endDate}</span>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}

// -------------------------------------------------------------
// 4. PROFESSIONAL TEMPLATE
// -------------------------------------------------------------
export function ProfessionalTemplate({ resume }: TemplateProps) {
  const { personalInfo, summary, experiences, education, skills, projects, certifications } = resume;
  const accent = resume.templateConfig?.accentColor || "#059669";

  return (
    <div className="font-sans text-neutral-900 text-xs p-8 space-y-4">
      <div className="border-b-2 pb-3" style={{ borderColor: accent }}>
        <h1 className="text-2xl font-bold text-neutral-900">{personalInfo.fullName}</h1>
        <p className="text-sm font-semibold" style={{ color: accent }}>{personalInfo.title}</p>
        <div className="flex flex-wrap gap-3 text-neutral-600 text-[11px] mt-1.5">
          <span>{personalInfo.location}</span>
          <span>•</span>
          <span>{personalInfo.email}</span>
          <span>•</span>
          <span>{personalInfo.phone}</span>
        </div>
      </div>

      {summary && (
        <section>
          <h2 className="font-bold uppercase tracking-wider text-neutral-800 text-xs mb-1">Executive Summary</h2>
          <p className="text-neutral-700 leading-relaxed">{summary}</p>
        </section>
      )}

      {experiences?.length > 0 && (
        <section>
          <h2 className="font-bold uppercase tracking-wider text-neutral-800 text-xs mb-2">Professional Experience</h2>
          <div className="space-y-3">
            {experiences.map((exp) => (
              <div key={exp.id}>
                <div className="flex justify-between font-bold text-neutral-900">
                  <span>{exp.jobTitle} | {exp.company}</span>
                  <span className="font-normal text-neutral-500">{exp.startDate} - {exp.current ? "Present" : exp.endDate}</span>
                </div>
                <ul className="list-disc list-outside ml-4 mt-1 space-y-1 text-neutral-700">
                  {exp.bullets.map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}

      {skills && (
        <section>
          <h2 className="font-bold uppercase tracking-wider text-neutral-800 text-xs mb-1.5">Core Competencies</h2>
          <div className="grid grid-cols-2 gap-2 text-neutral-700">
            <div><strong>Technical:</strong> {skills.technical?.join(", ")}</div>
            <div><strong>Tools:</strong> {skills.tools?.join(", ")}</div>
          </div>
        </section>
      )}

      {education?.length > 0 && (
        <section>
          <h2 className="font-bold uppercase tracking-wider text-neutral-800 text-xs mb-1.5">Education</h2>
          {education.map((e) => (
            <div key={e.id} className="flex justify-between">
              <span><strong>{e.degree}</strong>, {e.field} — {e.institution}</span>
              <span className="text-neutral-500">{e.startDate} - {e.endDate}</span>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}

// -------------------------------------------------------------
// 5. TECHNICAL TEMPLATE
// -------------------------------------------------------------
export function TechnicalTemplate({ resume }: TemplateProps) {
  const { personalInfo, summary, experiences, education, skills, projects, certifications } = resume;
  const accent = resume.templateConfig?.accentColor || "#0284c7";

  return (
    <div className="font-sans text-neutral-900 text-xs p-8 space-y-4">
      {/* Header */}
      <div className="flex justify-between items-start border-b pb-3 border-neutral-300">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">{personalInfo.fullName}</h1>
          <p className="text-sm font-semibold mt-0.5" style={{ color: accent }}>{personalInfo.title}</p>
        </div>
        <div className="text-right text-[11px] text-neutral-600 space-y-0.5">
          <p>{personalInfo.location}</p>
          <p>{personalInfo.email} | {personalInfo.phone}</p>
          {personalInfo.github && <p><a href={personalInfo.github} className="underline" style={{ color: accent }}>{personalInfo.github}</a></p>}
        </div>
      </div>

      {/* Technical Skills Table */}
      {skills && (
        <section className="bg-neutral-50 p-3 rounded border border-neutral-200">
          <h2 className="font-bold uppercase tracking-wider text-[11px] text-neutral-700 mb-1.5">Technical Architecture & Stack</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-neutral-800 text-[11px]">
            <div><strong className="block text-neutral-900 font-semibold">Languages & Frameworks:</strong> {skills.technical?.join(", ")}</div>
            <div><strong className="block text-neutral-900 font-semibold">Cloud & DevOps:</strong> {skills.tools?.join(", ")}</div>
            <div><strong className="block text-neutral-900 font-semibold">Specializations:</strong> {skills.soft?.join(", ")}</div>
          </div>
        </section>
      )}

      {/* Work Experience */}
      {experiences?.length > 0 && (
        <section>
          <h2 className="font-bold uppercase tracking-wider text-xs border-b pb-1 mb-2" style={{ color: accent }}>
            Engineering Experience
          </h2>
          <div className="space-y-3">
            {experiences.map((exp) => (
              <div key={exp.id}>
                <div className="flex justify-between font-bold text-neutral-900">
                  <span>{exp.jobTitle} <span className="font-normal text-neutral-600">@ {exp.company}</span></span>
                  <span className="text-neutral-500 font-normal">{exp.startDate} - {exp.current ? "Present" : exp.endDate}</span>
                </div>
                <ul className="list-disc list-outside ml-4 mt-1 space-y-1 text-neutral-700">
                  {exp.bullets.map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Projects */}
      {projects?.length > 0 && (
        <section>
          <h2 className="font-bold uppercase tracking-wider text-xs border-b pb-1 mb-2" style={{ color: accent }}>
            Systems & Open Source
          </h2>
          <div className="space-y-2">
            {projects.map((p) => (
              <div key={p.id}>
                <div className="flex justify-between font-bold">
                  <span>{p.name}</span>
                  {p.githubUrl && <a href={p.githubUrl} className="underline text-neutral-500 font-normal">source ↗</a>}
                </div>
                <p className="text-neutral-700">{p.description}</p>
                {p.technologies?.length > 0 && (
                  <p className="text-[11px] text-neutral-500">Tech: {p.technologies.join(", ")}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Education */}
      {education?.length > 0 && (
        <section>
          <h2 className="font-bold uppercase tracking-wider text-xs border-b pb-1 mb-1.5" style={{ color: accent }}>
            Education & Certifications
          </h2>
          <div className="flex justify-between">
            {education.map((e) => (
              <div key={e.id}>
                <span className="font-bold">{e.degree} in {e.field}</span> — {e.institution}
              </div>
            ))}
            {certifications?.[0] && (
              <div className="text-neutral-600">
                Cert: <strong>{certifications[0].name}</strong> ({certifications[0].issuer})
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}

// -------------------------------------------------------------
// 6. EXECUTIVE TEMPLATE
// -------------------------------------------------------------
export function ExecutiveTemplate({ resume }: TemplateProps) {
  const { personalInfo, summary, experiences, education, skills, achievements } = resume;
  const accent = resume.templateConfig?.accentColor || "#1e293b";

  return (
    <div className="font-sans text-neutral-900 text-xs p-8 space-y-4">
      <div className="text-center border-y-2 py-4 my-2" style={{ borderColor: accent }}>
        <h1 className="text-2xl font-bold tracking-widest uppercase">{personalInfo.fullName}</h1>
        <p className="text-xs font-semibold tracking-wider text-neutral-600 uppercase mt-1">{personalInfo.title}</p>
        <p className="text-[11px] text-neutral-500 mt-1">
          {personalInfo.location} | {personalInfo.email} | {personalInfo.phone}
        </p>
      </div>

      {summary && (
        <section>
          <h2 className="font-bold uppercase tracking-widest text-center text-xs text-neutral-700 mb-1">Executive Profile</h2>
          <p className="text-neutral-700 leading-relaxed text-justify px-2">{summary}</p>
        </section>
      )}

      {experiences?.length > 0 && (
        <section>
          <h2 className="font-bold uppercase tracking-widest text-xs border-b pb-1 mb-2 text-neutral-800">
            Leadership & Experience
          </h2>
          <div className="space-y-3">
            {experiences.map((exp) => (
              <div key={exp.id}>
                <div className="flex justify-between font-bold text-neutral-900">
                  <span>{exp.jobTitle.toUpperCase()}</span>
                  <span className="font-normal text-neutral-500">{exp.startDate} - {exp.current ? "Present" : exp.endDate}</span>
                </div>
                <p className="text-[11px] font-semibold text-neutral-600 italic mb-1">{exp.company}</p>
                <ul className="list-disc list-outside ml-4 space-y-1 text-neutral-700">
                  {exp.bullets.map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}

      {education?.length > 0 && (
        <section>
          <h2 className="font-bold uppercase tracking-widest text-xs border-b pb-1 mb-1.5 text-neutral-800">Education</h2>
          {education.map((e) => (
            <div key={e.id} className="flex justify-between">
              <span><strong>{e.degree}</strong>, {e.field} — {e.institution}</span>
              <span className="text-neutral-500">{e.startDate} - {e.endDate}</span>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}

// -------------------------------------------------------------
// 7. STUDENT TEMPLATE (Education prioritized first)
// -------------------------------------------------------------
export function StudentTemplate({ resume }: TemplateProps) {
  const { personalInfo, summary, experiences, education, skills, projects } = resume;
  const accent = resume.templateConfig?.accentColor || "#2563eb";

  return (
    <div className="font-sans text-neutral-900 text-xs p-8 space-y-4">
      <div className="border-b pb-3">
        <h1 className="text-2xl font-bold">{personalInfo.fullName}</h1>
        <p className="text-xs text-neutral-600">{personalInfo.location} • {personalInfo.email} • {personalInfo.phone}</p>
      </div>

      {/* Education First */}
      {education?.length > 0 && (
        <section>
          <h2 className="font-bold uppercase text-xs pb-1 border-b mb-1.5" style={{ color: accent }}>Education</h2>
          {education.map((e) => (
            <div key={e.id} className="flex justify-between">
              <div>
                <p className="font-bold text-neutral-900">{e.institution}</p>
                <p className="text-neutral-700">{e.degree} in {e.field} {e.gpa ? `(GPA: ${e.gpa})` : ""}</p>
              </div>
              <span className="text-neutral-500">{e.startDate} - {e.endDate}</span>
            </div>
          ))}
        </section>
      )}

      {/* Technical Skills */}
      {skills && (
        <section>
          <h2 className="font-bold uppercase text-xs pb-1 border-b mb-1.5" style={{ color: accent }}>Skills & Coursework</h2>
          <p><strong>Technical:</strong> {skills.technical?.join(", ")}</p>
          <p><strong>Tools:</strong> {skills.tools?.join(", ")}</p>
        </section>
      )}

      {/* Projects */}
      {projects?.length > 0 && (
        <section>
          <h2 className="font-bold uppercase text-xs pb-1 border-b mb-1.5" style={{ color: accent }}>Academic & Personal Projects</h2>
          <div className="space-y-2">
            {projects.map((p) => (
              <div key={p.id}>
                <p className="font-bold">{p.name}</p>
                <p className="text-neutral-700">{p.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Experience / Internships */}
      {experiences?.length > 0 && (
        <section>
          <h2 className="font-bold uppercase text-xs pb-1 border-b mb-1.5" style={{ color: accent }}>Experience & Internships</h2>
          <div className="space-y-2.5">
            {experiences.map((exp) => (
              <div key={exp.id}>
                <div className="flex justify-between font-bold">
                  <span>{exp.jobTitle} — {exp.company}</span>
                  <span className="font-normal text-neutral-500">{exp.startDate} - {exp.current ? "Present" : exp.endDate}</span>
                </div>
                <ul className="list-disc list-outside ml-4 mt-0.5 space-y-0.5 text-neutral-700">
                  {exp.bullets.map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

// -------------------------------------------------------------
// 8. FRESHER TEMPLATE
// -------------------------------------------------------------
export function FresherTemplate({ resume }: TemplateProps) {
  return <StudentTemplate resume={resume} />;
}

// -------------------------------------------------------------
// 9. TWO COLUMN TEMPLATE (ATS compatible 2-column)
// -------------------------------------------------------------
export function TwoColumnTemplate({ resume }: TemplateProps) {
  const { personalInfo, summary, experiences, education, skills, projects, certifications } = resume;
  const accent = resume.templateConfig?.accentColor || "#0f766e";

  return (
    <div className="font-sans text-neutral-900 text-xs p-8">
      {/* Top Header */}
      <div className="border-b pb-3 mb-4">
        <h1 className="text-2xl font-bold" style={{ color: accent }}>{personalInfo.fullName}</h1>
        <p className="text-xs font-semibold text-neutral-700">{personalInfo.title}</p>
      </div>

      <div className="grid grid-cols-12 gap-5">
        {/* Left Column (35%) */}
        <div className="col-span-4 space-y-4 border-r pr-4 border-neutral-200">
          <div>
            <h3 className="font-bold uppercase text-[11px] text-neutral-800 mb-1">Contact</h3>
            <div className="space-y-1 text-[11px] text-neutral-600">
              <p>{personalInfo.location}</p>
              <p>{personalInfo.email}</p>
              <p>{personalInfo.phone}</p>
            </div>
          </div>

          {skills && (
            <div>
              <h3 className="font-bold uppercase text-[11px] text-neutral-800 mb-1">Skills</h3>
              <div className="space-y-1.5 text-[11px] text-neutral-700">
                <p><strong>Languages:</strong> {skills.technical?.join(", ")}</p>
                <p><strong>Tools:</strong> {skills.tools?.join(", ")}</p>
              </div>
            </div>
          )}

          {education?.length > 0 && (
            <div>
              <h3 className="font-bold uppercase text-[11px] text-neutral-800 mb-1">Education</h3>
              {education.map((e) => (
                <div key={e.id} className="text-[11px] mb-2">
                  <p className="font-bold">{e.degree}</p>
                  <p className="text-neutral-600">{e.institution}</p>
                  <p className="text-neutral-400">{e.startDate} - {e.endDate}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Main Column (65%) */}
        <div className="col-span-8 space-y-4">
          {summary && (
            <div>
              <h3 className="font-bold uppercase text-xs text-neutral-800 mb-1">Profile</h3>
              <p className="text-neutral-700 leading-relaxed text-xs">{summary}</p>
            </div>
          )}

          {experiences?.length > 0 && (
            <div>
              <h3 className="font-bold uppercase text-xs text-neutral-800 mb-2">Experience</h3>
              <div className="space-y-3">
                {experiences.map((exp) => (
                  <div key={exp.id}>
                    <div className="flex justify-between font-bold text-xs">
                      <span>{exp.jobTitle}</span>
                      <span className="font-normal text-neutral-500">{exp.startDate} - {exp.current ? "Present" : exp.endDate}</span>
                    </div>
                    <p className="text-neutral-600 text-[11px] mb-1">{exp.company}</p>
                    <ul className="list-disc list-outside ml-3.5 space-y-1 text-neutral-700 text-xs">
                      {exp.bullets.map((b, i) => (
                        <li key={i}>{b}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 10. CORPORATE TEMPLATE
// -------------------------------------------------------------
export function CorporateTemplate({ resume }: TemplateProps) {
  const { personalInfo, summary, experiences, education, skills } = resume;

  return (
    <div className="font-sans text-neutral-900 text-xs p-8 space-y-4">
      <div className="bg-neutral-900 text-white p-4 rounded-t">
        <h1 className="text-2xl font-bold uppercase tracking-wider">{personalInfo.fullName}</h1>
        <p className="text-xs text-neutral-300 font-medium">{personalInfo.title}</p>
        <p className="text-[11px] text-neutral-400 mt-1">{personalInfo.location} • {personalInfo.email} • {personalInfo.phone}</p>
      </div>

      {summary && (
        <section>
          <h2 className="font-bold uppercase tracking-wider text-xs border-b-2 border-neutral-900 pb-0.5 mb-1">Summary</h2>
          <p className="text-neutral-700 leading-relaxed">{summary}</p>
        </section>
      )}

      {experiences?.length > 0 && (
        <section>
          <h2 className="font-bold uppercase tracking-wider text-xs border-b-2 border-neutral-900 pb-0.5 mb-2">Professional Experience</h2>
          <div className="space-y-3">
            {experiences.map((exp) => (
              <div key={exp.id}>
                <div className="flex justify-between font-bold text-neutral-900">
                  <span>{exp.jobTitle} — <span className="text-neutral-600 font-normal">{exp.company}</span></span>
                  <span className="font-normal text-neutral-500">{exp.startDate} - {exp.current ? "Present" : exp.endDate}</span>
                </div>
                <ul className="list-disc list-outside ml-4 mt-1 space-y-1 text-neutral-700">
                  {exp.bullets.map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}

      {skills && (
        <section>
          <h2 className="font-bold uppercase tracking-wider text-xs border-b-2 border-neutral-900 pb-0.5 mb-1.5">Skills Matrix</h2>
          <p><strong>Technical Stack:</strong> {skills.technical?.join(", ")}</p>
          <p><strong>Tools:</strong> {skills.tools?.join(", ")}</p>
        </section>
      )}

      {education?.length > 0 && (
        <section>
          <h2 className="font-bold uppercase tracking-wider text-xs border-b-2 border-neutral-900 pb-0.5 mb-1">Education</h2>
          {education.map((e) => (
            <div key={e.id} className="flex justify-between">
              <span><strong>{e.degree} in {e.field}</strong> — {e.institution}</span>
              <span className="text-neutral-500">{e.startDate} - {e.endDate}</span>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}

// -------------------------------------------------------------
// 11. SIMPLE TEMPLATE (Ultra-clean single column ATS standard)
// -------------------------------------------------------------
export function SimpleTemplate({ resume }: TemplateProps) {
  const { personalInfo, summary, experiences, education, skills, projects, certifications, languages } = resume;

  return (
    <div className="font-sans text-neutral-900 leading-normal text-xs p-8 space-y-4 max-w-[794px]">
      {/* Header */}
      <div className="border-b border-neutral-300 pb-3">
        <h1 className="text-xl font-bold tracking-tight text-neutral-900">{personalInfo.fullName || "Your Name"}</h1>
        <p className="text-xs font-semibold text-neutral-700 mt-0.5">{personalInfo.title || "Target Professional Role"}</p>
        <p className="text-[11px] text-neutral-600 mt-1">
          {[personalInfo.email, personalInfo.phone, personalInfo.location, personalInfo.linkedin, personalInfo.github]
            .filter(Boolean)
            .join("  |  ")}
        </p>
      </div>

      {/* Summary */}
      {summary && (
        <section>
          <h2 className="font-bold uppercase tracking-wider text-xs text-neutral-900 border-b border-neutral-200 pb-0.5 mb-1.5">
            Summary
          </h2>
          <p className="text-neutral-700 leading-relaxed">{summary}</p>
        </section>
      )}

      {/* Experience */}
      {experiences && experiences.length > 0 && (
        <section>
          <h2 className="font-bold uppercase tracking-wider text-xs text-neutral-900 border-b border-neutral-200 pb-0.5 mb-2">
            Experience
          </h2>
          <div className="space-y-3">
            {experiences.map((exp) => (
              <div key={exp.id}>
                <div className="flex justify-between font-bold text-neutral-900">
                  <span>{exp.jobTitle} — {exp.company}</span>
                  <span className="text-neutral-500 font-normal">{exp.startDate} - {exp.current ? "Present" : exp.endDate}</span>
                </div>
                {exp.location && <p className="text-[10px] text-neutral-500 italic mb-1">{exp.location}</p>}
                <ul className="list-disc ml-4 space-y-1 text-neutral-700">
                  {exp.bullets.map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Education */}
      {education && education.length > 0 && (
        <section>
          <h2 className="font-bold uppercase tracking-wider text-xs text-neutral-900 border-b border-neutral-200 pb-0.5 mb-1.5">
            Education
          </h2>
          <div className="space-y-1.5">
            {education.map((edu) => (
              <div key={edu.id} className="flex justify-between">
                <div>
                  <span className="font-bold text-neutral-900">{edu.degree} in {edu.field}</span>
                  <span className="text-neutral-600"> — {edu.institution}</span>
                  {edu.gpa && <span className="text-neutral-500 text-[10px]"> (GPA: {edu.gpa})</span>}
                </div>
                <span className="text-neutral-500 font-normal">{edu.startDate} - {edu.endDate}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Skills */}
      {skills && (
        <section>
          <h2 className="font-bold uppercase tracking-wider text-xs text-neutral-900 border-b border-neutral-200 pb-0.5 mb-1.5">
            Skills
          </h2>
          <p className="text-neutral-700 leading-relaxed">
            <strong>Technical Skills:</strong> {skills.technical?.join(", ") || "N/A"}<br />
            <strong>Tools &amp; Frameworks:</strong> {skills.tools?.join(", ") || "N/A"}<br />
            <strong>Soft Skills:</strong> {skills.soft?.join(", ") || "N/A"}
          </p>
        </section>
      )}

      {/* Projects */}
      {projects && projects.length > 0 && (
        <section>
          <h2 className="font-bold uppercase tracking-wider text-xs text-neutral-900 border-b border-neutral-200 pb-0.5 mb-1.5">
            Projects
          </h2>
          <div className="space-y-2">
            {projects.map((p) => (
              <div key={p.id}>
                <div className="font-bold text-neutral-900">{p.name} {p.technologies?.length ? `(${p.technologies.join(", ")})` : ""}</div>
                <p className="text-neutral-700 text-[11px]">{p.description}</p>
                {p.bullets && p.bullets.length > 0 && (
                  <ul className="list-disc ml-4 space-y-0.5 text-neutral-700 text-[11px]">
                    {p.bullets.map((b, i) => (
                      <li key={i}>{b}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Certifications */}
      {certifications && certifications.length > 0 && (
        <section>
          <h2 className="font-bold uppercase tracking-wider text-xs text-neutral-900 border-b border-neutral-200 pb-0.5 mb-1">
            Certifications
          </h2>
          <ul className="list-disc ml-4 text-neutral-700 space-y-0.5">
            {certifications.map((c) => (
              <li key={c.id}><strong>{c.name}</strong> — {c.issuer} ({c.date})</li>
            ))}
          </ul>
        </section>
      )}

      {/* Languages */}
      {languages && languages.length > 0 && (
        <section>
          <h2 className="font-bold uppercase tracking-wider text-xs text-neutral-900 border-b border-neutral-200 pb-0.5 mb-1">
            Languages
          </h2>
          <p className="text-neutral-700">{languages.map((l) => `${l.name} (${l.proficiency})`).join(", ")}</p>
        </section>
      )}
    </div>
  );
}

// -------------------------------------------------------------
// Unified Resume Document Renderer
// -------------------------------------------------------------
export function ResumeDocument({ resume, customConfig }: { resume: ResumeData; customConfig?: Partial<TemplateConfig> }) {
  const templateId = resume.templateId || "modern";
  const config = { ...resume.templateConfig, ...customConfig };

  const renderTemplate = () => {
    switch (templateId) {
      case "ats-classic":
        return <ATSClassicTemplate resume={resume} config={config} />;
      case "modern":
        return <ModernTemplate resume={resume} config={config} />;
      case "minimal":
        return <MinimalTemplate resume={resume} config={config} />;
      case "professional":
        return <ProfessionalTemplate resume={resume} config={config} />;
      case "technical":
        return <TechnicalTemplate resume={resume} config={config} />;
      case "executive":
        return <ExecutiveTemplate resume={resume} config={config} />;
      case "student":
        return <StudentTemplate resume={resume} config={config} />;
      case "fresher":
        return <FresherTemplate resume={resume} config={config} />;
      case "corporate":
        return <CorporateTemplate resume={resume} config={config} />;
      case "simple":
        return <SimpleTemplate resume={resume} config={config} />;
      case "two-column":
        return <TwoColumnTemplate resume={resume} config={config} />;
      default:
        return <ModernTemplate resume={resume} config={config} />;
    }
  };

  // Dimension: A4 standard ratio is ~210mm x 297mm (1 : 1.414). In px at 96 DPI: 794px x 1123px
  return (
    <div
      id="resume-document"
      className="bg-white text-neutral-900 shadow-2xl transition-all duration-200 select-text print:shadow-none print:m-0"
      style={{
        width: "794px",
        minHeight: "1123px",
        boxSizing: "border-box",
      }}
    >
      {renderTemplate()}
    </div>
  );
}

export const TEMPLATE_LIST = [
  { id: "ats-classic", name: "ATS Classic", category: "ATS Classic", description: "Maximum machine readability, clean serif/sans dividers." },
  { id: "modern", name: "Modern", category: "Modern", description: "Contemporary layout with elegant accent styling and badge pills." },
  { id: "minimal", name: "Minimal", category: "Minimal", description: "Lightweight typographic clarity and high white space." },
  { id: "professional", name: "Professional", category: "Professional", description: "Crisp corporate styling with clean hierarchy." },
  { id: "technical", name: "Technical", category: "Technical", description: "Engineered for developers, DevOps, and cyber security specialists." },
  { id: "executive", name: "Executive", category: "Executive", description: "Border framing and prominent leadership metrics." },
  { id: "student", name: "Student", category: "Student", description: "Education and academic projects positioned up top." },
  { id: "fresher", name: "Fresher", category: "Fresher", description: "Showcases foundational skills, certifications, and enthusiasm." },
  { id: "corporate", name: "Corporate", category: "Corporate", description: "Fortune 500 header styling and structured matrix." },
  { id: "simple", name: "Simple", category: "Simple", description: "Ultra-clean single column layout with standard bullet points and perfect ATS parsing." },
];
