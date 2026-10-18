import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { CoverLetterService } from "@/lib/ai-service";
import { getCurrentUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized. Please sign in." }, { status: 401 });
  }

  const letters = await db.getCoverLetters(user.id);
  return NextResponse.json({ letters });
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    const {
      resumeId,
      resumeData,
      jobDescription,
      company,
      jobTitle,
      tone = "Professional",
      save = true,
    } = await request.json();

    if (!company || company.trim() === "") {
      return NextResponse.json({ error: "Company name is required. Please provide the company name." }, { status: 400 });
    }

    if (!jobTitle || jobTitle.trim() === "") {
      return NextResponse.json({ error: "Job title is required. Please provide the target job title." }, { status: 400 });
    }

    if (!jobDescription || jobDescription.trim() === "") {
      return NextResponse.json({ error: "Job description is required. Please provide the job description." }, { status: 400 });
    }

    const targetResume =
      resumeData ||
      (resumeId ? await db.getResumeById(resumeId, user?.id) : null);

    if (!targetResume) {
      return NextResponse.json({ error: "Resume is required. Please select or create a resume first." }, { status: 400 });
    }

    const content = await CoverLetterService.generate({
      resume: targetResume,
      jobDescription: jobDescription.trim(),
      company: company.trim(),
      jobTitle: jobTitle.trim(),
      tone,
    });

    let savedLetter = null;
    if (save && user) {
      savedLetter = await db.saveCoverLetter(
        {
          userId: user.id,
          resumeId: targetResume.id,
          jobTitle,
          company,
          tone,
          content,
        },
        user.id
      );
    }

    return NextResponse.json({
      content,
      letter: savedLetter,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Cover letter generation failed" }, { status: 500 });
  }
}
