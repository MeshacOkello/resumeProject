"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";
import { SectionOrderDnd } from "./SectionOrderDnd";
import { ATSScanner } from "./ATSScanner";
import type { SectionOrder } from "@/types/resume";
import type { ResumeData } from "@/types/resume";

export function MobileToolsSheet({
  open,
  onClose,
  sectionOrder,
  onSectionOrderChange,
  resume,
}: {
  open: boolean;
  onClose: () => void;
  sectionOrder: SectionOrder;
  onSectionOrderChange: (order: SectionOrder) => void;
  resume: ResumeData;
}) {
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/40 z-40 md:hidden"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className="fixed inset-x-0 bottom-0 z-50 md:hidden max-h-[85vh] overflow-hidden rounded-t-2xl bg-white shadow-2xl flex flex-col animate-[slideUp_0.3s_ease-out]"
        role="dialog"
        aria-modal="true"
        aria-label="Sections & ATS"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-sky-200 shrink-0">
          <h2 className="text-base font-semibold text-sky-800">Sections & ATS</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 -mr-2 rounded-full text-slate-500 hover:bg-sky-100 hover:text-sky-800 touch-manipulation"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="overflow-y-auto p-4 space-y-4 flex-1 min-h-0">
          <SectionOrderDnd order={sectionOrder} onChange={onSectionOrderChange} />
          <ATSScanner resume={resume} />
        </div>
      </div>
    </>
  );
}
