import { NextResponse } from "next/server";
import { db } from "@/lib/db";
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (id) {
    const resume = await db.getResumeById(id);
    if (!resume) return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    return NextResponse.json({ resume });
  }
  const resumes = await db.getResumes();
  return NextResponse.json({ resume: resumes[0] || null });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const saved = await db.saveResume(body);
    return NextResponse.json({ resume: saved }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const existing = await db.getResumeById(body.id);
    if (!existing) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }
    const updated = await db.saveResume({ ...existing, ...body, lastEdited: new Date().toISOString() });
    return NextResponse.json({ resume: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id parameter required" }, { status: 400 });
  const success = await db.deleteResume(id);
  return NextResponse.json({ success });
}
