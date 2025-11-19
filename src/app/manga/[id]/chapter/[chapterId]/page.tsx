// src/app/manga/[id]/chapter/[chapterId]/page.tsx
import React from "react";
import Link from "next/link";

type ChapterSummary = {
  id: string;
  chapter: string;
  title: string;
  num: number | null;
  createdAt: string;
};

/** Safe fetch helper */
async function fetchJsonSafe(url: string, note = ""): Promise<any | null> {
  try {
    const res = await fetch(url, { next: { revalidate: 30 } });
    if (!res.ok) {
      const body = await res.text().catch(() => "<no body>");
      console.error(`[fetchJsonSafe] non-ok ${res.status} for ${note} -> ${url}`, body);
      return null;
    }
    return await res.json();
  } catch (err) {
    console.error(`[fetchJsonSafe] error for ${note} -> ${url}`, err);
    return null;
  }
}

/** Fetch ALL English chapters with pagination */
async function fetchAllChapters(mangaId: string): Promise<ChapterSummary[]> {
  if (!mangaId) return [];
  const enc = encodeURIComponent(mangaId);
  const limit = 100;
  let offset = 0;
  let all: any[] = [];

  while (true) {
    const url = `https://api.mangadex.org/chapter?manga=${enc}&translatedLanguage[]=en&limit=${limit}&offset=${offset}&order[chapter]=asc`;
    const res = await fetch(url, { next: { revalidate: 60 } });

    if (!res.ok) {
      const body = await res.text().catch(() => "<no body>");
      console.error("chapters fetch non-ok:", res.status, body, "requestUrl:", url);
      break;
    }

    const json = await res.json();
    const items = json.data || [];
    all = all.concat(items);

    if (!json.total || all.length >= json.total || items.length < limit) break;

    offset += limit;
  }

  const list: ChapterSummary[] = all.map((c: any) => {
    const numRaw = c.attributes.chapter;
    const num = numRaw ? parseFloat(numRaw) : NaN;
    return {
      id: c.id,
      chapter: c.attributes.chapter || "",
      title: c.attributes.title || "",
      num: isNaN(num) ? null : num,
      createdAt: c.attributes.createdAt,
    };
  });

  // Sort numeric first, fallback to createdAt ASC
  list.sort((a, b) => {
    if (a.num !== null && b.num !== null) return a.num - b.num;
    if (a.num !== null) return -1;
    if (b.num !== null) return 1;
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });

  return list;
}

/** Load chapter pages (image URLs) */
async function getChapterPages(chapterId: string): Promise<string[] | null> {
  if (!chapterId) return null;
  const enc = encodeURIComponent(chapterId);
  const json = await fetchJsonSafe(`https://api.mangadex.org/at-home/server/${enc}`, "at-home");
  if (!json || !json.chapter) return null;

  const base = json.baseUrl;
  const hash = json.chapter.hash;
  const files: string[] = json.chapter.data || [];

  return files.map((f) => `${base}/data/${hash}/${f}`);
}

/**
 * NOTE:
 * We intentionally accept a loosely typed `props: any` here to avoid
 * Next.js/build-time PageProps mismatch issues on Vercel.
 *
 * Internally we validate types and use strong types for variables.
 */
export default async function ChapterReader(props: any) {
  const params: { id?: string; chapterId?: string } = props?.params ?? {};
  const mangaId = params.id;
  const chapterId = params.chapterId;

  if (!mangaId) {
    return (
      <main className="p-6 max-w-4xl mx-auto">
        <div className="p-6 rounded-lg bg-red-50 text-red-700">
          Missing manga ID. Go back to <Link href="/manga" className="underline">Manga List</Link>.
        </div>
      </main>
    );
  }

  if (!chapterId) {
    return (
      <main className="p-6 max-w-4xl mx-auto">
        <div className="p-6 rounded-lg bg-yellow-50 text-yellow-800">
          No chapter selected. Go back to <Link href={`/manga/${mangaId}`} className="underline">Manga Page</Link>.
        </div>
      </main>
    );
  }

  // Explicitly typed list
  let list: ChapterSummary[] = [];
  try {
    list = await fetchAllChapters(mangaId);
  } catch (err) {
    console.error("fetchAllChapters error:", err);
    list = [];
  }

  let pages: string[] | null = null;
  try {
    pages = await getChapterPages(chapterId);
  } catch (err) {
    console.error("getChapterPages error:", err);
    pages = null;
  }

  const idx = list.findIndex((c) => c.id === chapterId);
  const prev = idx > 0 ? list[idx - 1] : null;
  const next = idx >= 0 && idx < list.length - 1 ? list[idx + 1] : null;

  return (
    <main className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Link href={`/manga/${mangaId}`} className="text-sm text-neutral-600 hover:underline">← Back</Link>
          <span className="text-xs text-neutral-500">ID: {chapterId}</span>
        </div>

        <div className="flex gap-2">
          {prev && <Link href={`/manga/${mangaId}/chapter/${prev.id}`} className="px-3 py-1 border rounded-md text-sm">← Prev</Link>}
          {next && <Link href={`/manga/${mangaId}/chapter/${next.id}`} className="px-3 py-1 bg-indigo-600 text-white rounded-md text-sm">Next →</Link>}
        </div>
      </div>

      {pages === null ? (
        <div className="p-6 rounded-lg bg-red-50 text-red-700">Unable to load chapter pages.</div>
      ) : pages.length === 0 ? (
        <div className="p-6 rounded-lg bg-yellow-50 text-yellow-800">
          No pages found for this chapter. It might be removed.
        </div>
      ) : (
        <div className="space-y-6">
          {pages.map((src, i) => (
            <img key={i} src={src} alt={`Page ${i + 1}`} className="w-full rounded-lg shadow" loading="lazy" />
          ))}
        </div>
      )}

      <div className="mt-8 flex justify-between">
        {prev ? <Link href={`/manga/${mangaId}/chapter/${prev.id}`} className="px-4 py-2 border rounded-md">← Prev</Link> : <div />}
        {next ? <Link href={`/manga/${mangaId}/chapter/${next.id}`} className="px-4 py-2 bg-indigo-600 text-white rounded-md">Next →</Link> : <div />}
      </div>
    </main>
  );
}
