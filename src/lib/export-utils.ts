import { ResumeData } from "./types";

export function formatCandidateFileName(fullName?: string, suffix: string = "Resume", ext: string = "pdf"): string {
  if (!fullName || fullName.trim() === "") {
    return `ATSForge_${suffix}.${ext}`;
  }
  const parts = fullName.trim().split(/\s+/);
  const sanitized = parts.map((p) => p.replace(/[^a-zA-Z0-9]/g, "")).filter(Boolean);
  if (sanitized.length === 0) {
    return `ATSForge_${suffix}.${ext}`;
  }
  return `${sanitized.join("_")}_${suffix}.${ext}`;
}

export function triggerPrintResume(resume: ResumeData) {
  const filename = formatCandidateFileName(resume.personalInfo.fullName, "Resume", "pdf");
  const originalTitle = document.title;
  document.title = filename.replace(/\.pdf$/i, "");
  window.print();
  setTimeout(() => {
    document.title = originalTitle;
  }, 1000);
}

export function downloadResumeDocx(resume: ResumeData) {
  const filename = formatCandidateFileName(resume.personalInfo.fullName, "Resume", "docx");
  
  const content = `
<!DOCTYPE html>
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
<meta charset='utf-8'>
<title>${resume.personalInfo.fullName || "Resume"}</title>
<style>
body { font-family: Calibri, Arial, sans-serif; font-size: 11pt; line-height: 1.35; color: #111827; }
h1 { font-size: 20pt; margin-bottom: 2pt; color: #111827; }
h2 { font-size: 13pt; border-bottom: 1.5pt solid #4338ca; text-transform: uppercase; margin-top: 14pt; margin-bottom: 6pt; color: #1e1b4b; }
h3 { font-size: 11pt; font-weight: bold; margin-bottom: 1pt; }
p { margin: 2pt 0; }
ul { margin: 3pt 0 8pt 18pt; padding: 0; }
li { margin-bottom: 2pt; }
.contact { font-size: 10pt; color: #4b5563; margin-bottom: 10pt; }
.dates { font-size: 9.5pt; color: #6b7280; font-style: italic; }
</style>
</head>
<body>
<h1>${resume.personalInfo.fullName || "Candidate"}</h1>
<p class="contact">
  ${resume.personalInfo.email ? resume.personalInfo.email + " | " : ""}
  ${resume.personalInfo.phone ? resume.personalInfo.phone + " | " : ""}
  ${resume.personalInfo.location || ""}
  ${resume.personalInfo.linkedin ? " | " + resume.personalInfo.linkedin : ""}
</p>

${resume.summary ? `<h2>Professional Summary</h2><p>${resume.summary}</p>` : ""}

${resume.experiences?.length ? `
<h2>Professional Experience</h2>
${resume.experiences.map((exp) => `
  <div>
    <h3>${exp.jobTitle} - ${exp.company}</h3>
    <p class="dates">${exp.startDate} – ${exp.current ? "Present" : exp.endDate || "Present"} | ${exp.location}</p>
    <ul>
      ${exp.bullets.map((b) => `<li>${b}</li>`).join("")}
    </ul>
  </div>
`).join("")}
` : ""}

${resume.education?.length ? `
<h2>Education</h2>
${resume.education.map((edu) => `
  <div>
    <h3>${edu.degree}${edu.field ? " in " + edu.field : ""} - ${edu.institution}</h3>
    <p class="dates">${edu.startDate} – ${edu.endDate || "Present"}${edu.gpa ? " | GPA: " + edu.gpa : ""}</p>
  </div>
`).join("")}
` : ""}

${resume.skills ? `
<h2>Skills</h2>
<p><strong>Technical:</strong> ${resume.skills.technical?.join(", ") || "N/A"}</p>
<p><strong>Tools &amp; Platforms:</strong> ${resume.skills.tools?.join(", ") || "N/A"}</p>
<p><strong>Soft Skills:</strong> ${resume.skills.soft?.join(", ") || "N/A"}</p>
` : ""}

${resume.projects?.length ? `
<h2>Key Projects</h2>
${resume.projects.map((p) => `
  <div>
    <h3>${p.name}</h3>
    <p>${p.description}</p>
    ${p.technologies?.length ? `<p><em>Technologies: ${p.technologies.join(", ")}</em></p>` : ""}
    <ul>
      ${p.bullets?.map((b) => `<li>${b}</li>`).join("") || ""}
    </ul>
  </div>
`).join("")}
` : ""}

${resume.certifications?.length ? `
<h2>Certifications</h2>
<ul>
  ${resume.certifications.map((c) => `<li><strong>${c.name}</strong> - ${c.issuer} (${c.date})</li>`).join("")}
</ul>
` : ""}

${resume.languages?.length ? `
<h2>Languages</h2>
<p>${resume.languages.map((l) => `${l.name} (${l.proficiency})`).join(", ")}</p>
` : ""}
</body>
</html>
`;

  const blob = new Blob(["\ufeff", content], {
    type: "application/msword;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function downloadResumeTxt(resume: ResumeData) {
  const filename = formatCandidateFileName(resume.personalInfo.fullName, "Resume", "txt");
  let text = `${resume.personalInfo.fullName || "Candidate"}\n`;
  text += `${resume.personalInfo.title || resume.targetRole}\n`;
  text += `Email: ${resume.personalInfo.email} | Phone: ${resume.personalInfo.phone} | Location: ${resume.personalInfo.location}\n`;
  if (resume.personalInfo.linkedin) text += `LinkedIn: ${resume.personalInfo.linkedin}\n`;
  if (resume.personalInfo.github) text += `GitHub: ${resume.personalInfo.github}\n`;
  text += `\n==============================\nPROFESSIONAL SUMMARY\n==============================\n${resume.summary}\n`;

  if (resume.experiences?.length) {
    text += `\n==============================\nEXPERIENCE\n==============================\n`;
    resume.experiences.forEach((exp) => {
      text += `\n${exp.jobTitle} | ${exp.company} | ${exp.startDate} - ${exp.current ? "Present" : exp.endDate}\n`;
      exp.bullets.forEach((b) => {
        text += `  • ${b}\n`;
      });
    });
  }

  if (resume.education?.length) {
    text += `\n==============================\nEDUCATION\n==============================\n`;
    resume.education.forEach((edu) => {
      text += `${edu.degree} in ${edu.field} | ${edu.institution} (${edu.startDate} - ${edu.endDate})\n`;
    });
  }

  if (resume.skills) {
    text += `\n==============================\nSKILLS\n==============================\n`;
    text += `Technical: ${resume.skills.technical?.join(", ")}\n`;
    text += `Tools: ${resume.skills.tools?.join(", ")}\n`;
    text += `Soft Skills: ${resume.skills.soft?.join(", ")}\n`;
  }

  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function downloadCoverLetterPdf(content: string, candidateName?: string, company?: string) {
  const filename = formatCandidateFileName(candidateName, `Cover_Letter_${company || "Company"}`, "pdf");
  const originalTitle = document.title;
  document.title = filename.replace(/\.pdf$/i, "");
  
  // Create an iframe or temporary print window
  const printWindow = window.open("", "_blank");
  if (printWindow) {
    printWindow.document.write(`
      <html>
        <head>
          <title>${filename.replace(/\.pdf$/i, "")}</title>
          <style>
            body { font-family: Georgia, serif; font-size: 11pt; line-height: 1.6; color: #111; margin: 40px; }
            p { margin-bottom: 14pt; }
            @media print { body { margin: 20mm; } }
          </style>
        </head>
        <body>
          <div style="white-space: pre-wrap;">${content}</div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  } else {
    window.print();
  }

  setTimeout(() => {
    document.title = originalTitle;
  }, 1000);
}

export function downloadCoverLetterDocx(content: string, candidateName?: string, company?: string) {
  const filename = formatCandidateFileName(candidateName, `Cover_Letter_${company || "Company"}`, "docx");
  const docxHtml = `
<!DOCTYPE html>
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
<meta charset='utf-8'>
<title>Cover Letter</title>
<style>
body { font-family: Calibri, Arial, sans-serif; font-size: 11.5pt; line-height: 1.45; color: #111; margin: 1in; }
p { margin-bottom: 10pt; }
</style>
</head>
<body>
<div style="white-space: pre-wrap;">${content}</div>
</body>
</html>
`;
  const blob = new Blob(["\ufeff", docxHtml], {
    type: "application/msword;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
