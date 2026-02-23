"use client";

import { useState } from "react";
import type { ResumeData } from "@/types/resume";

const STOP = new Set("a an the and or but in on at to for of with by from as is was are were been be have has had do does did will would could should may might must".split(" "));

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s'-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP.has(w));
}

function getResumeText(data: ResumeData): string {
  const parts: string[] = [
    data.personal.fullName,
    ...data.education.flatMap((e) => [e.school, e.degree]),
    ...data.experience.flatMap((e) => [e.role, e.company, ...e.bullets]),
    ...data.projects.flatMap((p) => [p.name, p.techStack, ...p.bullets]),
    ...data.skills.flatMap((s) => [s.category, s.items]),
  ];
  return parts.join(" ").toLowerCase();
}

export function ATSScanner({ resume }: { resume: ResumeData }) {
  const [jd, setJd] = useState("");
  const [result, setResult] = useState<{ missing: string[]; matched: string[] } | null>(null);

  const run = () => {
    if (!jd.trim()) return;
    const keywords = Array.from(new Set(tokenize(jd)));
    const resumeText = getResumeText(resume);
    const missing: string[] = [];
    const matched: string[] = [];
    for (const kw of keywords) {
      if (resumeText.includes(kw)) matched.push(kw);
      else missing.push(kw);
    }
    setResult({ missing: missing.slice(0, 25), matched: matched.slice(0, 25) });
  };

  return (
    <div className="rounded-lg border border-sky-200 bg-white p-4 space-y-3 shadow-sm">
      <h3 className="text-sm font-semibold text-sky-800">ATS Keyword Scanner</h3>
      <p className="text-xs text-sky-600">Paste a job description to see missing vs. matched keywords.</p>
      <textarea
        value={jd}
        onChange={(e) => setJd(e.target.value)}
        placeholder="Paste job description..."
        rows={4}
        className="w-full rounded border border-sky-200 bg-white px-2.5 py-1.5 text-sky-900 resize-y focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
      />
      <button
        type="button"
        onClick={run}
        className="w-full rounded bg-teal-600 hover:bg-teal-500 py-2 text-sm font-medium text-white"
      >
        Scan
      </button>
      {result && (
        <div className="space-y-2 text-xs">
          <div>
            <span className="text-green-700 font-medium">Matched ({result.matched.length})</span>
            <p className="text-sky-600 mt-0.5 break-words">{result.matched.join(", ") || "—"}</p>
          </div>
          <div>
            <span className="text-amber-700 font-medium">Missing ({result.missing.length})</span>
            <p className="text-sky-600 mt-0.5 break-words">{result.missing.join(", ") || "—"}</p>
          </div>
        </div>
      )}
    </div>
  );
}
