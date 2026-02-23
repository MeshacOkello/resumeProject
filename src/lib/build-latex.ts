import type { ResumeData } from "@/types/resume";
import { escapeLatex, escapeLatexPreserveCommands } from "./latex-escape";
import { formatDate, formatDateRange } from "./date-utils";

function href(url: string, display: string): string {
  const u = url.startsWith("http") ? url : "https://" + url;
  // Preserve simple inline commands like \textbf in the visible label
  return "\\href{" + u + "}{\\underline{" + escapeLatexPreserveCommands(display) + "}}";
}

function contactLine(data: ResumeData["personal"]): string {
  const parts: string[] = [];
  if (data.phone) parts.push(escapeLatexPreserveCommands(data.phone));
  if (data.email) parts.push(href("mailto:" + data.email, data.email));
  if (data.linkedin) parts.push(href(data.linkedin, data.linkedin.replace(/^https?:\/\//, "")));
  if (data.github) parts.push(href(data.github, data.github.replace(/^https?:\/\//, "")));
  return parts.join(" $|$ ");
}

/** Preamble: font package based on theme (optional, inserted after \input{glyphtounicode}) */
function fontPackage(font: string): string {
  if (font === "roboto") return "\\usepackage[sfdefault]{roboto}";
  if (font === "sourcesanspro") return "\\usepackage[default]{sourcesanspro}";
  return "";
}

/**
 * Build full .tex from ResumeData.
 * Structure and LaTeX tags match Jake's template exactly; only the content is filled from user data.
 */
export function buildLatex(data: ResumeData): string {
  const theme = data.theme;
  const topMargin = theme.topMargin || "-.5in";
  const compact = theme.compactMode;
  const fontLine = fontPackage(theme.font);

  // ---------- PREAMBLE (Jake's template exactly) ----------
  const preamble =
    "%-------------------------\n" +
    "% Resume in Latex\n" +
    "% Author : Jake Gutierrez\n" +
    "% Based off of: https://github.com/sb2nov/resume\n" +
    "% License : MIT\n" +
    "%------------------------\n\n" +
    "\\documentclass[letterpaper,11pt]{article}\n\n" +
    "\\usepackage{latexsym}\n" +
    "\\usepackage[empty]{fullpage}\n" +
    "\\usepackage{titlesec}\n" +
    "\\usepackage{marvosym}\n" +
    "\\usepackage[usenames,dvipsnames]{color}\n" +
    "\\usepackage{verbatim}\n" +
    "\\usepackage{enumitem}\n" +
    "\\usepackage[hidelinks]{hyperref}\n" +
    "\\usepackage{fancyhdr}\n" +
    "\\usepackage[english]{babel}\n" +
    "\\usepackage{tabularx}\n" +
    "\\input{glyphtounicode}\n\n" +
    (fontLine ? fontLine + "\n\n" : "") +
    "\\pagestyle{fancy}\n" +
    "\\fancyhf{} % clear all header and footer fields\n" +
    "\\fancyfoot{}\n" +
    "\\renewcommand{\\headrulewidth}{0pt}\n" +
    "\\renewcommand{\\footrulewidth}{0pt}\n\n" +
    "% Adjust margins\n" +
    "\\addtolength{\\oddsidemargin}{-0.5in}\n" +
    "\\addtolength{\\evensidemargin}{-0.5in}\n" +
    "\\addtolength{\\textwidth}{1in}\n" +
    "\\addtolength{\\topmargin}{" + topMargin + "}\n" +
    "\\addtolength{\\textheight}{1.0in}\n\n" +
    (compact ? "\\renewcommand{\\baselinestretch}{0.95}\n" : "") +
    "\\urlstyle{same}\n\n" +
    "\\raggedbottom\n" +
    "\\raggedright\n" +
    "\\setlength{\\tabcolsep}{0in}\n\n" +
    "% Sections formatting\n" +
    "\\titleformat{\\section}{\n  \\vspace{-4pt}\\scshape\\raggedright\\large\n}{}{0em}{}[\\color{black}\\titlerule \\vspace{-5pt}]\n\n" +
    "% Ensure that generate pdf is machine readable/ATS parsable\n" +
    "\\pdfgentounicode=1\n\n" +
    "%-------------------------\n" +
    "% Custom commands\n" +
    "\\newcommand{\\resumeItem}[1]{\n  \\item\\small{\n    {#1 \\vspace{-2pt}}\n  }\n}\n\n" +
    "\\newcommand{\\resumeSubheading}[4]{\n  \\vspace{-2pt}\\item\n    \\begin{tabular*}{0.97\\textwidth}[t]{l@{\\extracolsep{\\fill}}r}\n      \\textbf{#1} & #2 \\\\\n      \\textit{\\small#3} & \\textit{\\small #4} \\\\\n    \\end{tabular*}\\vspace{-7pt}\n}\n\n" +
    "\\newcommand{\\resumeSubSubheading}[2]{\n    \\item\n    \\begin{tabular*}{0.97\\textwidth}{l@{\\extracolsep{\\fill}}r}\n      \\textit{\\small#1} & \\textit{\\small #2} \\\\\n    \\end{tabular*}\\vspace{-7pt}\n}\n\n" +
    "\\newcommand{\\resumeProjectHeading}[2]{\n    \\item\n    \\begin{tabular*}{0.97\\textwidth}{l@{\\extracolsep{\\fill}}r}\n      \\small#1 & #2 \\\\\n    \\end{tabular*}\\vspace{-7pt}\n}\n\n" +
    "\\newcommand{\\resumeSubItem}[1]{\\resumeItem{#1}\\vspace{-4pt}}\n\n" +
    "\\renewcommand\\labelitemii{$\\vcenter{\\hbox{\\tiny$\\bullet$}}$}\n\n" +
    "\\newcommand{\\resumeSubHeadingListStart}{\\begin{itemize}[leftmargin=0.15in, label={}]}\n" +
    "\\newcommand{\\resumeSubHeadingListEnd}{\\end{itemize}}\n" +
    "\\newcommand{\\resumeItemListStart}{\\begin{itemize}}\n" +
    "\\newcommand{\\resumeItemListEnd}{\\end{itemize}\\vspace{-5pt}}\n\n" +
    "%-------------------------------------------\n" +
    "%%%%%%  RESUME STARTS HERE  %%%%%%%%%%%%%%%%%%%%%%%%%%%%\n\n\n" +
    "\\begin{document}\n\n";

  // ---------- HEADING (Jake's structure, user data) ----------
  const name = escapeLatexPreserveCommands(data.personal.fullName || "Your Name");
  const contact = contactLine(data.personal);
  const heading =
    "%----------HEADING----------\n" +
    "\\begin{center}\n" +
    "    \\textbf{\\Huge \\scshape " + name + "} \\\\ \\vspace{1pt}\n" +
    "    \\small " + contact + "\n" +
    "\\end{center}\n\n";

  // ---------- EDUCATION (Jake's structure exactly) ----------
  const educationEntries = data.education.filter((e) => e.visible && (e.school || e.degree));
  let educationBody = "";
  if (educationEntries.length > 0) {
    educationBody =
      "%-----------EDUCATION-----------\n" +
      "\\section{Education}\n" +
      "  \\resumeSubHeadingListStart\n";
    for (const e of educationEntries) {
      const dateStr = formatDateRange(e.dateRangeStart, e.dateRangeEnd, e.dateRange);
      educationBody +=
        "    \\resumeSubheading\n" +
        "      {" + escapeLatexPreserveCommands(e.school) + "}{" + escapeLatexPreserveCommands(e.location) + "}\n" +
        "      {" + escapeLatexPreserveCommands(e.degree) + "}{" + escapeLatexPreserveCommands(dateStr) + "}\n";
      const courses = e.relevantCourses?.trim();
      if (courses) {
        educationBody +=
          "    \\vspace{-4pt}{\\small \\textbf{Relevant Coursework:} " +
          escapeLatexPreserveCommands(courses) + "}\n";
      }
    }
    educationBody += "  \\resumeSubHeadingListEnd\n\n";
  }

  // ---------- EXPERIENCE (Jake's structure exactly) ----------
  const experienceEntries = data.experience.filter((e) => e.visible && (e.role || e.company));
  let experienceBody = "";
  if (experienceEntries.length > 0) {
    experienceBody =
      "%-----------EXPERIENCE-----------\n" +
      "\\section{Experience}\n" +
      "  \\resumeSubHeadingListStart\n\n";
    for (const e of experienceEntries) {
      const dateStr = formatDateRange(e.dateRangeStart, e.dateRangeEnd, e.dateRange);
      experienceBody +=
        "    \\resumeSubheading\n" +
        "      {" + escapeLatexPreserveCommands(e.role) + "}{" + escapeLatexPreserveCommands(dateStr) + "}\n" +
        "      {" + escapeLatexPreserveCommands(e.company) + "}{" + escapeLatexPreserveCommands(e.location) + "}\n";
      const bullets = e.bullets.filter((b) => b.trim());
      if (bullets.length > 0) {
        experienceBody += "      \\resumeItemListStart\n";
        for (const b of bullets) {
          experienceBody += "        \\resumeItem{" + escapeLatexPreserveCommands(b) + "}\n";
        }
        experienceBody += "      \\resumeItemListEnd\n";
      }
      experienceBody += "\n";
    }
    experienceBody += "  \\resumeSubHeadingListEnd\n\n";
  }

  // ---------- PROJECTS (Jake's structure exactly) ----------
  const projectEntries = data.projects.filter((p) => p.visible && (p.name || p.techStack));
  let projectsBody = "";
  if (projectEntries.length > 0) {
    projectsBody =
      "%-----------PROJECTS-----------\n" +
      "\\section{Projects}\n" +
      "    \\resumeSubHeadingListStart\n";
    for (const p of projectEntries) {
      const dateStr = formatDateRange(p.dateRangeStart, p.dateRangeEnd, p.dateRange);
      const title =
        "\\textbf{" + escapeLatexPreserveCommands(p.name) + "} $|$ \\emph{" + escapeLatexPreserveCommands(p.techStack) + "}";
      projectsBody +=
        "      \\resumeProjectHeading\n" +
        "          {" + title + "}{" + escapeLatexPreserveCommands(dateStr) + "}\n";
      const bullets = p.bullets.filter((b) => b.trim());
      if (bullets.length > 0) {
        projectsBody += "          \\resumeItemListStart\n";
        for (const b of bullets) {
          projectsBody += "            \\resumeItem{" + escapeLatexPreserveCommands(b) + "}\n";
        }
        projectsBody += "          \\resumeItemListEnd\n";
      }
    }
    projectsBody += "    \\resumeSubHeadingListEnd\n\n\n";
  }

  // ---------- TECHNICAL SKILLS (Jake's structure exactly: one \item with \textbf{Category}{: items} \\) ----------
  const skillsCats = data.skills.filter((c) => c.category.trim() || c.items.trim());
  let skillsBody = "";
  if (skillsCats.length > 0) {
    const lines = skillsCats.map(
      (c) =>
        "     \\textbf{" + escapeLatexPreserveCommands(c.category) + "}{: " + escapeLatexPreserveCommands(c.items) + "}"
    );
    skillsBody =
      "%\n" +
      "%-----------PROGRAMMING SKILLS-----------\n" +
      "\\section{Technical Skills}\n" +
      " \\begin{itemize}[leftmargin=0.15in, label={}]\n" +
      "    \\small{\\item{\n" +
      "     " + lines.join(" \\\\\n     ") + "\n" +
      "    }}\n" +
      " \\end{itemize}\n\n";
  }

  // ---------- AVAILABILITY ----------
  const availabilityDate = data.personal.availability;
  const availabilityBody =
    availabilityDate
      ? "%-----------AVAILABILITY-----------\n" +
        "\\section{Availability}\n" +
        "  \\small " + escapeLatexPreserveCommands(formatDate(availabilityDate)) + "\n\n"
      : "";

  // Assemble body in user's section order (heading first, then sections)
  const sectionMap: Record<string, string> = {
    availability: availabilityBody,
    education: educationBody,
    experience: experienceBody,
    projects: projectsBody,
    skills: skillsBody,
  };
  const orderedSections = data.sectionOrder.map((key) => sectionMap[key]).filter(Boolean);

  return (
    preamble +
    heading +
    orderedSections.join("") +
    "%-------------------------------------------\n" +
    "\\end{document}\n"
  );
}
