// src/app/api/manga/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  const MANGA_API = "https://api.mangadex.org/manga?limit=6";

  try {
    const res = await fetch(MANGA_API);
    const status = res.status;

    // Collect headers (safe to inspect)
    const headersObj: Record<string, string> = {};
    res.headers.forEach((v, k) => (headersObj[k] = v));

    // Read a snippet of the body to avoid huge payloads
    const bodyText = await res.text();
    const snippet = bodyText.slice(0, 1000);

    return NextResponse.json(
      {
        ok: res.ok,
        status,
        headers: headersObj,
        bodySnippet: snippet,
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("[/api/manga] fetch error:", err?.message ?? err);
    return NextResponse.json(
      { ok: false, error: String(err?.message ?? err) },
      { status: 502 }
    );
  }
}
