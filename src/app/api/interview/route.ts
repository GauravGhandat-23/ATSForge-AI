import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { InterviewService } from "@/lib/ai-service";
import { getCurrentUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    const { mode = "generate", resumeId, resumeData, jobDescription = "", question = "", answer = "" } = await request.json();

    if (mode === "feedback") {
      if (!question || !answer) {
        return NextResponse.json({ error: "Question and answer are required for feedback" }, { status: 400 });
      }
      const feedback = await InterviewService.practiceFeedback(question, answer);
      return NextResponse.json({ feedback });
    }

    const targetResume =
      resumeData ||
      (resumeId ? await db.getResumeById(resumeId, user?.id) : null);

    if (!targetResume) {
      return NextResponse.json({ error: "Resume is required. Please select or create a resume first." }, { status: 400 });
    }

    const questions = await InterviewService.generateQuestions(targetResume, jobDescription);
    return NextResponse.json({ questions });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Interview preparation failed" }, { status: 500 });
  }
}
