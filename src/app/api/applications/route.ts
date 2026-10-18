import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { ApplicationStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized. Please sign in." }, { status: 401 });
    }

    const applications = await db.getApplications(user.id);
    return NextResponse.json({ applications });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch applications" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized. Please sign in." }, { status: 401 });
    }

    const body = await request.json();

    if (!body.company || !body.jobTitle) {
      return NextResponse.json(
        { error: "Company name and job title are required." },
        { status: 400 }
      );
    }

    const validStatuses: ApplicationStatus[] = [
      "Wishlist",
      "Applied",
      "Interviewing",
      "Offer",
      "Rejected",
    ];
    const status: ApplicationStatus = validStatuses.includes(body.status)
      ? body.status
      : "Applied";

    const saved = await db.saveApplication(
      {
        id: body.id,
        company: body.company,
        jobTitle: body.jobTitle,
        jobUrl: body.jobUrl || "",
        location: body.location || "",
        applicationDate: body.applicationDate || new Date().toISOString().split("T")[0],
        status,
        notes: body.notes || "",
        interviewDate: body.interviewDate || "",
        salary: body.salary || "",
        contact: body.contact || "",
        followUpDate: body.followUpDate || "",
      },
      user.id
    );

    return NextResponse.json(
      { success: true, application: saved, message: "Application tracked successfully." },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to save application" }, { status: 500 });
  }
}
