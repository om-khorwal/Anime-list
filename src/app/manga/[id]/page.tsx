// src/app/manga/[id]/page.tsx
import React from "react";
import Link from "next/link";

async function fetchJsonSafe(url: string, note = "") {
  try {
    const res = await fetch(url, { next: { revalidate: 60 } });
    if (!res.ok) {
      const body = await res.text().catch(() => "<no body>");
      console.error(`[fetchJsonSafe] non-ok ${res.status} for ${note} -> ${url}`, body);
      return { ok: false, body };
    }
    return { ok: true, json: await res.json() };
  } catch (err) {
    console.error(`[fetchJsonSafe] error for ${note} -> ${url}`, err);
    return { ok: false, error: String(err) };
  }
}

async function fetchAllChapters(mangaId: string) {
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

  const list = all.map((c: any) => {
    const numRaw = c.attributes.chapter;
    const num = numRaw ? parseFloat(numRaw) : NaN;
    return { id: c.id, chapter: c.attributes.chapter || "", title: c.attributes.title || "", num: isNaN(num) ? null : num, createdAt: c.attributes.createdAt };
  });

  list.sort((a: any, b: any) => {
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
  let coverUrl: string | null = null;
  if (coverRel) {
    try {
      const cr = await fetch(`https://api.mangadex.org/cover/${coverRel.id}`);
      if (cr.ok) {
        const cj = await cr.json();
        const file = cj?.data?.attributes?.fileName;
        if (file) coverUrl = `https://uploads.mangadex.org/covers/${mangaJson.data.id}/${file}`;
      }
    } catch (e) {
      console.error("cover fetch error:", e);
    }
  }

  const title =
    mangaJson.data.attributes.title?.en ||
    (mangaJson.data.attributes.altTitles && mangaJson.data.attributes.altTitles.find((t: any) => t.en)?.en) ||
    Object.values(mangaJson.data.attributes.title || {})[0] ||
    "Untitled";

  return {
    id: mangaJson.data.id,
    title,
    description: mangaJson.data.attributes.description?.en || Object.values(mangaJson.data.attributes.description || {})[0] || "",
    coverUrl,
    chapters,
  };
}

export default async function MangaDetails({ params }: any) {
  const id = params?.id;
  let data;
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
    <main className="p-6 max-w-4xl mx-auto text-white">
      <div className="flex gap-6 items-start">
        <div className="w-40 flex-shrink-0 rounded-2xl overflow-hidden shadow">
          {data.coverUrl ? (
            <img src={data.coverUrl} alt={data.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-56 bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center">No Cover</div>
          )}
        </div>

        <div>
          <h1 className="text-2xl font-bold">{data.title}</h1>
          <p className="mt-2 text-sm text-neutral-600 line-clamp-6">{data.description}</p>
          <div className="mt-4">
            {latest ? (
              <Link href={`/manga/${id}/chapter/${latest.id}`} className="inline-block px-4 py-2 bg-indigo-600 text-white rounded-md hover:opacity-90 mr-3">Read Latest</Link>
            ) : (
              <span className="inline-block px-4 py-2 bg-neutral-200 text-neutral-700 rounded-md mr-3">No chapters</span>
            )}
            <Link href="/manga" className="inline-block px-4 py-2 border rounded-md">Back to list</Link>
          </div>
        </div>
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
    </main>
  );
}
