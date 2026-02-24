"use client";

import React from "react";
import { Download, FileCode, Loader2, Bold, Italic, Underline } from "lucide-react";
import type { Theme } from "@/types/resume";
import { AnimatedCounter } from "@/components/AnimatedCounter";

export type FormatType = "bold" | "italic" | "underline";

export interface FormattingRibbonProps {
  onDownloadPdf: () => void;
  onExportTex: () => void;
  onFormat?: (type: FormatType) => void;
  pdfDownloading: boolean;
  theme: Theme;
  onThemeChange: (t: Theme) => void;
  downloadCount?: number;
  className?: string;
}

export function FormattingRibbon({
  onDownloadPdf,
  onExportTex,
  onFormat,
  pdfDownloading,
  theme,
  onThemeChange,
  downloadCount = 0,
  className = "",
}: FormattingRibbonProps) {
  return (
    <header
      className={
        "flex flex-wrap items-center justify-between gap-3 px-3 sm:px-4 py-2.5 border-b border-sky-200 bg-white shrink-0 transition-colors duration-150 shadow-sm " +
        className
      }
      style={{ minHeight: 52 }}
    >
      <div className="flex flex-wrap items-center gap-2 sm:gap-4">
        {/* Text formatting (B/I/U) — toggles LaTeX in focused field */}
        {onFormat && (
          <div className="flex items-center gap-0.5 border-r border-sky-200 pr-2 sm:pr-3">
            <button
              type="button"
              onClick={() => onFormat("bold")}
              title="Bold"
              className="p-2 rounded text-slate-700 hover:bg-sky-100 hover:text-sky-800 transition-colors touch-manipulation"
            >
              <Bold className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onFormat("italic")}
              title="Italic"
              className="p-2 rounded text-slate-700 hover:bg-sky-100 hover:text-sky-800 transition-colors touch-manipulation"
            >
              <Italic className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onFormat("underline")}
              title="Underline"
              className="p-2 rounded text-slate-700 hover:bg-sky-100 hover:text-sky-800 transition-colors touch-manipulation"
            >
              <Underline className="w-4 h-4" />
            </button>
          </div>
        )}
        {/* Layout & theme controls — hidden on very small screens */}
        <div className="hidden sm:flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-medium text-slate-500">Font</span>
            <select
              value={theme.font}
              onChange={(e) => onThemeChange({ ...theme, font: e.target.value as Theme["font"] })}
              className="rounded-md border border-sky-200 bg-white px-2 py-1 text-xs text-sky-900 focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
            >
              <option value="default">Default</option>
              <option value="roboto">Roboto</option>
              <option value="sourcesanspro">Source Sans</option>
            </select>
          </div>
          <div className="hidden md:flex items-center gap-1.5">
            <span className="text-[11px] font-medium text-slate-500">Margin</span>
            <input
              value={theme.topMargin}
              onChange={(e) => onThemeChange({ ...theme, topMargin: e.target.value })}
              className="w-16 rounded-md border border-sky-200 bg-white px-2 py-1 text-xs text-sky-900 focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
              placeholder="-.5in"
            />
          </div>
          <label className="hidden md:flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
            <input
              type="checkbox"
              checked={theme.compactMode}
              onChange={(e) => onThemeChange({ ...theme, compactMode: e.target.checked })}
              className="h-3 w-3 rounded border-sky-300 text-teal-700 focus:ring-teal-500 focus:ring-offset-0"
            />
            Compact
          </label>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={onDownloadPdf}
            disabled={pdfDownloading}
            className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg text-sm font-semibold text-white bg-teal-600 hover:bg-teal-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-150 shadow-sm touch-manipulation"
          >
            {pdfDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            <span className="hidden sm:inline">Download PDF</span>
            <span className="sm:hidden">PDF</span>
          </button>
          <span
            className="hidden sm:flex items-center gap-1 text-xs text-slate-500 tabular-nums"
            title="Total downloads"
          >
            <AnimatedCounter
              value={downloadCount}
              duration={1400}
              updateDuration={400}
              className="font-medium text-slate-600"
            />
            <span className="text-slate-400">downloads</span>
          </span>
        </div>
        <button
          type="button"
          onClick={onExportTex}
          title="Export .tex"
          className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium text-teal-700 bg-white border-2 border-teal-200 hover:bg-teal-50 transition-colors duration-150 touch-manipulation"
        >
          <FileCode className="w-4 h-4" /> <span className="hidden sm:inline">Export .tex</span>
        </button>
      </div>
    </header>
  );
}
