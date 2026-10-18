import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized. Please sign in." }, { status: 401 });
  }

  const resume = await db.getResumeById(params.id, user.id);
  if (!resume) {
    return NextResponse.json(
      { error: "Resume not found or you do not have permission to view it" },
      { status: 404 }
    );
  }

  return NextResponse.json({ resume });
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized. Please sign in." }, { status: 401 });
  }

  const existing = await db.getResumeById(params.id, user.id);
  if (!existing) {
    return NextResponse.json(
      { error: "Resume not found or you do not have permission to edit it" },
      { status: 404 }
    );
  }

  try {
    const updates = await request.json();
    const updatedResume = {
      ...existing,
      ...updates,
      id: existing.id,
      userId: user.id, // Strictly preserve user ownership
      lastEdited: new Date().toISOString(),
    };

    const saved = await db.saveResume(updatedResume, user.id);
    return NextResponse.json({ resume: saved });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to update resume" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized. Please sign in." }, { status: 401 });
  }

  const success = await db.deleteResume(params.id, user.id);
  if (!success) {
    return NextResponse.json(
      { error: "Resume not found or you do not have permission to delete it" },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true });
}
