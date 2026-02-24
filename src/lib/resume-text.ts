import type { ResumeData } from "@/types/resume";

/** Strip LaTeX formatting to plain text for embedding */
function stripLatex(text: string): string {
  if (!text?.trim()) return "";
  let s = text;
  // Remove \textbf{...}, \textit{...}, \underline{...} - keep inner content
  while (s.includes("\\")) {
    const next = s.replace(/\\(?:textbf|textit|underline)\{([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}/g, "$1");
    if (next === s) break;
    s = next;
  }
  // Remove remaining \command{...}
  s = s.replace(/\\[a-zA-Z]+\{[^{}]*\}/g, "");
  s = s.replace(/\\[a-zA-Z]+/g, "");
  return s.trim();
}

/** Extract plain text from resume data for embedding */
export function resumeToText(data: ResumeData): string {
  const parts: string[] = [];

  const p = data.personal;
  parts.push(p.fullName, p.phone, p.email, p.linkedin, p.github);

  for (const e of data.education) {
    if (!e.visible) continue;
    parts.push(e.school, e.location, e.degree, e.relevantCourses);
  }

  for (const e of data.experience) {
    if (!e.visible) continue;
    parts.push(e.role, e.company, e.location);
    parts.push(...e.bullets.filter(Boolean));
  }

  for (const p of data.projects) {
    if (!p.visible) continue;
    parts.push(p.name, p.techStack);
    parts.push(...p.bullets.filter(Boolean));
  }

  for (const e of data.leadership ?? []) {
    if (!e.visible) continue;
    parts.push(e.role, e.organization, e.location);
    parts.push(...e.bullets.filter(Boolean));
  }

  for (const c of data.skills) {
    parts.push(c.category, c.items);
  }

  return parts
    .map(stripLatex)
    .filter(Boolean)
    .join(" ");
}
