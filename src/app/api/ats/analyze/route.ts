import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ATSAnalysisService } from "@/lib/ai-service";
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
      return NextResponse.json(
        { error: "No resume provided or found. Please create or upload a resume first." },
        { status: 400 }
      );
    }

    if (!jobDescription || jobDescription.trim().length < 10) {
      return NextResponse.json(
        { error: "A valid job description (at least 10 characters) is required for ATS analysis." },
        { status: 400 }
      );
    }

    const result = ATSAnalysisService.analyze(targetResume, jobDescription.trim());

    // Persist real scan history isolated to the authenticated user
    const savedScan = await db.saveAtsScan(
      targetResume.targetRole || "Target Role",
      result.overallScore,
      result,
      targetResume.id,
      user?.id
    );

    // Update resume atsScore if resume exists and is user-owned
    if (targetResume.id) {
      targetResume.atsScore = result.overallScore;
      if (user) {
        targetResume.userId = user.id;
      }
      await db.saveResume(targetResume, user?.id);
    }

    return NextResponse.json({ result, scan: savedScan });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "ATS analysis failed" }, { status: 500 });
  }
}
