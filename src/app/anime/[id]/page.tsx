"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

type ImageSet = { image_url?: string; large_image_url?: string };
type Anime = {
  mal_id: number;
  url?: string;
  title: string;
  title_english?: string;
  images?: { jpg?: ImageSet; webp?: ImageSet };
  synopsis?: string;
  score?: number;
  rank?: number;
  popularity?: number;
  members?: number;
  episodes?: number;
  duration?: string;
  status?: string;
  type?: string;
  rating?: string;
  season?: string;
  year?: number;
  aired?: { string?: string };
  studios?: { name: string }[];
  producers?: { name: string }[];
  genres?: { name: string }[];
  themes?: { name: string }[];
  demographics?: { name: string }[];
  trailer?: { youtube_id?: string; embed_url?: string };
};

export default function AnimeDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [anime, setAnime] = useState<Anime | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const controller = new AbortController();

    const fetchAnime = async () => {
      try {
        setLoading(true);
        setErr(null);
        const res = await fetch(`https://api.jikan.moe/v4/anime/${id}`, {
          signal: controller.signal,
          headers: { "Content-Type": "application/json" },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setAnime(data?.data as Anime);
      } catch (e: any) {
        if (e?.name !== "AbortError") setErr(e?.message || "Failed to load");
      } finally {
        setLoading(false);
      }
    };

    fetchAnime();
    return () => controller.abort();
  }, [id]);

  const cover = useMemo(
    () =>
      anime?.images?.webp?.large_image_url ||
      anime?.images?.jpg?.large_image_url ||
      anime?.images?.jpg?.image_url,
    [anime]
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 border-4 border-accent border-t-transparent rounded-full animate-spin" />
          <p className="text-foreground/70 text-sm">Loading anime details...</p>
        </div>
      </div>
    );
  }

  if (!anime || err) {
    return (
      <div className="min-h-screen bg-background text-foreground p-6 flex flex-col items-center justify-center text-center">
        <button
          onClick={() => router.back()}
          className="mb-6 px-4 py-2 rounded-lg border border-border bg-background hover:bg-surface transition"
        >
          ← Back
        </button>
        <div className="text-lg font-semibold">
          {err ? `Error: ${err}` : "Anime not found 😢"}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-black text-foreground relative">
      {/* Blurred top banner */}
      <div
        className="absolute inset-0 -z-10 blur-3xl opacity-40"
        style={{
          background: `url(${cover}) center/cover no-repeat`,
          filter: "blur(60px)",
        }}
      />

      <main className="mx-auto max-w-6xl px-6 py-10 relative z-10">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="px-4 py-2 mb-8 rounded-lg bg-surface/50 border border-border hover:bg-surface/70 transition backdrop-blur-sm text-sm"
        >
          ← Back
        </button>

        {/* Hero Section */}
        <section className="flex flex-col lg:flex-row gap-10">
          {/* Poster */}
          <div className="lg:w-1/3 flex flex-col items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={cover || "/placeholder.png"}
              alt={anime.title_english || anime.title}
              className="w-72 h-auto rounded-xl border border-border shadow-lg object-cover"
            />

            {/* Buttons */}
            <div className="mt-5 flex gap-3">
              {anime.trailer?.youtube_id && (
                <a
                  href={`https://www.youtube.com/watch?v=${anime.trailer.youtube_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg bg-accent text-black px-4 py-2 font-medium hover:opacity-90 transition text-sm"
                >
                  ▶ Trailer
                </a>
              )}
              {anime.url && (
                <a
                  href={anime.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg border border-border bg-background/80 px-4 py-2 text-sm hover:bg-surface transition"
                >
                  View on MAL
                </a>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="lg:w-2/3 space-y-6">
            {/* Title */}
            <div>
              <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight">
                <span className="bg-gradient-to-br from-accent to-foreground bg-clip-text text-transparent">
                  {anime.title_english || anime.title}
                </span>
              </h1>
              <p className="mt-2 text-sm text-foreground/60 italic">
                {anime.title !== anime.title_english && anime.title}
              </p>
            </div>

            {/* Info badges */}
            <div className="flex flex-wrap gap-2">
              {[
                anime.type,
                anime.status,
                `${anime.episodes || "?"} eps`,
                anime.year ? `${anime.year}` : null,
              ]
                .filter(Boolean)
                .map((b, i) => (
                  <span
                    key={i}
                    className="text-[11px] rounded-full border border-border px-3 py-1 backdrop-blur-sm bg-surface/60"
                  >
                    {b}
                  </span>
                ))}
            </div>

            {/* Synopsis */}
            <div className="rounded-xl bg-surface/40 border border-border p-5 backdrop-blur-md">
              <h2 className="text-lg font-semibold mb-2">Synopsis</h2>
              <p className="text-sm text-foreground/80 leading-relaxed">
                {anime.synopsis || "No synopsis available."}
              </p>
            </div>

            {/* Meta Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <MetaCard label="Score" value={anime.score ?? "—"} />
              <MetaCard label="Rank" value={anime.rank ? `#${anime.rank}` : "—"} />
              <MetaCard label="Popularity" value={anime.popularity ? `#${anime.popularity}` : "—"} />
              <MetaCard label="Episodes" value={anime.episodes ?? "—"} />
              <MetaCard label="Duration" value={anime.duration ?? "—"} />
              <MetaCard label="Rating" value={anime.rating ?? "—"} />
              <MetaCard label="Studios" value={anime.studios?.map((s) => s.name).join(", ") || "—"} />
              <MetaCard label="Genres" value={anime.genres?.map((g) => g.name).join(", ") || "—"} />
              <MetaCard label="Aired" value={anime.aired?.string ?? "—"} />
            </div>

            {/* Embedded Trailer */}
            {anime.trailer?.embed_url && (
              <div className="rounded-xl border border-border overflow-hidden bg-surface/40 backdrop-blur-sm">
                <div className="aspect-video">
                  <iframe
                    src={anime.trailer.embed_url}
                    title="Trailer"
                    className="h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

function MetaCard({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-surface/50 backdrop-blur-sm p-4">
      <div className="text-xs uppercase tracking-wide text-foreground/50">{label}</div>
      <div className="mt-1 text-sm font-medium">{value}</div>
    </div>
  );
}
  