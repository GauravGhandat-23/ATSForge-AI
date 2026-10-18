import { NextResponse } from "next/server";
import { extractJobKeywords } from "@/lib/ats-engine";

export async function POST(request: Request) {
  try {
    const { jobDescription = "" } = await request.json();

    if (!jobDescription || jobDescription.trim().length === 0) {
      return NextResponse.json({ error: "Job description is required" }, { status: 400 });
    }

    const lines = jobDescription.split("\n").map((l: string) => l.trim()).filter(Boolean);

    // Heuristic extraction
    let jobTitle = "Software Professional";
    let company = "Target Employer";
    let location = "Remote / Hybrid";
    let experience = "2-5 years";

    const titleMatch = jobDescription.match(/(?:title|role|position)[:\s]+([^\n]+)/i);
    if (titleMatch) {
      jobTitle = titleMatch[1].trim();
    } else if (lines[0] && lines[0].length < 60) {
      jobTitle = lines[0];
    }

    const companyMatch = jobDescription.match(/(?:company|employer|at)[:\s]+([^\n]+)/i);
    if (companyMatch) company = companyMatch[1].trim();

    const locationMatch = jobDescription.match(/(?:location|city|country)[:\s]+([^\n]+)/i);
    if (locationMatch) location = locationMatch[1].trim();

    const expMatch = jobDescription.match(/(\d+\+?\s*(?:to|-)?\s*\d*\s*years?(?:\s*of)?\s*experience)/i);
    if (expMatch) experience = expMatch[1];

    const extracted = extractJobKeywords(jobDescription);
    const keywords = extracted.map((k) => k.keyword);

    // Differentiate required vs preferred
    const requiredSkills = keywords.slice(0, Math.ceil(keywords.length * 0.6));
    const preferredSkills = keywords.slice(Math.ceil(keywords.length * 0.6));
    const technologies = keywords.filter((k) =>
      ["React", "Node", "TypeScript", "Python", "Docker", "AWS", "SQL", "PostgreSQL", "Kubernetes", "Next", "FastAPI", "MongoDB"].some((t) =>
        k.toLowerCase().includes(t.toLowerCase())
      )
    );

    const responsibilities = lines
      .filter((l: string) => l.startsWith("-") || l.startsWith("•") || l.match(/^\d+\./))
      .map((l: string) => l.replace(/^[-•\d.]\s*/, "").trim())
      .slice(0, 6);

    return NextResponse.json({
      jobTitle,
      company,
      location,
      experience,
      requiredSkills,
      preferredSkills,
      technologies: technologies.length ? technologies : requiredSkills.slice(0, 5),
      responsibilities: responsibilities.length
        ? responsibilities
        : [
            "Build scalable features and robust APIs.",
            "Collaborate with agile cross-functional product squads.",
            "Write comprehensive tests and maintain code quality.",
          ],
      keywords,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to analyze job" }, { status: 500 });
  }
}
