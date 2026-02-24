/**
 * Local ATS match: TF-IDF style bag-of-words + cosine similarity.
 * No AI/API - runs entirely in the browser.
 */

/** Tokenize text into lowercase words (letters + numbers) */
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/gi, " ")
    .split(/\s+/)
    .filter((w) => w.length > 1);
}

/** Build term frequency map */
function termFreq(tokens: string[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const t of tokens) {
    map.set(t, (map.get(t) ?? 0) + 1);
  }
  return map;
}

/** Cosine similarity between two term frequency vectors (0–1) */
function cosineSimilarity(
  vecA: Map<string, number>,
  vecB: Map<string, number>
): number {
  const allTerms = Array.from(new Set([...Array.from(vecA.keys()), ...Array.from(vecB.keys())]));
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < allTerms.length; i++) {
    const term = allTerms[i];
    const a = vecA.get(term) ?? 0;
    const b = vecB.get(term) ?? 0;
    dot += a * b;
    normA += a * a;
    normB += b * b;
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  if (denom === 0) return 0;
  return Math.max(0, Math.min(1, dot / denom));
}

/**
 * Compute ATS match score (0–1) between resume and job description.
 * Uses TF-IDF style weighting: terms that appear in both get higher weight.
 */
export function computeAtsScore(resumeText: string, jobText: string): number {
  const resumeTokens = tokenize(resumeText);
  const jobTokens = tokenize(jobText);

  if (resumeTokens.length === 0 || jobTokens.length === 0) return 0;

  const resumeTf = termFreq(resumeTokens);
  const jobTf = termFreq(jobTokens);

  return cosineSimilarity(resumeTf, jobTf);
}
