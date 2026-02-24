"use client";

import React from "react";
import type { ResumeData } from "@/types/resume";
import { latexToReact } from "@/lib/richtext-latex";
import { formatDate, formatDateRange } from "@/lib/date-utils";

const sectionHeading =
  "text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-slate-300 pb-0.5 mb-2";

/** Render LaTeX inline commands (\textbf{}, \textit{}, \underline{}) as HTML in the preview. */
function renderInline(text: string, keyPrefix = ""): React.ReactNode {
  if (!text) return null;
  return <>{latexToReact(text, keyPrefix)}</>;
}

/** High-fidelity HTML preview mirroring Jake's template when PDF is unavailable. */
export function HtmlPreview({ data }: { data: ResumeData }) {
  const { personal, education, experience, projects, skills, sectionOrder } = data;
  const contactParts: string[] = [];
  if (personal.phone) contactParts.push(personal.phone);
  if (personal.email) contactParts.push(personal.email);
  if (personal.linkedin) contactParts.push(personal.linkedin.replace(/^https?:\/\//, ""));
  if (personal.github) contactParts.push(personal.github.replace(/^https?:\/\//, ""));
  const contactLine = contactParts.join(" | ");

  function renderSection(key: (typeof sectionOrder)[number]) {
    if (key === "availability") {
      const avail = personal.availability;
      if (!avail) return null;
      return (
        <section key="availability" className="mb-3">
          <h3 className={sectionHeading}>Availability</h3>
          <p className="text-sm text-slate-700">
            {formatDate(avail)}
          </p>
        </section>
      );
    }
    if (key === "education") {
      return (
        <section key="education" className="mb-3">
          <h3 className={sectionHeading}>Education</h3>
          <div className="space-y-2">
            {education
              .filter((e) => e.visible && (e.school || e.degree))
              .map((e) => (
                <div key={e.id}>
                  <div className="flex justify-between gap-2 text-sm">
                    <div>
                      <span className="font-semibold">
                        {renderInline(e.school || "—", `edu-${e.id}-school`)}
                      </span>
                      {e.location && (
                        <span className="text-slate-600">
                          , {renderInline(e.location, `edu-${e.id}-loc`)}
                        </span>
                      )}
                    </div>
                    <span className="text-slate-600 shrink-0">
                      {formatDateRange(e.dateRangeStart, e.dateRangeEnd, e.dateRange || "")}
                    </span>
                  </div>
                  {e.degree && (
                    <div className="text-sm text-slate-600 italic">
                      {renderInline(e.degree, `edu-${e.id}-degree`)}
                    </div>
                  )}
                  {e.relevantCourses?.trim() && (
                    <div className="text-xs text-slate-500 italic mt-0.5">
                      Relevant Coursework: {renderInline(e.relevantCourses.trim(), `edu-${e.id}-courses`)}
                    </div>
                  )}
                </div>
              ))}
          </div>
        </section>
      );
    }
    if (key === "experience") {
      return (
        <section key="experience" className="mb-3">
          <h3 className={sectionHeading}>Experience</h3>
          <div className="space-y-3">
            {experience
              .filter((e) => e.visible && (e.role || e.company))
              .map((e) => (
                <div key={e.id}>
                  <div className="flex justify-between gap-2 text-sm">
                    <span className="font-semibold">
                      {renderInline(e.role || "—", `exp-${e.id}-role`)}
                    </span>
                    <span className="text-slate-600 shrink-0">
                      {formatDateRange(e.dateRangeStart, e.dateRangeEnd, e.dateRange || "")}
                    </span>
                  </div>
                  <div className="text-sm text-slate-600 italic mb-1">
                    {renderInline(e.company || "", `exp-${e.id}-co`)}
                    {e.location && <> — {renderInline(e.location, `exp-${e.id}-loc`)}</>}
                  </div>
                  <ul className="list-disc list-inside text-sm space-y-0.5 ml-1">
                    {e.bullets
                      .filter((b) => b.trim())
                      .map((b, i) => (
                        <li key={i}>{renderInline(b, `exp-${e.id}-b${i}`)}</li>
                      ))}
                  </ul>
                </div>
              ))}
          </div>
        </section>
      );
    }
    if (key === "projects") {
      return (
        <section key="projects" className="mb-3">
          <h3 className={sectionHeading}>Projects</h3>
          <div className="space-y-3">
            {projects
              .filter((p) => p.visible && (p.name || p.techStack))
              .map((p) => (
                <div key={p.id}>
                  <div className="flex justify-between gap-2 text-sm">
                    <div>
                      <span className="font-semibold">
                        {renderInline(p.name || "—", `proj-${p.id}-name`)}
                      </span>
                      {p.link?.trim() && (
                        <a
                          href={p.link.startsWith("http") ? p.link : "https://" + p.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-1.5 text-[11px] italic text-sky-600 hover:text-sky-800 hover:underline"
                        >
                          {p.link.replace(/^https?:\/\//, "")}
                        </a>
                      )}
                    </div>
                    <span className="text-slate-600 shrink-0">
                      {formatDateRange(p.dateRangeStart, p.dateRangeEnd, p.dateRange || "")}
                    </span>
                  </div>
                  {p.techStack && (
                    <div className="text-sm text-slate-600 italic mb-1">
                      {renderInline(p.techStack, `proj-${p.id}-tech`)}
                    </div>
                  )}
                  <ul className="list-disc list-inside text-sm space-y-0.5 ml-1">
                    {p.bullets
                      .filter((b) => b.trim())
                      .map((b, i) => (
                        <li key={i}>{renderInline(b, `proj-${p.id}-b${i}`)}</li>
                      ))}
                  </ul>
                </div>
              ))}
          </div>
        </section>
      );
    }
    if (key === "skills") {
      return (
        <section key="skills" className="mb-3">
          <h3 className={sectionHeading}>Technical Skills</h3>
          <div className="text-sm">
            {skills
              .filter((c) => c.category.trim() || c.items.trim())
              .map((c) => (
                <span key={c.id} className="inline">
                  <strong>{renderInline(c.category || "—", `skill-${c.id}-cat`)}</strong>
                  {c.items ? <>: {renderInline(c.items, `skill-${c.id}-items`)}</> : null}
                  {"  "}
                </span>
              ))}
          </div>
        </section>
      );
    }
    return null;
  }

  return (
    <div
      className="bg-white text-slate-800 rounded-lg shadow-xl p-6 mx-auto w-full max-w-[210mm] box-border"
      style={{ minHeight: 500, fontFamily: "Georgia, 'Times New Roman', serif" }}
    >
      <header className="text-center border-b border-slate-300 pb-2 mb-3">
        <h1 className="text-xl font-bold text-slate-900">
          {renderInline(personal.fullName || "Your Name", "name")}
        </h1>
        {contactLine && (
          <p className="text-xs text-slate-600 mt-0.5">
            {renderInline(contactLine, "contact")}
          </p>
        )}
      </header>
      <div className="text-sm">
        {sectionOrder.map((k) => renderSection(k))}
      </div>
    </div>
  );
}
