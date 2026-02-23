/**
 * Escape user input for LaTeX to prevent compilation errors.
 * Handles: & % $ # _ { } ~ ^ \
 */
export function escapeLatex(s: string): string {
  return s
    .replace(/\\/g, "\\textbackslash{}")
    .replace(/&/g, "\\&")
    .replace(/%/g, "\\%")
    .replace(/\$/g, "\\$")
    .replace(/#/g, "\\#")
    .replace(/_/g, "\\_")
    .replace(/\{/g, "\\{")
    .replace(/\}/g, "\\}")
    .replace(/~/g, "\\textasciitilde{}")
    .replace(/\^/g, "\\textasciicircum{}");
}

const CMD_OPEN = ["\\textbf{", "\\textit{", "\\underline{"] as const;
type CmdOpen = (typeof CMD_OPEN)[number];

function cmdAt(s: string, i: number): CmdOpen | null {
  for (const open of CMD_OPEN) {
    if (s.startsWith(open, i)) return open;
  }
  return null;
}

function findMatchingBrace(s: string, startAfterOpen: number): number | null {
  // We start just after the "{" in \cmd{, so depth starts at 1.
  let depth = 1;
  for (let j = startAfterOpen; j < s.length; j += 1) {
    const ch = s[j];
    if (ch === "{") depth += 1;
    else if (ch === "}") depth -= 1;
    if (depth === 0) return j;
  }
  return null;
}

/**
 * Escape for LaTeX but preserve \textbf{}, \textit{}, \underline{} so ribbon formatting appears in the PDF.
 * Use for any field that can have Bold/Italic/Underline applied.
 */
export function escapeLatexPreserveCommands(s: string): string {
  if (!s) return s;
  const out: string[] = [];
  let i = 0;
  let lastTextStart = 0;

  while (i < s.length) {
    const open = cmdAt(s, i);
    if (!open) {
      i += 1;
      continue;
    }

    const innerStart = i + open.length;
    const closeIdx = findMatchingBrace(s, innerStart);
    if (closeIdx === null) {
      // Unbalanced braces: treat as plain text
      i += 1;
      continue;
    }

    // Flush preceding plain text (escaped)
    if (lastTextStart < i) out.push(escapeLatex(s.slice(lastTextStart, i)));

    // Preserve the full command block (may contain nested commands)
    out.push(s.slice(i, closeIdx + 1));

    i = closeIdx + 1;
    lastTextStart = i;
  }

  if (lastTextStart < s.length) out.push(escapeLatex(s.slice(lastTextStart)));
  return out.join("");
}
