import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, SESSION_COOKIE_NAME } from "@/lib/session";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { confirmation } = await request.json().catch(() => ({ confirmation: "" }));

    if (confirmation !== "DELETE") {
      return NextResponse.json(
        { error: "Confirmation text must be 'DELETE' to confirm account deletion" },
        { status: 400 }
      );
    }

    // 1. Permanently delete all user-owned data in database
    const success = await db.deleteAccount(user.id);

    if (!success) {
      return NextResponse.json({ error: "Account could not be found" }, { status: 404 });
    }

    // 2. Invalidate session cookie
    const response = NextResponse.json({
      success: true,
      message: "Account and all associated documents deleted successfully",
    });

    response.cookies.delete(SESSION_COOKIE_NAME);
    response.cookies.set(SESSION_COOKIE_NAME, "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });

    return response;
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to delete account" },
      { status: 500 }
    );
  }
}
