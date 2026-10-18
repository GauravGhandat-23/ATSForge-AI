export interface PersonalInfo {
  fullName: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github: string;
  portfolio: string;
}

export interface ExperienceItem {
  id: string;
  company: string;
  jobTitle: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  bullets: string[];
}

export interface EducationItem {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  gpa: string;
}

export interface SkillsData {
  technical: string[];
  soft: string[];
  tools: string[];
  languages: string[];
}

export interface ProjectItem {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  projectUrl: string;
  githubUrl: string;
  bullets?: string[];
}

export interface CertificationItem {
  id: string;
  name: string;
  issuer: string;
  date: string;
  credentialUrl: string;
}

export interface AchievementItem {
  id: string;
  title: string;
  issuer?: string;
  date: string;
  description: string;
}

export interface LanguageItem {
  id: string;
  name: string;
  proficiency: "Native" | "Fluent" | "Professional" | "Conversational" | "Basic";
}

export interface VolunteerItem {
  id: string;
  organization: string;
  role: string;
  startDate: string;
  endDate: string;
  description: string;
}

export type SectionType =
  | "personal"
  | "summary"
  | "experience"
  | "education"
  | "skills"
  | "projects"
  | "certifications"
  | "achievements"
  | "languages"
  | "volunteer";

export interface SectionMeta {
  id: SectionType;
  title: string;
  visible: boolean;
  order: number;
}

export type TemplateId =
  | "ats-classic"
  | "modern"
  | "minimal"
  | "professional"
  | "technical"
  | "executive"
  | "student"
  | "fresher"
  | "two-column"
  | "corporate"
  | "simple";

export interface TemplateConfig {
  fontFamily: "Inter" | "Roboto" | "Geist" | "Merriweather" | "Lora" | "JetBrains Mono";
  fontSize: "sm" | "base" | "lg";
  lineSpacing: "tight" | "normal" | "relaxed";
  margins: "compact" | "normal" | "spacious";
  accentColor: string;
  sectionSpacing: "compact" | "normal" | "spacious";
  paperSize: "a4" | "letter";
}

export interface UserRecord {
  id: string;
  google_id: string;
  email: string;
  name: string;
  first_name: string;
  last_name: string;
  avatar_url: string;
  email_verified: boolean;
  created_at: string;
  updated_at: string;
  last_login_at: string;
}

export interface ResumeData {
  id: string;
  userId?: string;
  title: string;
  targetRole: string;
  targetCompany?: string;
  personalInfo: PersonalInfo;
  summary: string;
  experiences: ExperienceItem[];
  education: EducationItem[];
  skills: SkillsData;
  projects: ProjectItem[];
  certifications: CertificationItem[];
  achievements: AchievementItem[];
  languages: LanguageItem[];
  volunteer: VolunteerItem[];
  sectionOrder: SectionType[];
  hiddenSections: SectionType[];
  templateId: TemplateId;
  templateConfig: TemplateConfig;
  atsScore?: number;
  fileUrl?: string;
  lastEdited: string;
  createdAt: string;
}

export function createEmptyResume(id?: string): ResumeData {
  return {
    id: id || `res-${Date.now()}`,
    title: "",
    targetRole: "",
    targetCompany: "",
    personalInfo: {
      fullName: "",
      title: "",
      email: "",
      phone: "",
      location: "",
      linkedin: "",
      github: "",
      portfolio: "",
    },
    summary: "",
    experiences: [],
    education: [],
    skills: {
      technical: [],
      soft: [],
      tools: [],
      languages: [],
    },
    projects: [],
    certifications: [],
    achievements: [],
    languages: [],
    volunteer: [],
    sectionOrder: [
      "personal",
      "summary",
      "experience",
      "education",
      "skills",
      "projects",
      "certifications",
      "achievements",
    ],
    hiddenSections: [],
    templateId: "ats-classic",
    templateConfig: {
      fontFamily: "Inter",
      fontSize: "base",
      lineSpacing: "normal",
      margins: "normal",
      accentColor: "#2563eb",
      sectionSpacing: "normal",
      paperSize: "a4",
    },
    lastEdited: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };
}

export interface ResumeVersion {
  id: string;
  resumeId: string;
  versionNumber: number;
  label: string;
  targetRole: string;
  atsScore: number;
  snapshot: ResumeData;
  createdAt: string;
}

export interface ATSIssue {
  id: string;
  type: "critical" | "warning" | "suggestion";
  category: string;
  problem: string;
  whyItMatters: string;
  howToFix: string;
  fixAction?: {
    field: string;
    suggestedText?: string;
  };
}

export interface KeywordAnalysis {
  keyword: string;
  frequencyInJob: number;
  presentInResume: boolean;
  importance: "high" | "medium" | "low";
  category: "hard_skill" | "soft_skill" | "tool" | "credential" | "other";
}

export interface ATSAnalysisResult {
  overallScore: number;
  breakdown: {
    keywordMatch: number;
    skillsMatch: number;
    jobTitleMatch: number;
    experienceRelevance: number;
    formatting: number;
    education: number;
    contactInfo: number;
    actionImpactLanguage: number;
  };
  metrics: {
    wordCount: number;
    bulletCount: number;
    quantifiedMetricsCount: number;
    actionVerbCount: number;
    readingTimeMinutes: number;
  };
  issues: ATSIssue[];
  keywords: KeywordAnalysis[];
  matchedKeywords: string[];
  missingKeywords: string[];
  summaryFeedback: string;
}

export interface JobDescriptionAnalysis {
  jobTitle: string;
  company: string;
  requiredSkills: string[];
  preferredSkills: string[];
  experienceRequirements: string;
  educationRequirements: string;
  importantKeywords: string[];
  missingFromResume: string[];
  responsibilities: string[];
  summary: string;
}

export interface TailoredResumeResult {
  originalSummary: string;
  optimizedSummary: string;
  addedKeywords: string[];
  modifiedBullets: {
    company: string;
    original: string;
    optimized: string;
    reason: string;
  }[];
  removedContentNotes: string[];
  newAtsScore: number;
  keywordMatchIncrease: number;
  tailoredResumeData: ResumeData;
}

export interface CoverLetter {
  id: string;
  resumeId?: string;
  jobTitle: string;
  company: string;
  tone: "Professional" | "Confident" | "Concise";
  content: string;
  createdAt: string;
}

export interface LinkedInProfile {
  headline: string;
  about: string;
  experienceBullets: { company: string; role: string; bullets: string[] }[];
  skillsList: string[];
  featuredSectionIdeas: string[];
}

export interface InterviewQuestion {
  id: string;
  type: "HR" | "Technical" | "Behavioral" | "STAR";
  question: string;
  suggestedAnswer: string;
  whyInterviewerAsks: string;
  improvementTips: string[];
}

export interface SkillsGapItem {
  skill: string;
  category: string;
  status: "strong" | "partial" | "missing";
  recommendation: string;
  estimatedTimeToLearn: string;
  resources: { name: string; type: "Course" | "Doc" | "Project"; url?: string }[];
}

export type ApplicationStatus =
  | "Wishlist"
  | "Applied"
  | "Interviewing"
  | "Offer"
  | "Rejected";

export interface JobApplication {
  id: string;
  userId: string;
  company: string;
  jobTitle: string;
  jobUrl?: string;
  location?: string;
  applicationDate: string;
  status: ApplicationStatus;
  notes?: string;
  interviewDate?: string;
  salary?: string;
  contact?: string;
  followUpDate?: string;
  createdAt: string;
  updatedAt: string;
}
