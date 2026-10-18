import { ATSAnalysisResult, ATSIssue, KeywordAnalysis, ResumeData } from "./types";

// Common stop words to exclude from keyword extraction
const STOP_WORDS = new Set([
  "a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are", "aren't",
  "as", "at", "be", "because", "been", "before", "being", "below", "between", "both", "but", "by", "can",
  "cannot", "could", "did", "do", "does", "doing", "don't", "down", "during", "each", "few", "for", "from",
  "further", "had", "has", "have", "having", "he", "her", "here", "hers", "herself", "him", "himself",
  "his", "how", "i", "if", "in", "into", "is", "isn't", "it", "its", "itself", "let's", "me", "more",
  "most", "mustn't", "my", "myself", "no", "nor", "not", "of", "off", "on", "once", "only", "or", "other",
  "ought", "our", "ours", "ourselves", "out", "over", "own", "same", "she", "should", "so", "some", "such",
  "than", "that", "the", "their", "theirs", "them", "themselves", "then", "there", "these", "they", "this",
  "those", "through", "to", "too", "under", "until", "up", "very", "was", "we", "were", "what", "when",
  "where", "which", "while", "who", "whom", "why", "with", "would", "you", "your", "yours", "yourself",
  "responsibilities", "requirements", "candidate", "role", "team", "work", "experience", "looking", "plus",
  "ideal", "position", "ability", "strong", "understanding", "knowledge", "working", "preferred"
]);

// Strong ATS action verbs
const ACTION_VERBS = [
  "architected", "implemented", "developed", "spearheaded", "engineered", "optimized",
  "orchestrated", "designed", "deployed", "streamlined", "automated", "delivered",
  "led", "managed", "scaled", "reduced", "increased", "accelerated", "integrated",
  "configured", "analyzed", "built", "collaborated", "mentored", "championed",
  "resolved", "secured", "migrated", "refactored", "monitored", "established"
];

// Technical & domain skill ontology for rich matching
const KNOWN_SKILLS_DB = [
  "react", "typescript", "javascript", "python", "node.js", "next.js", "docker", "kubernetes",
  "aws", "azure", "gcp", "sql", "postgresql", "mongodb", "graphql", "rest api", "ci/cd",
  "git", "linux", "agile", "scrum", "microservices", "redis", "kafka", "terraform",
  "cybersecurity", "siem", "soc", "incident response", "wireshark", "penetration testing",
  "firewalls", "tcp/ip", "dns", "splunk", "sentinel", "crowdstrike", "network security",
  "threat intelligence", "nist", "iso 27001", "vulnerability assessment", "cissp", "ceh",
  "machine learning", "tensorflow", "pytorch", "pandas", "numpy", "power bi", "tableau",
  "data modeling", "etl", "bigquery", "snowflake", "spark", "hadoop", "excel"
];

/**
 * Extracts normalized tokens and phrases from text
 */
