# Resume Generator — LaTeX PDF

Web-based resume generator with **Jake's LaTeX template**. Split-screen: structured form on the left, **live-rendered PDF** on the right. Export `.pdf` and `.tex`, save/load data, ATS keyword scanner, theme toggles, drag-and-drop section order, and optional AI bullet refinement.

## Features

- **Data → LaTeX mapping**: Form fields map to `\resumeSubheading`, `\resumeItem`, `\resumeProjectHeading`, etc. All user input is escaped for LaTeX (`&`, `%`, `$`, etc.).
- **Dynamic lists**: Add/remove Education, Experience, and Projects entries and bullets.
- **Technical skills**: User-defined categories (e.g. Languages, Frameworks) and comma-separated items.
- **Live PDF**: On input change (debounced), the app builds the .tex, runs `pdflatex`, and shows the PDF in an iframe.
- **Download PDF / Export .tex**: Use the current compiled PDF and the generated .tex file.
- **Save / Load**: LocalStorage plus JSON file import/export.
- **Section order**: Drag-and-drop (dnd-kit) to reorder Education, Experience, Projects, Skills in the PDF.
- **Visibility**: Eye icon on each entry to hide/show in the export (keeps a “master list”).
- **Theme**: Font (default, Roboto, Source Sans Pro), top margin, compact line spacing.
- **ATS scanner**: Paste a job description; see matched vs. missing keywords.
- **Overflow warning**: Alert when content may spill to page 2.
- **AI bullet optimizer**: “Refine” on any bullet calls an optional API (OpenAI) to rewrite for impact. Set `OPENAI_API_KEY` in `.env.local` to enable.

## Requirements

- **Node.js** 18+
- **pdflatex** (TeX Live or BasicTeX) for live PDF. Without it, the app still runs; you can export .tex and compile elsewhere.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Optional: create `.env.local` with `OPENAI_API_KEY=sk-...` to enable the “Refine” button on bullets.

## Tech stack

- **Next.js 14** (App Router), **TypeScript**, **Tailwind CSS**
- **react-hook-form** + **useFieldArray** for nested form state
- **Zod** for schema (resume types)
- **@dnd-kit** for section reordering
- **API route** runs `pdflatex` to compile the filled Jake template

## Template

The app uses the provided Jake Gutierrez / sb2nov LaTeX template. Only the body placeholders (name, contact, education block, experience block, projects block, technical skills) are replaced; preamble and macros are unchanged.
