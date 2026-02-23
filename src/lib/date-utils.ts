const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** Format YYYY-MM-DD to "Jan 2020" */
export function formatDate(s: string): string {
  if (!s || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return "";
  const m = s.match(/^(\d{4})-(\d{2})-\d{2}$/);
  if (!m) return "";
  const [, year, month] = m;
  return `${MONTHS[parseInt(month, 10) - 1]} ${year}`;
}

/** Format date range from start/end (YYYY-MM-DD), fallback to legacy string */
export function formatDateRange(
  start: string | undefined,
  end: string | undefined,
  legacy: string
): string {
  const s = formatDate(start ?? "");
  const e = formatDate(end ?? "");
  if (s && e) return `${s} – ${e}`;
  if (s) return `${s} – Present`;
  if (e) return `Until ${e}`;
  return legacy || "";
}
