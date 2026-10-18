import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const aiProvider = process.env.AI_PROVIDER || "gemini";
  const hasAiKey = !!process.env.AI_API_KEY;

  let dbStatus = "HEALTHY";
  try {
    await db.getResumes();
  } catch {
    dbStatus = "DEGRADED";
  }

  const isPostgres = !!(process.env.POSTGRES_URL || process.env.DATABASE_URL);

  const health = {
    status: "HEALTHY",
    timestamp: new Date().toISOString(),
    node: {
      version: process.version,
      platform: process.platform,
      arch: process.arch,
      uptimeSeconds: Math.floor(process.uptime()),
    },
    database: {
      status: dbStatus,
      type: isPostgres ? "Vercel Postgres (Serverless Neon)" : "Local Development Store",
    },
    aiProvider: {
      provider: aiProvider,
      status: hasAiKey ? "READY" : "STANDBY",
      model: process.env.AI_MODEL || "gemini-1.5-flash",
    },
    auth: {
      provider: "Google OAuth 2.0 / OpenID Connect",
      status: process.env.GOOGLE_CLIENT_ID ? "CONFIGURED" : "READY",
    },
  };

  return NextResponse.json(health);
}
