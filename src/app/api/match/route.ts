import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { calculateATSScore } from "@/lib/ats-engine";
import { getCurrentUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    const { resumeId, resumeData, jobDescription } = await request.json();

    const targetResume =
      resumeData ||
      (resumeId ? await db.getResumeById(resumeId, user?.id) : null);

    if (!targetResume) {
      return NextResponse.json({ error: "Resume is required. Please select or create a resume first." }, { status: 400 });
    }

    if (!jobDescription || jobDescription.trim().length === 0) {
      return NextResponse.json({ error: "Job description is required" }, { status: 400 });
    }

    const ats = calculateATSScore(targetResume, jobDescription);
    const overallMatch = ats.overallScore;

    let matchTier: "Strong Match" | "Potential Match" | "Weak Match" = "Weak Match";
    if (overallMatch >= 80) matchTier = "Strong Match";
    else if (overallMatch >= 60) matchTier = "Potential Match";

    return NextResponse.json({
      matchTier,
      overallMatch,
      skillsMatch: ats.breakdown.skillsMatch,
      experienceMatch: ats.breakdown.experienceRelevance,
      keywordMatch: ats.breakdown.keywordMatch,
      educationMatch: ats.breakdown.education,
      jobTitleMatch: ats.breakdown.jobTitleMatch,
      matchedKeywords: ats.matchedKeywords,
      missingKeywords: ats.missingKeywords,
      feedback: ats.summaryFeedback,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Match calculation failed" }, { status: 500 });
  }
}
