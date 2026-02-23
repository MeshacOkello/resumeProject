"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import { defaultResume, type ResumeData, type SectionOrder } from "@/types/resume";
import { buildLatex } from "@/lib/build-latex";
import { ResumeForm } from "@/components/ResumeForm";
import { ATSScanner } from "@/components/ATSScanner";
import { SectionOrderDnd } from "@/components/SectionOrderDnd";
import { FormattingRibbon } from "@/components/FormattingRibbon";
import { HtmlPreview } from "@/components/HtmlPreview";

const STORAGE_KEY = "resume-generator-data";

/** Optional: set NEXT_PUBLIC_TRACK_DOWNLOAD_URL to your own endpoint; otherwise uses CountAPI */
const TRACK_DOWNLOAD_URL =
  process.env.NEXT_PUBLIC_TRACK_DOWNLOAD_URL ?? "https://api.countapi.xyz/hit/resume-project/downloads";

/** GET URL for fetching count; set NEXT_PUBLIC_GET_DOWNLOAD_COUNT_URL for custom backends */
const GET_COUNT_URL =
  process.env.NEXT_PUBLIC_GET_DOWNLOAD_COUNT_URL ??
  TRACK_DOWNLOAD_URL.replace("/hit/", "/get/");

const POLL_INTERVAL_MS = 60_000;

function load(): ResumeData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const data = { ...defaultResume, ...parsed } as ResumeData;
    if (data.sectionOrder && !data.sectionOrder.includes("availability")) {
      const expIdx = data.sectionOrder.indexOf("experience");
      const before = expIdx >= 0 ? data.sectionOrder.slice(0, expIdx) : data.sectionOrder;
      const after = expIdx >= 0 ? data.sectionOrder.slice(expIdx) : [];
      data.sectionOrder = [...before, "availability", ...after] as typeof data.sectionOrder;
    }
    return data;
  } catch {
    return null;
  }
}

/** Triggers browser download of a blob with the given filename. */
function saveBlob(blob: Blob, filename: string) {
  const safeName = (filename || "download").replace(/[^\w\s\-_.]/g, "") || "download";
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = safeName;
  a.setAttribute("download", safeName);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

async function fetchDownloadCount(): Promise<number> {
  try {
    const res = await fetch(GET_COUNT_URL);
    if (!res.ok) return 0;
    const json = await res.json();
    return typeof json?.value === "number" ? json.value : 0;
  } catch {
    return 0;
  }
}

export default function Home() {
  const [data, setData] = useState<ResumeData>(defaultResume);
  const [formKey, setFormKey] = useState(0);
  const [downloadCount, setDownloadCount] = useState(0);
  const formRef = useRef<{ applyFormat: (type: "bold" | "italic" | "underline") => void } | null>(null);

  useEffect(() => {
    const loaded = load();
    if (loaded) {
      setData(loaded);
      setFormKey((k) => k + 1);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    const refresh = async () => {
      const count = await fetchDownloadCount();
      if (mounted) setDownloadCount(count);
    };
    refresh();
    const id = setInterval(refresh, POLL_INTERVAL_MS);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, []);

  const handleSectionOrder = useCallback((order: SectionOrder) => {
    setData((d) => ({ ...d, sectionOrder: order }));
  }, []);

  const handleTheme = useCallback((theme: ResumeData["theme"]) => {
    setData((d) => ({ ...d, theme }));
  }, []);

  const handleDownloadPdf = useCallback(() => {
    fetch(TRACK_DOWNLOAD_URL).catch(() => {});
    setDownloadCount((c) => c + 1);
    window.print();
  }, []);

  const handleFormat = useCallback((type: "bold" | "italic" | "underline") => {
    formRef.current?.applyFormat(type);
  }, []);

  const handleExportTex = useCallback(() => {
    const tex = buildLatex(data);
    const blob = new Blob([tex], { type: "text/plain;charset=utf-8" });
    const name = (data.personal.fullName || "resume").trim().replace(/\s+/g, "_");
    saveBlob(blob, `${name}_Resume.tex`);
  }, [data]);

  const handleLoadJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string);
        setData({ ...defaultResume, ...parsed } as ResumeData);
        setFormKey((k) => k + 1);
      } catch (_) {
        alert("Invalid JSON file.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    saveBlob(blob, "resume-data.json");
  };

  return (
    <div
      className="flex flex-col h-screen overflow-hidden transition-colors duration-200 print:bg-white"
      style={{ height: "100vh", background: "linear-gradient(135deg, #E0F2FE 0%, #F0FDF4 50%, #FEF3C7 100%)" }}
    >
      {/* Ribbon — hidden when printing */}
      <div className="print:hidden">
        <FormattingRibbon
        onDownloadPdf={handleDownloadPdf}
        onExportTex={handleExportTex}
        onFormat={handleFormat}
        pdfDownloading={false}
        theme={data.theme}
        onThemeChange={handleTheme}
        downloadCount={downloadCount}
      />
      </div>

      {/* Main: left form (~38%) | right preview (~62%) */}
      <main className="flex-1 flex min-h-0 w-full overflow-hidden">
        <aside
          className="flex flex-col shrink-0 overflow-hidden border-r border-sky-200/80 bg-white/90 shadow-sm print:hidden"
          style={{ width: "38%", maxWidth: 420, minWidth: 280 }}
        >
          <div className="flex-1 overflow-y-auto p-4 min-h-0">
            <ResumeForm ref={formRef} key={formKey} data={data} onChange={setData} />
          </div>
          <div className="p-3 border-t border-sky-200/80 bg-white space-y-3 shrink-0">
            <SectionOrderDnd order={data.sectionOrder} onChange={handleSectionOrder} />
            <ATSScanner resume={data} />
          </div>
        </aside>

        {/* Right: live preview (no API calls); Download PDF uses browser print → Save as PDF */}
        <section className="flex-1 flex flex-col min-w-0 overflow-hidden bg-sky-50/60 print:bg-white">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-sky-200/80 bg-white shrink-0 print:hidden">
            <span className="text-sm font-semibold text-sky-800">Live preview</span>
          </div>
          <div id="resume-print" className="flex-1 min-h-0 flex justify-center overflow-auto p-3 print:p-0 print:block">
            <HtmlPreview data={data} />
          </div>
        </section>
      </main>
    </div>
  );
}
