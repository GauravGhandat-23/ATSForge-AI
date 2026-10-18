import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser();
  const versions = await db.getVersions(params.id, user?.id);
  return NextResponse.json({ versions });
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser();
  const resume = await db.getResumeById(params.id, user?.id);
  if (!resume) {
    return NextResponse.json({ error: "Resume not found" }, { status: 404 });
  }

  try {
    const { label } = await request.json();
    const version = await db.saveVersion(
      resume.id,
      label,
      resume.targetRole,
      resume.atsScore || 80,
      resume,
      user?.id
    );
    return NextResponse.json({ version });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to create version" }, { status: 500 });
  }
}
