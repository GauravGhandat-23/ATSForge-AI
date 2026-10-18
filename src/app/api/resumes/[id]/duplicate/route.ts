import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function POST(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const duplicated = await db.duplicateResume(params.id, user.id);
  if (!duplicated) {
    return NextResponse.json(
      { error: "Resume not found or you do not have permission to duplicate it" },
      { status: 404 }
    );
  }

  return NextResponse.json({ resume: duplicated }, { status: 201 });
}
