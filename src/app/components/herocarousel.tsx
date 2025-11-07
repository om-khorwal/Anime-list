"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";

type ImageSet = { image_url?: string; large_image_url?: string };
type TopAnimeItem = {
  mal_id: number;
  title: string;
  synopsis?: string;
  images?: { jpg?: ImageSet; webp?: ImageSet };
};
type TopAnimeResponse = { data: TopAnimeItem[] };

export default function HeroCarousel({
  onExploreClick,
}: {
  onExploreClick?: () => void;
}) {
  const [items, setItems] = useState<TopAnimeItem[]>([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const abortRef = useRef<AbortController | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // fetch some great posters
  useEffect(() => {
    const controller = new AbortController();
    abortRef.current = controller;

    (async () => {
      try {
        setLoading(true);
        // top anime gives nice posters; limit to 8 for perf
        const res = await fetch(
          "https://api.jikan.moe/v4/top/anime?limit=8",
          { signal: controller.signal }
        );
        if (!res.ok) throw new Error("Failed to load posters");
        const json: TopAnimeResponse = await res.json();
        setItems(json.data || []);
      } catch (_) {
        setItems([]);
      } finally {
        setLoading(false);
      }
    })();

    return () => controller.abort();
  }, []);

  // autoplay with pause when tab hidden
  useEffect(() => {
    const schedule = () => {
      clearTimer();
      timerRef.current = setTimeout(() => {
        setIndex((i) => (items.length ? (i + 1) % items.length : 0));
      }, 4500);
    };
    const onVis = () => {
      if (document.hidden) clearTimer();
      else schedule();
    };
    if (items.length) schedule();
    document.addEventListener("visibilitychange", onVis);
    return () => {
      document.removeEventListener("visibilitychange", onVis);
      clearTimer();
    };

    function clearTimer() {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [items, index]);

  const current = items[index];
  const bg = useMemo(
    () =>
      current?.images?.webp?.large_image_url ||
      current?.images?.jpg?.large_image_url ||
      current?.images?.jpg?.image_url ||
      "",
    [current]
  );

  return (
    <section
      aria-label="Featured anime"
      className="relative h-[100svh] w-full overflow-hidden bg-black"
    >
      {/* Slides */}
      <div className="absolute inset-0">
        <AnimatePresence mode="wait">
          {!loading && bg && (
            <motion.img
              key={bg + index}
              src={bg}
              alt={current?.title || "Poster"}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.1, ease: "easeOut" }}
              className="absolute inset-0 h-full w-full object-cover"
              loading="eager"
            />
          )}
        </AnimatePresence>

        {/* Dark gradients for readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/10" />
        <div className="absolute inset-0 bg-[radial-gradient(70%_60%_at_50%_40%,rgba(0,0,0,0.0),rgba(0,0,0,0.55))]" />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full">
        <div className="mx-auto flex h-full max-w-7xl flex-col justify-end px-6 pb-16">
          {/* Badge row */}
          <div className="mb-4 flex flex-wrap gap-2">
            <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] text-white/90 backdrop-blur">
              Browse. Filter. Discover.
            </span>
            <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] text-white/90 backdrop-blur">
              Powered by Jikan API
            </span>
          </div>

          {/* Headline + subcopy */}
          <h1 className="text-balance text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white drop-shadow-[0_2px_20px_rgba(0,0,0,.35)]">
            Find Your Next Favorite Anime
          </h1>
          <p className="mt-3 max-w-2xl text-pretty text-base sm:text-lg text-white/80">
            Ani-Ike helps you explore seasonal hits and timeless classics with
            powerful search, smart filters, and a clean, fast UI.
          </p>

          {/* CTAs */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={onExploreClick}
              className="rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 px-5 py-2.5 font-semibold text-white shadow-md hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 transition"
            >
              Explore Now
            </button>
            <Link
              href="/about"
              className="rounded-lg border border-white/20 bg-white/10 px-5 py-2.5 font-medium text-white/90 backdrop-blur hover:bg-white/15 transition"
            >
              Learn More
            </Link>
          </div>

          {/* Carousel controls */}
          <div className="mt-8 flex items-center gap-3">
            {/* Prev/Next */}
            <button
              aria-label="Previous"
              onClick={() =>
                setIndex((i) => (items.length ? (i - 1 + items.length) % items.length : 0))
              }
              className="rounded-md border border-white/20 bg-white/10 px-3 py-1.5 text-sm text-white/90 hover:bg-white/15 backdrop-blur transition"
            >
              ‹
            </button>
            <button
              aria-label="Next"
              onClick={() => setIndex((i) => (items.length ? (i + 1) % items.length : 0))}
              className="rounded-md border border-white/20 bg-white/10 px-3 py-1.5 text-sm text-white/90 hover:bg-white/15 backdrop-blur transition"
            >
              ›
            </button>

            {/* Dots */}
            <div className="ml-2 flex items-center gap-2">
              {items.map((_, i) => (
                <button
                  key={i}
                  aria-label={`Go to slide ${i + 1}`}
                  onClick={() => setIndex(i)}
                  className={`h-2.5 w-2.5 rounded-full transition ${
                    i === index ? "bg-white" : "bg-white/40 hover:bg-white/70"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Current title */}
          {current?.title && (
            <div className="mt-4 text-sm text-white/80">
              Now featuring: <span className="font-medium">{current.title}</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
