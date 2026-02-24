"use client";

import React, { useState, useRef, useEffect } from "react";
import { LayoutList } from "lucide-react";
import { SectionOrderDnd } from "./SectionOrderDnd";
import type { SectionOrder } from "@/types/resume";

export function SectionOrderPopover({
  order,
  onChange,
}: {
  order: SectionOrder;
  onChange: (order: SectionOrder) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        title="Section order"
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 transition-colors touch-manipulation"
      >
        <LayoutList className="w-4 h-4" />
        <span className="hidden lg:inline">Sections</span>
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1.5 z-50 w-56 rounded-lg border border-sky-200 bg-white p-3 shadow-lg">
          <h3 className="text-xs font-semibold text-sky-800 mb-2">Section order</h3>
          <SectionOrderDnd order={order} onChange={onChange} compact />
        </div>
      )}
    </div>
  );
}
