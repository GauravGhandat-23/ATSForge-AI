import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { db } from "@/lib/db";
import { UserRecord } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { authenticated: false, user: null },
        { status: 200 }
      );
    }

    return NextResponse.json({
      authenticated: true,
      user,
    });
  } catch (err: any) {
    return NextResponse.json(
      { authenticated: false, error: err.message || "Failed to verify session" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized. Please sign in." }, { status: 401 });
    }

    const body = await request.json();
    const updates: Partial<UserRecord> = {};

    if (typeof body.name === "string" && body.name.trim()) {
      updates.name = body.name.trim();
    }
    if (typeof body.first_name === "string") {
      updates.first_name = body.first_name.trim();
    }
    if (typeof body.last_name === "string") {
      updates.last_name = body.last_name.trim();
    }
    if (body.settings && typeof body.settings === "object") {
      updates.settings = {
        ...(user.settings || {}),
        ...body.settings,
      };
    }

    const updatedUser = await db.updateUser(user.id, updates);
    return NextResponse.json({ success: true, user: updatedUser });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to update profile settings" },
      { status: 500 }
    );
  }
}
