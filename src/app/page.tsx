"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import { FileEdit, Eye, SlidersHorizontal } from "lucide-react";
import { defaultResume, type ResumeData, type SectionOrder } from "@/types/resume";
import { buildLatex } from "@/lib/build-latex";
import { ResumeForm } from "@/components/ResumeForm";
import { MobileToolsSheet } from "@/components/MobileToolsSheet";
import { ATSScanner } from "@/components/ATSScanner";
import { FormattingRibbon } from "@/components/FormattingRibbon";
import { HtmlPreview } from "@/components/HtmlPreview";

const STORAGE_KEY = "resume-generator-data";

/** Use our API for persistent download count */
const TRACK_DOWNLOAD_URL = "/api/download-count";
const GET_COUNT_URL = "/api/download-count";

const POLL_INTERVAL_MS = 60_000;

function load(): ResumeData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const data = { ...defaultResume, ...parsed } as ResumeData;
    // Migrate section order: remove availability (legacy), ensure leadership exists
    if (data.sectionOrder) {
      const order = data.sectionOrder as string[];
      const filtered = order.filter((k) => k !== "availability") as SectionOrder;
      if (!filtered.includes("leadership")) {
        const projIdx = filtered.indexOf("projects");
        const insertAt = projIdx >= 0 ? projIdx + 1 : filtered.length;
        filtered.splice(insertAt, 0, "leadership");
      }
      data.sectionOrder = filtered;
    }
    if (!data.leadership) data.leadership = [];
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
    const res = await fetch(GET_COUNT_URL, { cache: "no-store" });
    if (!res.ok) return 0;
    const json = await res.json();
    return typeof json?.value === "number" ? json.value : 0;
  } catch {
    return 0;
  }
}

type MobileTab = "form" | "preview";

export default function Home() {
  const [data, setData] = useState<ResumeData>(defaultResume);
  const [formKey, setFormKey] = useState(0);
  const [downloadCount, setDownloadCount] = useState(0);
  const [mobileTab, setMobileTab] = useState<MobileTab>("form");
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);
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

  const handleDownloadPdf = useCallback(async () => {
    try {
      const res = await fetch(TRACK_DOWNLOAD_URL, { method: "POST" });
      if (res.ok) {
        const json = await res.json();
        if (typeof json?.value === "number") setDownloadCount(json.value);
      }
    } catch {
      setDownloadCount((c) => c + 1);
    }
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
        sectionOrder={data.sectionOrder}
        onSectionOrderChange={handleSectionOrder}
      />
      </div>

      {/* Mobile: tab switcher + Sections button */}
      <div className="md:hidden flex items-stretch border-b border-sky-200/80 bg-white print:hidden">
        <button
          type="button"
          onClick={() => setMobileTab("form")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
            mobileTab === "form" ? "text-teal-600 border-b-2 border-teal-600 bg-teal-50/50" : "text-slate-500 hover:text-sky-700"
          }`}
        >
          <FileEdit className="w-4 h-4" /> Edit
        </button>
        <button
          type="button"
          onClick={() => setMobileTab("preview")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
            mobileTab === "preview" ? "text-teal-600 border-b-2 border-teal-600 bg-teal-50/50" : "text-slate-500 hover:text-sky-700"
          }`}
        >
          <Eye className="w-4 h-4" /> Preview
        </button>
        <button
          type="button"
          onClick={() => setMobileSheetOpen(true)}
          className="flex items-center justify-center px-3 border-l border-sky-200/80 text-teal-600 hover:bg-teal-50 transition-colors touch-manipulation"
          title="Sections & ATS"
          aria-label="Sections & ATS"
        >
          <SlidersHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* Mobile: bottom sheet for Sections + ATS (doesn't block form) */}
      <MobileToolsSheet
        open={mobileSheetOpen}
        onClose={() => setMobileSheetOpen(false)}
        sectionOrder={data.sectionOrder}
        onSectionOrderChange={handleSectionOrder}
        resume={data}
      />

      {/* Main: left form | right preview — side-by-side on md+, stacked tabs on mobile */}
      <main className="flex-1 flex min-h-0 w-full overflow-hidden">
        <aside
          className={`flex-col shrink-0 overflow-hidden border-r border-sky-200/80 bg-white/90 shadow-sm print:hidden
            ${mobileTab === "form" ? "flex w-full" : "hidden"} md:flex md:w-[38%] md:max-w-[420px] md:min-w-[280px]`}
        >
          <div className="flex-1 overflow-y-auto p-4 min-h-0">
            <ResumeForm ref={formRef} key={formKey} data={data} onChange={setData} />
          </div>
          {/* Desktop: ATS scanner stays in sidebar (section order moved to toolbar) */}
          <div className="hidden md:block p-3 border-t border-sky-200/80 bg-white shrink-0">
            <ATSScanner resume={data} />
          </div>
        </aside>

        {/* Right: live preview */}
        <section
          className={`flex flex-col min-w-0 overflow-hidden bg-sky-50/60 print:bg-white print:block
            ${mobileTab === "preview" ? "flex flex-1 w-full" : "hidden"} md:flex md:flex-1`}
        >
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
