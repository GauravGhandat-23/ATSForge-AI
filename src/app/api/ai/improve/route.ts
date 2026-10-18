import { NextResponse } from "next/server";
import { ResumeImprovementService } from "@/lib/ai-service";

export async function POST(request: Request) {
  try {
    const { text, operation = "improve", context } = await request.json();
    if (!text || text.trim() === "") {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    const improved = await ResumeImprovementService.improveText(text, operation, context);

    return NextResponse.json({
      original: text,
      improved,
      operation,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Improvement failed" }, { status: 500 });
  }
}
