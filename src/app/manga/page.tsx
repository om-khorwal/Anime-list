// src/app/manga/page.tsx
import React from "react";
import Link from "next/link";
import CoverImage from "../components/CoverImage";
import fs from "fs";
import path from "path";

type MangaCard = {
  id: string;
  title: string;
  description: string;
  coverUrl: string | null;
  tags: string[];
};

/**
 * fetch with abort + limited retries
 * - timeoutMs: per-request timeout
 * - retries: number of extra attempts after first (0 = no retry)
 */
async function fetchWithTimeoutAndRetries(url: string, opts: RequestInit = {}, timeoutMs = 30000, retries = 1): Promise<Response> {
  let attempt = 0;
  let lastErr: any = null;

  while (attempt <= retries) {
    attempt++;
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const res = await fetch(url, { signal: controller.signal, ...opts });
      clearTimeout(id);
      if (!res.ok) throw new Error(`non-ok ${res.status}`);
      return res;
    } catch (err: any) {
      clearTimeout(id);
      lastErr = err;
      const isTimeout = err?.name === "AbortError" || (err?.cause && err.cause.code === "UND_ERR_CONNECT_TIMEOUT");
      console.warn(`[fetchWithTimeout] attempt ${attempt} failed for ${url}: ${String(err).slice(0,200)}${isTimeout ? " (timeout)" : ""}`);
      if (attempt > retries) break;
      const backoffMs = 400 * Math.pow(2, attempt - 1);
      await new Promise((r) => setTimeout(r, backoffMs));
    }
  }

  throw lastErr;
}

/**
 * Try remote API; if it fails, read a local sample fallback file (public/sample-manga.json)
 */
async function fetchJsonSafe(url: string, note = ""): Promise<any | null> {
  try {
    const res = await fetchWithTimeoutAndRetries(url, { next: { revalidate: 60 } }, 30000, 1);
    const json = await res.json();
    return json;
  } catch (err) {
    console.error(`[fetchJsonSafe] error for ${note} -> ${url}`, err);

    // attempt to use local fallback file
    try {
      const fallbackPath = path.join(process.cwd(), "public", "sample-manga.json");
      if (fs.existsSync(fallbackPath)) {
        const txt = fs.readFileSync(fallbackPath, "utf8");
        try {
          const j = JSON.parse(txt);
          console.warn("[fetchJsonSafe] using local fallback sample-manga.json");
          return j;
        } catch (parseErr) {
          console.error("[fetchJsonSafe] fallback JSON parse error", parseErr);
        }
      } else {
        console.warn("[fetchJsonSafe] no local fallback file found at", fallbackPath);
      }
    } catch (fsErr) {
      console.error("[fetchJsonSafe] fallback read error", fsErr);
    }

    return null;
  }
}

async function getMangaList(): Promise<MangaCard[]> {
  const API = "https://api.mangadex.org/manga?limit=24&availableTranslatedLanguage[]=en";
  const json = await fetchJsonSafe(API, "manga list");
  if (!json?.data) return [];

  const list: MangaCard[] = await Promise.all(
    json.data.map(async (m: any) => {
      const title =
        m.attributes?.title?.en ||
        (m.attributes?.altTitles && m.attributes.altTitles.find((t: any) => t.en)?.en) ||
        Object.values(m.attributes?.title || {})[0] ||
        "Untitled";

      const coverRel = m.relationships?.find((r: any) => r.type === "cover_art");
      let coverUrl: string | null = null;
      if (coverRel) {
        const cr = await fetchJsonSafe(`https://api.mangadex.org/cover/${coverRel.id}`, "cover");
        const file = cr?.data?.attributes?.fileName;
        if (file) coverUrl = `/api/cover?manga=${encodeURIComponent(m.id)}&file=${encodeURIComponent(file)}`;
      }

      const tags = (m.attributes?.tags || []).slice(0, 3).map((t: any) => t.attributes?.name?.en || Object.values(t.attributes?.name || {})[0] || "");

      return {
        id: m.id,
        title,
        description: m.attributes?.description?.en || Object.values(m.attributes?.description || {})[0] || "",
        coverUrl,
        tags,
      };
    })
  );

  return list;
}

export default async function MangaPage(_: any) {
  let list: MangaCard[] = [];
  try {
    list = await getMangaList();
  } catch (err) {
    console.error("getMangaList failed:", err);
    list = [];
  }

  return (
    <main className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-extrabold mb-6">Manga — English first</h1>

      {list.length === 0 ? (
        <div className="p-6 rounded-lg bg-neutral-50 dark:bg-neutral-900">
          <p className="text-neutral-600 dark:text-neutral-300">
            Unable to fetch manga right now — the remote API may be temporarily unreachable.
          </p>
          <div className="mt-4">
            <button
              onClick={() => {
                // client-side reload; this is a server component so use simple reload
                if (typeof window !== "undefined") window.location.reload();
              }}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md"
            >
              Retry
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {list.map((m) => (
            <Link key={m.id} href={`/manga/${m.id}`} className="group block">
              <div className="overflow-hidden rounded-2xl shadow-lg bg-white dark:bg-neutral-800 transform transition hover:scale-[1.01]">
                <div className="w-full h-56 bg-neutral-100 dark:bg-neutral-700">
                  {m.coverUrl ? (
                    <CoverImage src={m.coverUrl} alt={m.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                  ) : (
                    <div className="w-full h-56 bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center text-neutral-500">No Cover</div>
                  )}
                </div>

                <div className="p-4">
                  <h2 className="text-sm font-semibold leading-tight mb-1 truncate">{m.title}</h2>
                  <p className="text-xs text-neutral-500 line-clamp-3 mb-3">{m.description}</p>
                  <div className="flex gap-2 flex-wrap">
                    {m.tags.map((t, idx) => (
                      <span key={idx} className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-900/40">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
