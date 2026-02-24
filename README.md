# Resume Generator — LaTeX PDF

Web-based resume generator with **Jake's LaTeX template**. Split-screen: structured form on the left, **live-rendered PDF** on the right. Export `.pdf` and `.tex`, save/load data, theme toggles, and drag-and-drop section order.

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
- **Overflow warning**: Alert when content may spill to page 2.
- **ATS match score**: Paste a job description; local TF-IDF cosine similarity (0–100%) — no AI/API.

## Requirements

- **Node.js** 18+
- **pdflatex** (TeX Live or BasicTeX) for live PDF. Without it, the app still runs; you can export .tex and compile elsewhere.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy to Amplify (or Vercel)

The download counter requires a persistent store. On serverless (Amplify, Vercel), the filesystem does not persist. Use **Upstash Redis** (free tier):

1. Create a free database at [console.upstash.com](https://console.upstash.com)
2. Copy the REST URL and token from the database details
3. In Amplify: **App settings → Environment variables** → Add:
   - `UPSTASH_REDIS_REST_URL` = your REST URL
   - `UPSTASH_REDIS_REST_TOKEN` = your token
4. Redeploy the app

Without these env vars, the download count will stay at 0 on Amplify.

## Tech stack

- **Next.js 14** (App Router), **TypeScript**, **Tailwind CSS**
- **react-hook-form** + **useFieldArray** for nested form state
- **Zod** for schema (resume types)
- **@dnd-kit** for section reordering
- **API route** runs `pdflatex` to compile the filled Jake template

## Template

The app uses the provided Jake Gutierrez / sb2nov LaTeX template. Only the body placeholders (name, contact, education block, experience block, projects block, technical skills) are replaced; preamble and macros are unchanged.
