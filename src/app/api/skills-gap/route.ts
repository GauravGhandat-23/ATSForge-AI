import { NextResponse } from "next/server";
import { SkillsGapService } from "@/lib/ai-service";
import { db } from "@/lib/db";
export async function POST(request: Request) {
  try {
    const { resumeId, resumeData, jobDescription = "" } = await request.json();

    const targetResume =
      resumeData ||
      (resumeId ? await db.getResumeById(resumeId) : null);

    if (!targetResume) {
      return NextResponse.json({ error: "Resume is required. Please select or create a resume first." }, { status: 400 });
    }

    const gapItems = await SkillsGapService.analyzeGap(targetResume, jobDescription);

    const strongMatches = gapItems.filter((g) => g.status === "strong");
    const partialMatches = gapItems.filter((g) => g.status === "partial");
    const missingSkills = gapItems.filter((g) => g.status === "missing");

    return NextResponse.json({
      gapItems,
      strongMatches,
      partialMatches,
      missingSkills,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Skills gap analysis failed" }, { status: 500 });
  }
}