function extractPhrases(text: string): string[] {
  const clean = text.toLowerCase().replace(/[^a-z0-9#+.\s-]/g, " ");
  const words = clean.split(/\s+/).filter((w) => w.length > 1 && !STOP_WORDS.has(w));
  return words;
}

/**
 * Extracts keywords with frequency & recognized skills from job description
 */
export function extractJobKeywords(jobDescription: string): { keyword: string; count: number; category: "hard_skill" | "soft_skill" | "tool" | "credential" | "other" }[] {
  const lowerJd = jobDescription.toLowerCase();
  const keywordMap = new Map<string, number>();

  // 1. Scan for known multi-word & single-word technical skills
  for (const skill of KNOWN_SKILLS_DB) {
    const regex = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "gi");
    const matches = lowerJd.match(regex);
    if (matches && matches.length > 0) {
      keywordMap.set(skill, (keywordMap.get(skill) || 0) + matches.length * 2);
    }
  }

  // 2. Scan individual words and bigrams
  const words = extractPhrases(jobDescription);
  for (const word of words) {
    if (word.length >= 3 && !STOP_WORDS.has(word)) {
      keywordMap.set(word, (keywordMap.get(word) || 0) + 1);
    }
  }

  // Sort by frequency descending and format
  const sorted = Array.from(keywordMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 30);

  return sorted.map(([keyword, count]) => {
    let category: "hard_skill" | "soft_skill" | "tool" | "credential" | "other" = "other";
    if (KNOWN_SKILLS_DB.includes(keyword)) {
      category = "hard_skill";
    } else if (["agile", "leadership", "communication", "problem solving", "collaboration", "adaptability"].includes(keyword)) {
      category = "soft_skill";
    } else if (["git", "docker", "splunk", "jira", "figma", "tableau", "wireshark", "terraform"].includes(keyword)) {
      category = "tool";
    }
    return { keyword, count, category };
  });
}

/**
 * Aggregates all searchable resume text
 */
function compileResumeText(resume: ResumeData): string {
  const parts: string[] = [
    resume.title || "",
    resume.targetRole || "",
    resume.personalInfo.fullName || "",
    resume.personalInfo.title || "",
    resume.personalInfo.location || "",
    resume.summary || "",
  ];

  // Skills
  parts.push(...(resume.skills.technical || []));
  parts.push(...(resume.skills.soft || []));
  parts.push(...(resume.skills.tools || []));
  parts.push(...(resume.skills.languages || []));

  // Experiences
  for (const exp of resume.experiences || []) {
    parts.push(exp.jobTitle || "");
    parts.push(exp.company || "");
    parts.push(...(exp.bullets || []));
  }

  // Education
  for (const edu of resume.education || []) {
    parts.push(edu.institution || "");
    parts.push(edu.degree || "");
    parts.push(edu.field || "");
  }

  // Projects
  for (const proj of resume.projects || []) {
    parts.push(proj.name || "");
    parts.push(proj.description || "");
    parts.push(...(proj.technologies || []));
  }

  // Certifications
  for (const cert of resume.certifications || []) {
    parts.push(cert.name || "");
    parts.push(cert.issuer || "");
  }

  return parts.join(" ").toLowerCase();
}

/**
 * Deterministic 8-factor ATS scoring engine
 */
export function calculateATSScore(resume: ResumeData, jobDescription: string): ATSAnalysisResult {
  const resumeText = compileResumeText(resume);
  const jdKeywords = extractJobKeywords(jobDescription);

  // 1. KEYWORD MATCH (30%)
  const matchedKeywords: string[] = [];
  const missingKeywords: string[] = [];
  const keywordAnalysisList: KeywordAnalysis[] = [];

  for (const kw of jdKeywords) {
    const isPresent = resumeText.includes(kw.keyword.toLowerCase());
    if (isPresent) {
      matchedKeywords.push(kw.keyword);
    } else {
      missingKeywords.push(kw.keyword);
    }

    keywordAnalysisList.push({
      keyword: kw.keyword,
      frequencyInJob: kw.count,
      presentInResume: isPresent,
      importance: kw.count > 3 ? "high" : kw.count > 1 ? "medium" : "low",
      category: kw.category,
    });
  }

  const keywordMatchRatio = jdKeywords.length > 0 ? matchedKeywords.length / jdKeywords.length : 0.8;
  const keywordMatchScore = Math.min(100, Math.round(keywordMatchRatio * 100));

  // 2. SKILLS MATCH (20%)
  const allResumeSkills = [
    ...(resume.skills.technical || []),
    ...(resume.skills.tools || []),
    ...(resume.skills.soft || []),
  ].map((s) => s.toLowerCase());

  const jdSkills = jdKeywords.filter((k) => k.category === "hard_skill" || k.category === "tool");
  let matchedSkillsCount = 0;
  if (jdSkills.length > 0) {
    for (const s of jdSkills) {
      if (allResumeSkills.some((rs) => rs.includes(s.keyword) || s.keyword.includes(rs))) {
        matchedSkillsCount++;
      }
    }
  }
  const skillsMatchScore = jdSkills.length > 0
    ? Math.min(100, Math.round((matchedSkillsCount / jdSkills.length) * 100))
    : allResumeSkills.length >= 8 ? 90 : 70;

  // 3. JOB TITLE MATCH (10%)
  const targetRoleLower = (resume.targetRole || resume.personalInfo.title || "").toLowerCase();
  const jdFirst200 = jobDescription.slice(0, 300).toLowerCase();
  let jobTitleMatchScore = 50;
  if (targetRoleLower.length > 3) {
    if (jdFirst200.includes(targetRoleLower)) {
      jobTitleMatchScore = 100;
    } else {
      // Check partial word overlap
      const roleWords = targetRoleLower.split(/\s+/).filter((w) => w.length > 2);
      const matchedWords = roleWords.filter((w) => jdFirst200.includes(w));
      jobTitleMatchScore = roleWords.length > 0 ? Math.round((matchedWords.length / roleWords.length) * 90) : 50;
    }
  }

  // 4. EXPERIENCE RELEVANCE (15%)
  let experienceScore = 70;
  const totalBullets = (resume.experiences || []).reduce((acc, e) => acc + (e.bullets?.length || 0), 0);
  if (resume.experiences?.length >= 2 && totalBullets >= 5) {
    experienceScore = 90;
  } else if (resume.experiences?.length >= 1 && totalBullets >= 3) {
    experienceScore = 80;
  } else if (resume.experiences?.length === 0) {
    experienceScore = 40;
  }

  // 5. FORMATTING (10%)
  let formattingScore = 85;
  if (!resume.summary || resume.summary.length < 50) formattingScore -= 10;
  if (resume.experiences.length === 0) formattingScore -= 15;
  if (resume.education.length === 0) formattingScore -= 10;
  if (allResumeSkills.length < 5) formattingScore -= 10;
  formattingScore = Math.max(30, formattingScore);

  // 6. EDUCATION (5%)
  let educationScore = 50;
  if (resume.education && resume.education.length > 0) {
    const hasDegree = resume.education.some((e) => e.degree && e.institution);
    educationScore = hasDegree ? 95 : 75;
  }

  // 7. CONTACT INFORMATION (5%)
  let contactInfoScore = 0;
  if (resume.personalInfo.fullName) contactInfoScore += 25;
  if (resume.personalInfo.email && resume.personalInfo.email.includes("@")) contactInfoScore += 25;
  if (resume.personalInfo.phone) contactInfoScore += 20;
  if (resume.personalInfo.location) contactInfoScore += 15;
  if (resume.personalInfo.linkedin || resume.personalInfo.github) contactInfoScore += 15;
  contactInfoScore = Math.min(100, contactInfoScore);

  // 8. ACTION / IMPACT LANGUAGE (5%)
  let actionVerbCount = 0;
  let quantifiedMetricsCount = 0;
  const metricRegex = /\b(\d+[%kKmMbB]?|\$\d+|\d+\+|\d+x)\b/g;

  const allBullets = (resume.experiences || []).flatMap((e) => e.bullets || []);
  for (const bullet of allBullets) {
    const lower = bullet.toLowerCase().trim();
    if (ACTION_VERBS.some((verb) => lower.startsWith(verb) || lower.includes(` ${verb} `))) {
      actionVerbCount++;
    }
    const matches = bullet.match(metricRegex);
    if (matches && matches.length > 0) {
      quantifiedMetricsCount += matches.length;
    }
  }

  let actionImpactLanguageScore = 50;
  if (actionVerbCount >= 4 && quantifiedMetricsCount >= 3) {
    actionImpactLanguageScore = 95;
  } else if (actionVerbCount >= 2 || quantifiedMetricsCount >= 2) {
    actionImpactLanguageScore = 75;
  } else {
    actionImpactLanguageScore = 45;
  }

  // Compute weighted overall score
  const overallScore = Math.round(
    keywordMatchScore * 0.30 +
    skillsMatchScore * 0.20 +
    jobTitleMatchScore * 0.10 +
    experienceScore * 0.15 +
    formattingScore * 0.10 +
    educationScore * 0.05 +
    contactInfoScore * 0.05 +
    actionImpactLanguageScore * 0.05
  );

  // GENERATE ISSUES & RECOMMENDATIONS
  const issues: ATSIssue[] = [];

  // Critical issues
  if (jobTitleMatchScore < 60) {
    issues.push({
      id: "crit-job-title",
      type: "critical",
      category: "Job Title Match",
      problem: `Resume target title "${resume.targetRole || "Not specified"}" does not closely match the Job Description.`,
      whyItMatters: "ATS systems screen resumes by matching the exact job title in your headline and header. A mismatch causes immediate filtering.",
      howToFix: "Update your target role and resume header title to match the exact title from the job post.",
      fixAction: { field: "targetRole" },
    });
  }

  if (missingKeywords.slice(0, 5).length > 2) {
    issues.push({
      id: "crit-missing-keywords",
      type: "critical",
      category: "Keywords",
      problem: `Missing high-priority keywords: ${missingKeywords.slice(0, 4).join(", ")}.`,
      whyItMatters: "Recruiter ATS scans calculate keyword density against job descriptions. Missing key technical terms drops your ranking.",
      howToFix: "Naturally incorporate these keywords into your professional summary, skills section, and experience bullets.",
      fixAction: { field: "skills" },
    });
  }

  if (contactInfoScore < 70) {
    issues.push({
      id: "crit-contact-info",
      type: "critical",
      category: "Contact Info",
      problem: "Incomplete contact information (missing phone, location, or professional link).",
      whyItMatters: "Recruiters and automated sourcing bots require valid email, phone, and location to route your application.",
      howToFix: "Ensure your email, phone number, city/state, and LinkedIn profile are filled out.",
      fixAction: { field: "personalInfo" },
    });
  }

  // Warnings
  if (quantifiedMetricsCount < 3) {
    issues.push({
      id: "warn-metrics",
      type: "warning",
      category: "Impact Language",
      problem: `Only ${quantifiedMetricsCount} quantified achievement(s) detected in your experience bullets.`,
      whyItMatters: "Hiring managers look for evidence of impact (e.g., 'reduced latency by 35%', 'managed $50k budget').",
      howToFix: "Add percentages, dollars saved, users impacted, or time cut into your bullet points.",
      fixAction: { field: "experience" },
    });
  }

  if (actionVerbCount < totalBullets * 0.6) {
    issues.push({
      id: "warn-action-verbs",
      type: "warning",
      category: "Action Verbs",
      problem: "Several experience bullets do not begin with strong action verbs.",
      whyItMatters: "Passive voice (e.g., 'Responsible for...') reduces executive presence and ATS readability.",
      howToFix: "Start each bullet with powerful past-tense action verbs like 'Architected', 'Spearheaded', 'Optimized'.",
      fixAction: { field: "experience" },
    });
  }

  if (!resume.summary || resume.summary.length < 120) {
    issues.push({
      id: "warn-summary",
      type: "warning",
      category: "Summary",
      problem: "Professional summary is either missing or too brief.",
      whyItMatters: "A 3-4 line summary sets context for recruiters and provides an ideal location for high-value target keywords.",
      howToFix: "Draft a concise 3-4 sentence summary highlighting your core expertise and value proposition.",
      fixAction: { field: "summary" },
    });
  }

  // Suggestions
  if (!resume.personalInfo.linkedin && !resume.personalInfo.github) {
    issues.push({
      id: "sug-links",
      type: "suggestion",
      category: "Online Presence",
      problem: "No LinkedIn or GitHub portfolio links provided.",
      whyItMatters: "Over 85% of technical recruiters cross-reference LinkedIn or GitHub repositories before scheduling screening calls.",
      howToFix: "Add your customized LinkedIn URL and/or GitHub link in the personal info section.",
      fixAction: { field: "personalInfo" },
    });
  }

  if (resume.certifications.length === 0) {
    issues.push({
      id: "sug-certs",
      type: "suggestion",
      category: "Certifications",
      problem: "No industry certifications or credentials listed.",
      whyItMatters: "Certifications provide verified third-party validation of skills (AWS, Security+, PMP, etc.).",
      howToFix: "Include any relevant licenses, certifications, or course completions.",
      fixAction: { field: "certifications" },
    });
  }

  const wordCount = resumeText.split(/\s+/).filter(Boolean).length;

  return {
    overallScore,
    breakdown: {
      keywordMatch: keywordMatchScore,
      skillsMatch: skillsMatchScore,
      jobTitleMatch: jobTitleMatchScore,
      experienceRelevance: experienceScore,
      formatting: formattingScore,
      education: educationScore,
      contactInfo: contactInfoScore,
      actionImpactLanguage: actionImpactLanguageScore,
    },
    metrics: {
      wordCount,
      bulletCount: totalBullets,
      quantifiedMetricsCount,
      actionVerbCount,
      readingTimeMinutes: Math.max(1, Math.round(wordCount / 200)),
    },
    issues,
    keywords: keywordAnalysisList,
    matchedKeywords,
    missingKeywords,
    summaryFeedback: `Resume matches ${overallScore}% of key criteria for ${resume.targetRole || "the target role"}. ${
      overallScore >= 85
        ? "Excellent ATS compatibility! Your resume is ready for submissions."
        : overallScore >= 70
        ? "Good baseline, but incorporating missing keywords and quantified metrics will elevate you into the top 10% of applicants."
        : "Several critical ATS gaps need attention before submitting to ensure you pass automated screening filters."
    }`,
  };
}
