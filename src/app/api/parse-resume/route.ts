import { NextResponse } from "next/server";
import { ResumeData, SectionType, createEmptyResume } from "@/lib/types";
import { calculateATSScore } from "@/lib/ats-engine";
import { uploadResumeFile } from "@/lib/storage";

export async function POST(request: Request) {
  try {
    let rawText = "";
    let fileName = "Uploaded Document";
    let fileUrl: string | undefined;

    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file") as File | null;
      if (!file) {
        return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
      }

      fileName = file.name;
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Persist raw uploaded file to Vercel Blob storage (if configured)
      const stored = await uploadResumeFile(buffer, fileName, file.type || "application/octet-stream");
      if (stored) {
        fileUrl = stored.url;
      }

      const ext = (fileName.split(".").pop() || "").toLowerCase();

      if (ext === "pdf") {
        try {
          const pdfParse = require("pdf-parse");
          const pdfData = await pdfParse(buffer);
          rawText = pdfData.text || "";
        } catch (e: any) {
          console.error("PDF parse error:", e);
          return NextResponse.json({ error: "Unable to extract resume text from PDF." }, { status: 400 });
        }
      } else if (ext === "docx" || ext === "doc") {
        try {
          const mammoth = require("mammoth");
          const result = await mammoth.extractRawText({ buffer });
          rawText = result.value || "";
        } catch (e: any) {
          console.error("DOCX parse error:", e);
          return NextResponse.json({ error: "Unable to extract resume text from Word document." }, { status: 400 });
        }
      } else {
        // Plain text / markdown
        rawText = buffer.toString("utf-8");
      }
    } else {
      const body = await request.json().catch(() => ({}));
      rawText = body.rawText || "";
      fileName = body.fileName || "Pasted Resume Content";
    }

    if (!rawText || rawText.trim().length === 0) {
      return NextResponse.json({ error: "Unable to extract resume text." }, { status: 400 });
    }

    const lines = rawText
      .split(/\r?\n/)
      .map((l: string) => l.trim())
      .filter(Boolean);

    if (lines.length === 0) {
      return NextResponse.json({ error: "Unable to extract resume text." }, { status: 400 });
    }

    // Heuristics to extract candidate fields without fabricating anything
    const emailMatch = rawText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    const phoneMatch = rawText.match(/(\+?\d{1,3}[-.\s]?)?(\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}/);
    const linkedinMatch = rawText.match(/linkedin\.com\/in\/[a-zA-Z0-9-_]+/);
    const githubMatch = rawText.match(/github\.com\/[a-zA-Z0-9-_]+/);

    const firstLine = lines[0] ? lines[0].replace(/[|•,].*/, "").trim() : "";
    const fullName = firstLine.length < 40 && !/summary|experience|education|skills/i.test(firstLine) ? firstLine : "";
    const secondLine = lines[1] ? lines[1].replace(/[|•,].*/, "").trim() : "";
    const title = secondLine.length < 50 && !/summary|experience|education|skills/i.test(secondLine) ? secondLine : "";

    const textLower = rawText.toLowerCase();

    // Summary extraction: find summary heading and extract next 1-2 paragraphs
    let summary = "";
    const summaryMatch = rawText.match(/(?:summary|profile|about me|professional summary)[\s:]*\n([\s\S]*?)(?=\n[A-Z][A-Za-z\s]{3,25}(?:\n|:)|$)/i);
    if (summaryMatch && summaryMatch[1]) {
      summary = summaryMatch[1].trim().slice(0, 600);
    }

    // Skills extraction: only recognized keywords actually present in the user's text
    const SKILLS_VOCABULARY = [
      "JavaScript", "TypeScript", "Python", "Java", "C++", "C#", "Go", "Rust", "PHP",
      "React", "Next.js", "Node.js", "Express", "FastAPI", "Django", "Spring",
      "SQL", "PostgreSQL", "MySQL", "MongoDB", "Redis", "GraphQL", "REST APIs",
      "AWS", "GCP", "Azure", "Docker", "Kubernetes", "Linux", "Git", "CI/CD",
      "Terraform", "Kafka", "Tableau", "PowerBI", "Splunk", "Wireshark", "SIEM",
      "Cybersecurity", "Network Security", "Agile", "Scrum"
    ];

    const detectedSkills = SKILLS_VOCABULARY.filter((skill) =>
      new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(rawText)
    );

    const detectedSections: string[] = [];
    if (fullName || emailMatch) detectedSections.push("Personal Info");
    if (summary) detectedSections.push("Summary");
    if (detectedSkills.length > 0) detectedSections.push("Skills");
    if (/experience|employment|work history/i.test(textLower)) detectedSections.push("Experience");
    if (/education|degree|university|college/i.test(textLower)) detectedSections.push("Education");

    const baseResume = createEmptyResume();
    const parsedResume: ResumeData = {
      ...baseResume,
      title: fullName ? `${fullName}'s Resume` : "Imported Resume",
      targetRole: title || "",
      personalInfo: {
        fullName: fullName || "",
        title: title || "",
        email: emailMatch ? emailMatch[0] : "",
        phone: phoneMatch ? phoneMatch[0] : "",
        location: "",
        linkedin: linkedinMatch ? `https://${linkedinMatch[0]}` : "",
        github: githubMatch ? `https://${githubMatch[0]}` : "",
        portfolio: "",
      },
      summary: summary || "",
      experiences: [],
      education: [],
      skills: {
        technical: detectedSkills,
        soft: [],
        tools: [],
        languages: [],
      },
      projects: [],
      certifications: [],
      achievements: [],
      languages: [],
      volunteer: [],
      fileUrl,
    };

    return NextResponse.json({
      parsedResume,
      fileName,
      fileUrl,
      detectedSections,
      rawTextSnippet: rawText.slice(0, 300),
    });
  } catch (err: any) {
    console.error("Resume parsing error:", err);
    return NextResponse.json({ error: "Unable to extract resume text." }, { status: 500 });
  }
}
