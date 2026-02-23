"use client";

import type { Theme } from "@/types/resume";

export function ThemeSidebar({ theme, onChange }: { theme: Theme; onChange: (t: Theme) => void }) {
  return (
    <div className="rounded-lg border border-sky-200 bg-white p-4 space-y-3 shadow-sm">
      <h3 className="text-sm font-semibold text-sky-800">Layout & theme</h3>
      <label className="block text-xs font-medium text-sky-600">Font</label>
      <select
        value={theme.font}
        onChange={(e) => onChange({ ...theme, font: e.target.value as Theme["font"] })}
        className="w-full rounded-lg border border-sky-200 bg-white px-2.5 py-1.5 text-sky-900 focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
      >
        <option value="default">Default (Latin Modern)</option>
        <option value="roboto">Roboto</option>
        <option value="sourcesanspro">Source Sans Pro</option>
      </select>
      <label className="block text-xs font-medium text-sky-600">Top margin (LaTeX)</label>
      <input
        value={theme.topMargin}
        onChange={(e) => onChange({ ...theme, topMargin: e.target.value })}
        placeholder="-.5in"
        className="w-full rounded-lg border border-sky-200 bg-white px-2.5 py-1.5 text-sky-900 focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
      />
      <label className="flex items-center gap-2 text-sm text-sky-500">
        <input
          type="checkbox"
          checked={theme.compactMode}
          onChange={(e) => onChange({ ...theme, compactMode: e.target.checked })}
          className="rounded border-sky-300 text-teal-700 focus:ring-teal-500 focus:ring-offset-0"
        />
        Compact line spacing
      </label>
    </div>
  );
}
