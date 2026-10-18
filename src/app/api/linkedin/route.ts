import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { LinkedInService } from "@/lib/ai-service";
export async function POST(request: Request) {
  try {
    const { resumeId, resumeData } = await request.json();
    const targetResume =
      resumeData ||
      (resumeId ? await db.getResumeById(resumeId) : null);

    if (!targetResume) {
      return NextResponse.json({ error: "Resume is required. Please select or create a resume first." }, { status: 400 });
    }

    const profile = await LinkedInService.generateProfile(targetResume);
    return NextResponse.json({ profile });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to generate LinkedIn profile" }, { status: 500 });
  }
}
