// src/app/manga/page.tsx
import React from "react";
import Link from "next/link";

type MangaCard = {
  id: string;
  title: string;
  description: string;
  coverUrl: string | null;
  tags: string[];
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

async function getMangaList(): Promise<MangaCard[]> {
  const API = "https://api.mangadex.org/manga?limit=24&availableTranslatedLanguage[]=en";
  const json = await fetchJsonSafe(API, "manga list");
  if (!json?.data) return [];

  const list: MangaCard[] = await Promise.all(
    json.data.map(async (m: any) => {
      const title =
        m.attributes.title?.en ||
        (m.attributes.altTitles && m.attributes.altTitles.find((t: any) => t.en)?.en) ||
        Object.values(m.attributes.title || {})[0] ||
        "Untitled";

      const coverRel = m.relationships?.find((r: any) => r.type === "cover_art");
      let coverUrl: string | null = null;
      if (coverRel) {
        const cr = await fetchJsonSafe(`https://api.mangadex.org/cover/${coverRel.id}`, "cover");
        const file = cr?.data?.attributes?.fileName;
        if (file) coverUrl = `https://uploads.mangadex.org/covers/${m.id}/${file}`;
      }

      const tags = (m.attributes.tags || []).slice(0, 3).map((t: any) => t.attributes.name?.en || Object.values(t.attributes.name || {})[0]);

      return {
        id: m.id,
        title,
        description: m.attributes.description?.en || Object.values(m.attributes.description || {})[0] || "",
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
  }

  return (
    <main className="p-6 max-w-7xl mx-auto text-white">
      <h1 className="text-3xl font-extrabold mb-6">Manga — English first</h1>

      {list.length === 0 ? (
        <div className="p-6 rounded-lg bg-neutral-50 dark:bg-neutral-900">
          <p className="text-neutral-600 dark:text-neutral-300">No manga available right now. Try again in a moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {list.map((m) => (
            <Link key={m.id} href={`/manga/${m.id}`} className="group block">
              <div className="overflow-hidden rounded-2xl shadow-lg bg-white dark:bg-neutral-800">
                {m.coverUrl ? (
                  <img src={m.coverUrl} alt={m.title} className="w-full h-56 object-cover transition-transform duration-300 group-hover:scale-105" />
                ) : (
                  <div className="w-full h-56 bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center text-neutral-500">No Cover</div>
                )}
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
