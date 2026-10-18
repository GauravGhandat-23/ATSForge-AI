import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { calculateATSScore } from "@/lib/ats-engine";
import { getCurrentUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    const { resumeId, resumeData, jobDescription = "" } = await request.json();

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
    const atsMatch = ats.overallScore;
    const jobMatch = atsMatch;

    return NextResponse.json({
      atsMatch,
      jobMatch,
      matchedKeywords: ats.matchedKeywords,
      missingKeywords: ats.missingKeywords,
      breakdown: ats.breakdown,
      feedback: ats.summaryFeedback,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Job match failed" }, { status: 500 });
  }
}
