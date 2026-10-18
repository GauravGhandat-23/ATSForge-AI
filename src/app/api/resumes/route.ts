import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ResumeData } from "@/lib/types";
import { getCurrentUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized. Please sign in." }, { status: 401 });
  }

  // Strictly return only resumes belonging to the authenticated user
  const resumes = await db.getResumes(user.id);
  return NextResponse.json({ resumes });
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized. Please sign in." }, { status: 401 });
    }

    const body = await request.json();
    const newResume: ResumeData = {
      id: body.id || `res-${Date.now()}`,
      userId: user.id,
      title: body.title || "Untitled Resume",
      targetRole: body.targetRole || "Software Professional",
      targetCompany: body.targetCompany || "",
      personalInfo: body.personalInfo || {
        fullName: user.name || "",
        title: body.targetRole || "Software Professional",
        email: user.email || "",
        phone: "",
        location: "",
        linkedin: "",
        github: "",
        portfolio: "",
      },
      summary: body.summary || "",
      experiences: body.experiences || [],
      education: body.education || [],
      skills: body.skills || {
        technical: [],
        soft: [],
        tools: [],
        languages: [],
      },
      projects: body.projects || [],
      certifications: body.certifications || [],
      achievements: body.achievements || [],
      languages: body.languages || [{ id: "lang-1", name: "English", proficiency: "Professional" }],
      volunteer: body.volunteer || [],
      sectionOrder: [
        "personal",
        "summary",
        "experience",
        "education",
        "skills",
        "projects",
        "certifications",
        "achievements",
        "languages",
      ],
      hiddenSections: [],
      templateId: body.templateId || "modern",
      templateConfig: body.templateConfig || {
        fontFamily: "Inter",
        fontSize: "base",
        lineSpacing: "normal",
        margins: "normal",
        accentColor: "#4f46e5",
        sectionSpacing: "normal",
        paperSize: "a4",
      },
      atsScore: body.atsScore || 78,
      lastEdited: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    const saved = await db.saveResume(newResume, user.id);
    return NextResponse.json({ resume: saved }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to create resume" }, { status: 500 });
  }
}
