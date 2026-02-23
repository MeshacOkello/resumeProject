import React from "react";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

type Cmd = "textbf" | "textit" | "underline";

const CMD_OPEN: Array<{ name: Cmd; open: string }> = [
  { name: "textbf", open: "\\textbf{" },
  { name: "textit", open: "\\textit{" },
  { name: "underline", open: "\\underline{" },
];

function findCmdAt(s: string, i: number): { name: Cmd; open: string } | null {
  for (const c of CMD_OPEN) {
    if (s.startsWith(c.open, i)) return c;
  }
  return null;
}

function parseBalanced(s: string, i: number): { content: string; end: number } | null {
  // s[i] is expected to be just after the opening "{", and we parse until the matching "}"
  let depth = 1;
  let j = i;
  while (j < s.length) {
    const ch = s[j];
    if (ch === "{") depth += 1;
    else if (ch === "}") depth -= 1;
    if (depth === 0) {
      return { content: s.slice(i, j), end: j + 1 };
    }
    j += 1;
  }
  return null;
}

export function latexToHtml(latex: string): string {
  if (!latex) return "";
  const out: string[] = [];
  let i = 0;
  while (i < latex.length) {
    const cmd = findCmdAt(latex, i);
    if (!cmd) {
      out.push(escapeHtml(latex[i]));
      i += 1;
      continue;
    }

    const innerStart = i + cmd.open.length;
    const parsed = parseBalanced(latex, innerStart);
    if (!parsed) {
      // Unbalanced braces — treat as plain text
      out.push(escapeHtml(latex[i]));
      i += 1;
      continue;
    }

    const innerHtml = latexToHtml(parsed.content);
    if (cmd.name === "textbf") out.push(`<strong>${innerHtml}</strong>`);
    if (cmd.name === "textit") out.push(`<em>${innerHtml}</em>`);
    if (cmd.name === "underline") out.push(`<u>${innerHtml}</u>`);
    i = parsed.end;
  }
  return out.join("");
}

/**
 * Convert LaTeX inline commands to React nodes for HTML preview.
 * Supports nested \textbf{}, \textit{}, \underline{}.
 */
export function latexToReact(latex: string, keyPrefix = ""): React.ReactNode[] {
  if (!latex) return [];
  const nodes: React.ReactNode[] = [];
  let i = 0;
  let key = 0;
  while (i < latex.length) {
    const cmd = findCmdAt(latex, i);
    if (!cmd) {
      nodes.push(escapeHtml(latex[i]));
      i += 1;
      continue;
    }
    const innerStart = i + cmd.open.length;
    const parsed = parseBalanced(latex, innerStart);
    if (!parsed) {
      nodes.push(escapeHtml(latex[i]));
      i += 1;
      continue;
    }
    const innerNodes = latexToReact(parsed.content, `${keyPrefix}-${key}`);
    const k = `${keyPrefix}-${key}`;
    if (cmd.name === "textbf") nodes.push(React.createElement("strong", { key: k }, innerNodes));
    else if (cmd.name === "textit") nodes.push(React.createElement("em", { key: k }, innerNodes));
    else if (cmd.name === "underline")
      nodes.push(React.createElement("span", { key: k, style: { textDecoration: "underline" } }, innerNodes));
    key += 1;
    i = parsed.end;
  }
  return nodes;
}

function walk(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) {
    return (node.textContent ?? "").replace(/\u00A0/g, " ");
  }
  if (node.nodeType !== Node.ELEMENT_NODE) return "";

  const el = node as HTMLElement;
  const tag = el.tagName.toLowerCase();
  const children = Array.from(el.childNodes).map(walk).join("");

  if (tag === "strong" || tag === "b") return `\\textbf{${children}}`;
  if (tag === "em" || tag === "i") return `\\textit{${children}}`;
  if (tag === "u") return `\\underline{${children}}`;
  if (tag === "br") return "\n";
  if (tag === "div" || tag === "p") return children + "\n";
  if (tag === "span") {
    const td = (el.style.textDecoration || "").toLowerCase();
    if (td.includes("underline")) return `\\underline{${children}}`;
    return children;
  }
  return children;
}

export function htmlToLatex(html: string): string {
  const container = document.createElement("div");
  container.innerHTML = html || "";
  const latex = Array.from(container.childNodes).map(walk).join("");
  let cleaned = latex.replace(/\s*\n+\s*/g, " ").trimEnd();
  // Remove empty commands that can appear when toggling formatting with no selection.
  // Repeat a few times to handle nested empty wrappers.
  for (let i = 0; i < 5; i += 1) {
    const next = cleaned
      .replace(/\\textbf\{\s*\}/g, "")
      .replace(/\\textit\{\s*\}/g, "")
      .replace(/\\underline\{\s*\}/g, "");
    if (next === cleaned) break;
    cleaned = next;
  }
  // keep single-line inputs single-line
  return cleaned;
}

