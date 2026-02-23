import { NextRequest, NextResponse } from "next/server";
import { writeFile, readFile, mkdtemp, rm } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";
import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);
const GLYPH_STUB = "% glyphtounicode stub\n";

export async function POST(request: NextRequest) {
  let tmpDir: string | null = null;
  try {
    const body = await request.json();
    const tex = typeof body?.tex === "string" ? body.tex : null;
    if (!tex) return NextResponse.json({ error: "Missing tex" }, { status: 400 });

    tmpDir = await mkdtemp(join(tmpdir(), "resume-pdf-"));
    await writeFile(join(tmpDir, "resume.tex"), tex, "utf-8");
    await writeFile(join(tmpDir, "glyphtounicode.tex"), GLYPH_STUB, "utf-8");

    await execFileAsync("pdflatex", ["-interaction=nonstopmode", "-halt-on-error", "resume.tex"], {
      cwd: tmpDir,
      timeout: 15000,
    });

    const pdfBuffer = await readFile(join(tmpDir, "resume.pdf"));
    return new NextResponse(pdfBuffer, {
      headers: { "Content-Type": "application/pdf", "Content-Disposition": "inline; filename=resume.pdf" },
    });
  } catch (e) {
    const err = e as NodeJS.ErrnoException & { stderr?: string; stdout?: string };
    if (err.code === "ENOENT")
      return NextResponse.json(
        { error: "pdflatex not found. Install TeX Live (e.g. brew install --cask basictex)." },
        { status: 503 }
      );
    const msg = err.stderr ?? err.stdout ?? err.message ?? "Compilation failed";
    return NextResponse.json({ error: String(msg) }, { status: 500 });
  } finally {
    if (tmpDir) try { await rm(tmpDir, { recursive: true, force: true }); } catch (_) {}
  }
}
