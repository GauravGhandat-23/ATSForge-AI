import { ResumeData } from "./types";
import { formatCandidateFileName, triggerPrintResume as printResume } from "./export-utils";

export function getResumePdfFilename(resume: ResumeData): string {
  return formatCandidateFileName(resume.personalInfo.fullName, "Resume", "pdf");
}

export function triggerPrintResume(resume: ResumeData) {
  printResume(resume);
}
