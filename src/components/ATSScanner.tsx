"use client";

import React, { useState, useCallback } from "react";
import type { ResumeData } from "@/types/resume";
import { resumeToText } from "@/lib/resume-text";
import { computeAtsScore } from "@/lib/ats-similarity";

export function ATSScanner({ resume }: { resume: ResumeData }) {
  const [jobDescription, setJobDescription] = useState("");
  const [score, setScore] = useState<number | null>(null);
  const [status, setStatus] = useState<"idle" | "done" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleScan = useCallback(() => {
    const resumeText = resumeToText(resume);
    const jobText = jobDescription.trim();

    if (!resumeText) {
      setErrorMsg("Resume is empty. Add some content first.");
      setStatus("error");
      return;
    }
    if (!jobText) {
      setErrorMsg("Paste a job description to compare against.");
      setStatus("error");
      return;
    }

    setErrorMsg(null);
    const sim = computeAtsScore(resumeText, jobText);
    setScore(sim);
    setStatus("done");
  }, [resume, jobDescription]);

  return (
    <div className="rounded-lg border border-sky-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-sky-800 mb-2">ATS Match Score</h3>
      <p className="text-xs text-slate-500 mb-2">
        Paste a job description. Uses local TF-IDF cosine similarity (no AI/API).
      </p>
      <textarea
        value={jobDescription}
        onChange={(e) => setJobDescription(e.target.value)}
        placeholder="Paste job description here..."
        className="w-full rounded border border-sky-200 bg-white px-3 py-2 text-sm text-sky-900 placeholder-slate-400 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 resize-none"
        rows={4}
      />
      <button
        type="button"
        onClick={handleScan}
        className="mt-2 w-full rounded bg-teal-600 px-3 py-2 text-sm font-medium text-white hover:bg-teal-500"
      >
        Compute match score
      </button>

      {status === "done" && score !== null && (
        <div className="mt-3 rounded border border-sky-200 bg-sky-50/50 p-3">
          <div className="text-2xl font-bold text-sky-800">
            {Math.round(score * 100)}%
          </div>
          <div className="text-xs text-slate-600 mt-0.5">
            Cosine similarity (0–1): {score.toFixed(3)}
          </div>
        </div>
      )}

      {status === "error" && errorMsg && (
        <div className="mt-3 rounded border border-red-200 bg-red-50/50 p-2 text-sm text-red-700">
          {errorMsg}
        </div>
      )}
    </div>
  );
}
