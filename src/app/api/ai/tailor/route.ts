import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ResumeTailoringService } from "@/lib/ai-service";
import { getCurrentUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    const { resumeId, resumeData, jobDescription } = await request.json();
    if (!jobDescription || jobDescription.trim() === "") {
      return NextResponse.json({ error: "Job description is required" }, { status: 400 });
    }

    const sourceResume =
      resumeData ||
      (resumeId ? await db.getResumeById(resumeId, user?.id) : null);

    if (!sourceResume) {
      return NextResponse.json({ error: "Valid resume is required. Please create or upload a resume first." }, { status: 400 });
    }

    const tailoredResult = await ResumeTailoringService.tailorResume(sourceResume, jobDescription);

    return NextResponse.json(tailoredResult);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Tailoring failed" }, { status: 500 });
  }
}
