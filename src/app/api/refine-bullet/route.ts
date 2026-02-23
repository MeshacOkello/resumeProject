import { NextRequest, NextResponse } from "next/server";

/**
 * AI Bullet Optimizer: rewrites a bullet to be more impact-oriented (STAR-style).
 * Set OPENAI_API_KEY in env to enable. Without it, returns the original bullet.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const bullet = typeof body?.bullet === "string" ? body.bullet.trim() : "";
    if (!bullet) return NextResponse.json({ error: "Missing bullet" }, { status: 400 });

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ refined: bullet, message: "OPENAI_API_KEY not set; returning original." });
    }

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "Rewrite the user's resume bullet to be more impact-oriented. Use strong action verbs, quantify where possible (numbers, %), and keep it to one line. Output only the rewritten bullet, no explanation.",
          },
          { role: "user", content: bullet },
        ],
        max_tokens: 150,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ error: err || res.statusText }, { status: 500 });
    }

    const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const refined = data.choices?.[0]?.message?.content?.trim() ?? bullet;
    return NextResponse.json({ refined });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Refine failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
