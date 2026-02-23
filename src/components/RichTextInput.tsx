"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { htmlToLatex, latexToHtml } from "@/lib/richtext-latex";

export function RichTextInput({
  value,
  onChange,
  onFocus,
  placeholder,
  className,
  singleLine = true,
}: {
  value: string;
  onChange: (v: string) => void;
  onFocus?: (e: React.FocusEvent<HTMLDivElement>) => void;
  placeholder?: string;
  className?: string;
  singleLine?: boolean;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [focused, setFocused] = useState(false);

  const html = useMemo(() => latexToHtml(value || ""), [value]);
  const isEmpty = !value?.trim();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (focused) return;
    if (el.innerHTML !== html) el.innerHTML = html;
  }, [html, focused]);

  return (
    <div className="relative">
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        className={className}
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={() => setFocused(false)}
        onKeyDown={(e) => {
          if (singleLine && e.key === "Enter") {
            e.preventDefault();
            (e.currentTarget as HTMLDivElement).blur();
          }
        }}
        onInput={(e) => {
          const el = e.currentTarget;
          const next = htmlToLatex(el.innerHTML);
          onChange(next);
        }}
      />
      {placeholder && isEmpty && !focused && (
        <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
          {placeholder}
        </div>
      )}
    </div>
  );
}

