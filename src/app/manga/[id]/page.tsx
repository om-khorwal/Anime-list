// src/app/manga/[id]/page.tsx
import React from "react";
import Link from "next/link";
import CoverImage from "../../components/CoverImage";

type ChapterSummary = {
  id: string;
  chapter: string;
  title: string;
  num: number | null;
  createdAt: string;
};

async function fetchJsonSafe(url: string, note = ""): Promise<any | null> {
  try {
    const res = await fetch(url, { next: { revalidate: 60 } });
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
    return { id: c.id, chapter: c.attributes.chapter || "", title: c.attributes.title || "", num: isNaN(num) ? null : num, createdAt: c.attributes.createdAt };
  });

  list.sort((a, b) => {
    if (a.num !== null && b.num !== null) return a.num - b.num;
    if (a.num !== null) return -1;
    if (b.num !== null) return 1;
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });

  return list;
}

async function getMangaAndChapters(id: string) {
  if (!id) throw new Error("missing manga id");
  const encId = encodeURIComponent(id);
  const placeholder = "/mangadex-placeholder.png";

  const mRes = await fetch(`https://api.mangadex.org/manga/${encId}`, { next: { revalidate: 120 } });
  if (!mRes.ok) {
    const body = await mRes.text().catch(() => "<no body>");
    console.error("manga fetch failed:", mRes.status, body);
    throw new Error(`manga fetch ${mRes.status}`);
  }
  const mangaJson = await mRes.json();

  const chapters = await fetchAllChapters(id);

  // cover
  const coverRel = mangaJson.data.relationships?.find((r: any) => r.type === "cover_art");
  let coverUrl: string = placeholder;
  if (coverRel) {
    const cr = await fetchJsonSafe(`https://api.mangadex.org/cover/${coverRel.id}`, "cover");
    const file = cr?.data?.attributes?.fileName;
    if (file) coverUrl = `/api/cover?manga=${encodeURIComponent(mangaJson.data.id)}&file=${encodeURIComponent(file)}`;
  }

  const title =
    mangaJson.data.attributes.title?.en ||
    (mangaJson.data.attributes.altTitles && mangaJson.data.attributes.altTitles.find((t: any) => t.en)?.en) ||
    Object.values(mangaJson.data.attributes.title || {})[0] ||
    "Untitled";

  const description = mangaJson.data.attributes.description?.en || Object.values(mangaJson.data.attributes.description || {})[0] || "";

  return {
    id: mangaJson.data.id,
    title,
    description,
    coverUrl,
    chapters,
  };
}

export default async function MangaDetails(props: any) {
  const id: string | undefined = props?.params?.id;
  if (!id) {
    return (
      <div className="p-6">
        <p className="text-red-500">Missing manga id.</p>
      </div>
    );
  }

  let data: any;
  try {
    data = await getMangaAndChapters(id);
  } catch (err) {
    console.error("getMangaAndChapters error:", err);
    return (
      <div className="p-6">
        <p className="text-red-500">Unable to load manga details.</p>
      </div>
    );
  }

  const latest = data.chapters.length ? data.chapters[data.chapters.length - 1] : null;

  return (
    <main className="p-6 max-w-5xl mx-auto text-white">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        <div className="md:col-span-1">
          <div className="rounded-2xl overflow-hidden shadow">
            <CoverImage src={data.coverUrl} alt={data.title} className="w-full h-auto object-cover" />
          </div>
        </div>

        <div className="md:col-span-2">
          <h1 className="text-2xl font-bold">{data.title}</h1>
          <p className="mt-2 text-sm text-neutral-600 line-clamp-6">{data.description}</p>
          <div className="mt-4 flex gap-3">
            {latest ? (
              <Link href={`/manga/${id}/chapter/${latest.id}`} className="inline-block px-4 py-2 bg-indigo-600 text-white rounded-md hover:opacity-90">Read Latest</Link>
            ) : (
              <span className="inline-block px-4 py-2 bg-neutral-200 text-neutral-700 rounded-md">No chapters</span>
            )}
            <Link href="/manga" className="inline-block px-4 py-2 border rounded-md">Back to list</Link>
          </div>

          <section className="mt-8">
            <h2 className="text-lg font-semibold mb-3">Chapters ({data.chapters.length})</h2>

            {data.chapters.length === 0 ? (
              <p className="text-sm text-neutral-500">No English chapters found.</p>
            ) : (
              <div className="grid grid-cols-1 gap-2">
                {data.chapters.slice().reverse().map((c: any) => (
                  <Link key={c.id} href={`/manga/${id}/chapter/${c.id}`} className="p-3 rounded-lg border hover:shadow-md flex justify-between items-center">
                    <div>
                      <div className="text-sm font-medium">Chapter {c.chapter || "Oneshot"}</div>
                      <div className="text-xs text-neutral-500">{c.title}</div>
                    </div>
                    <div className="text-xs text-neutral-400">{new Date(c.createdAt).toLocaleDateString()}</div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
