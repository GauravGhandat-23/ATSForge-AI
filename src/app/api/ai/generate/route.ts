import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ResumeGenerationService } from "@/lib/ai-service";
import { ResumeData } from "@/lib/types";
import { getCurrentUser } from "@/lib/session";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    const input = await request.json();

    const generated = await ResumeGenerationService.generateResumeFromWizard(input);

    // Construct full resume object
    const newResume: ResumeData = {
      id: `res-${Date.now()}`,
      userId: user?.id,
      title: `${input.targetJob || "Target Role"} Resume`,
      targetRole: input.targetJob || "Software Engineer",
      targetCompany: "",
      personalInfo: {
        fullName: input.fullName || "Candidate",
        title: input.targetJob || "Software Engineer",
        email: "candidate@example.com",
        phone: "+1 (555) 019-2834",
        location: "United States (Open to Remote)",
        linkedin: "https://linkedin.com/in/profile",
        github: "https://github.com/profile",
        portfolio: "",
      },
      summary: generated.summary || "",
      experiences: [
        {
          id: `exp-${Date.now()}-1`,
          company: "Enterprise Technology Corp",
          jobTitle: input.targetJob || "Senior Engineer",
          location: "Remote / Hybrid",
          startDate: "2022-01",
          endDate: "Present",
          current: true,
          bullets: [
            `Spearheaded critical engineering initiatives for ${input.targetJob || "core architecture"}, delivering 30% performance efficiency.`,
            `Collaborated with cross-functional product and technical stakeholders to architect robust, scalable solutions.`,
            `Mentored team members on modern industry standards and automated testing workflows.`
          ],
        },
      ],
      education: [
        {
          id: `edu-${Date.now()}-1`,
          institution: input.education || "State University of Technology",
          degree: "Bachelor of Science",
          field: "Computer Science or Related Field",
          startDate: "2018-09",
          endDate: "2022-05",
          gpa: "3.8 / 4.0",
        },
      ],
      skills: generated.skills || {
        technical: ["System Design", "Cloud Computing", "REST APIs", "TypeScript", "PostgreSQL"],
        soft: ["Analytical Thinking", "Cross-Functional Collaboration", "Problem Solving"],
        tools: ["Git", "Docker", "VS Code"],
        languages: ["English (Professional)"],
      },
      projects: [
        {
          id: `proj-${Date.now()}-1`,
          name: input.projects ? input.projects.slice(0, 30) : "High-Performance Cloud Service",
          description: input.projects || "Scalable open-source utility designed for distributed systems and high throughput.",
          technologies: ["TypeScript", "Docker", "REST API"],
          projectUrl: "https://github.com",
          githubUrl: "https://github.com",
          bullets: [
            "Engineered modular architecture supporting automated end-to-end testing and CI/CD deployment."
          ]
        },
      ],
      certifications: [],
      achievements: [],
      languages: [{ id: "lang-1", name: "English", proficiency: "Professional" }],
      volunteer: [],
      sectionOrder: ["personal", "summary", "experience", "education", "skills", "projects", "certifications", "achievements", "languages"],
      hiddenSections: [],
      templateId: "modern",
      templateConfig: {
        fontFamily: "Inter",
        fontSize: "base",
        lineSpacing: "normal",
        margins: "normal",
        accentColor: "#4f46e5",
        sectionSpacing: "normal",
        paperSize: "a4",
      },
      atsScore: 88,
      lastEdited: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    const saved = await db.saveResume(newResume, user?.id);
    return NextResponse.json({ resume: saved });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Resume generation failed" }, { status: 500 });
  }
}
