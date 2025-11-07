"use client";
import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import HeroCarousel from "../app/components/herocarousel";

/** Debounce helper */
function useDebounce<T>(value: T, delay = 500) {
  const [v, setV] = React.useState(value);
  React.useEffect(() => {
    const id = setTimeout(() => setV(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return v;
}

/** Rating options + matching tokens used for client-side filtering */
const RATING_OPTIONS = [
  { value: "", label: "All Ratings", match: "" },
  { value: "g", label: "G - All Ages", match: "G" },
  { value: "pg", label: "PG - Children", match: "PG" },
  { value: "pg13", label: "PG-13 - Teens 13+", match: "PG-13" },
  { value: "r17", label: "R - 17+ (Violence & Profanity)", match: "R - 17+" },
  { value: "r", label: "R+ - Mild Nudity", match: "R+" },
  { value: "rx", label: "Rx - Hentai", match: "Rx" },
] as const;

type JikanImage = { image_url?: string };
type JikanItem = {
  mal_id: number;
  title: string;
  title_english?: string;
  status?: string; // "Currently Airing" | "Finished Airing" | "Not yet aired"
  type?: string;   // "TV" | "Movie" | "OVA" | "ONA" | "Special"
  score?: number;
  rating?: string; // e.g., "PG-13 - Teens 13 or older"
  images?: { jpg?: JikanImage };
};
type JikanResponse = {
  data: JikanItem[];
  pagination?: {
    has_next_page?: boolean;
    current_page?: number;
    last_visible_page?: number;
  };
};

export default function Home() {
  // UI state
  const [searchTerm, setSearchTerm] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("");
  const [typeFilter, setTypeFilter] = React.useState("");
  const [ratingFilter, setRatingFilter] = React.useState<"" | "g" | "pg" | "pg13" | "r17" | "r" | "rx">("");
  const [year, setYear] = React.useState(String(new Date().getFullYear()));
  const [page, setPage] = React.useState(1);

  // data state
  const [data, setData] = React.useState<JikanResponse | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const debouncedSearch = useDebounce(searchTerm, 500);
  const abortRef = React.useRef<AbortController | null>(null);

  const fetchAnime = React.useCallback(async () => {
    setLoading(true);
    setError(null);

    // cancel in-flight request
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const base = "https://api.jikan.moe/v4";

    // If searching, use /anime with server-side rating filter
    // If not searching, use /seasons/{year}/spring (rating filtered client-side)
    const ratingParam = ratingFilter ? `&rating=${ratingFilter}` : "";
    const url =
      debouncedSearch.trim().length > 0
        ? `${base}/anime?q=${encodeURIComponent(debouncedSearch)}&page=${page}${ratingParam}`
        : `${base}/seasons/${year}/spring?sfw&page=${page}`;

    try {
      const res = await fetch(url, {
        signal: controller.signal,
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      const json = (await res.json()) as JikanResponse;
      setData(json);
    } catch (e: any) {
      if (e?.name !== "AbortError") {
        setError(e?.message || "Something went wrong.");
        setData({ data: [] });
      }
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, page, year, ratingFilter]);

  // reset page when year changes
  React.useEffect(() => {
    setPage(1);
  }, [year]);

  // fetch when deps change
  React.useEffect(() => {
    fetchAnime();
    return () => abortRef.current?.abort();
  }, [fetchAnime]);

  // client-side filter helpers
  const ratingMatch = React.useMemo(
    () => RATING_OPTIONS.find(r => r.value === ratingFilter)?.match ?? "",
    [ratingFilter]
  );

  const filtered =
    data?.data?.filter((item) => {
      const okStatus = statusFilter ? item.status === statusFilter : true;
      const okType = typeFilter ? item.type === typeFilter : true;

      // If not searching (season endpoint), apply rating client-side using the string prefix (e.g., "PG-13", "R+")
      const okRating =
        ratingFilter && debouncedSearch.trim().length === 0
          ? (item.rating ? item.rating.toUpperCase().startsWith(ratingMatch.toUpperCase()) : false)
          : true;

      return okStatus && okType && okRating;
    }) ?? [];

  const hasNext = Boolean(data?.pagination?.has_next_page);
  const showEmpty = !loading && filtered.length === 0 && !error;

  return (
    
    <div className="relative w-full flex flex-col items-center bg-gradient-to-b from-neutral-950 to-neutral-900 text-neutral-100">
      {/* soft page glow */}
      <div className="relative w-full flex flex-col items-center bg-gradient-to-b from-neutral-950 to-neutral-900 text-neutral-100">
      {/* HERO */}
      <HeroCarousel onExploreClick={() => {
        document.getElementById("discover")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }} />

      {/* Your existing sticky controls + grid */}
      <section id="discover" className="w-full sticky top-[64px] z-30 border-y border-white/10 bg-neutral-900/70 backdrop-blur-xl">
        {/* ...controls bar */}
      </section>

      {/* ...rest of your content */}
    </div>

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_-10%,rgba(99,102,241,0.18),transparent_70%)]" />

      {/* Hero */}
      <section className="w-full text-center mt-20 mb-6 px-6 relative z-10">
        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-5xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 via-fuchsia-400 to-cyan-300 bg-clip-text text-transparent"
        >
          Explore the World of Anime
        </motion.h1>
        <p className="mt-3 text-neutral-300">
          Search, filter, and discover what to watch next — effortlessly.
        </p>
      </section>

      {/* Controls Bar (sticky, dark-first) */}
      <section className="w-full sticky top-[0px] z-30 border-y border-white/10 bg-neutral-900/70 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col gap-3">
          {/* Search row */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <input
              type="text"
              placeholder="Search anime…"
              value={searchTerm}
              onChange={(e) => {
                setPage(1);
                setSearchTerm(e.target.value);
              }}
              className="w-full sm:w-96 rounded-xl border border-white/10 bg-neutral-800/80 px-4 py-2 text-neutral-100 placeholder:text-neutral-400 outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:border-transparent transition"
            />
            <button
              onClick={() => {
                setPage(1);
                fetchAnime();
              }}
              className="rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-4 py-2 font-semibold hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 transition"
            >
              Search
            </button>
          </div> 

          {/* Filters row */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Year */}
            <select
              aria-label="Year"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="rounded-lg border border-white/10 bg-neutral-800/80 px-3 py-2 text-neutral-100 focus-visible:ring-2 focus-visible:ring-indigo-400"
            >
              {Array.from(
                { length: new Date().getFullYear() - 2000 + 1 },
                (_, i) => 2000 + i
              )
                .reverse()
                .map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
            </select>

            {/* Status */}
            <select
              aria-label="Status"
              value={statusFilter}
              onChange={(e) => {
                setPage(1);
                setStatusFilter(e.target.value);
              }}
              className="rounded-lg border border-white/10 bg-neutral-800/80 px-3 py-2 text-neutral-100 focus-visible:ring-2 focus-visible:ring-indigo-400"
            >
              <option value="">All Status</option>
              <option value="Currently Airing">Currently Airing</option>
              <option value="Finished Airing">Finished Airing</option>
              <option value="Not yet aired">Not yet aired</option>
            </select>

            {/* Type */}
            <select
              aria-label="Type"
              value={typeFilter}
              onChange={(e) => {
                setPage(1);
                setTypeFilter(e.target.value);
              }}
              className="rounded-lg border border-white/10 bg-neutral-800/80 px-3 py-2 text-neutral-100 focus-visible:ring-2 focus-visible:ring-indigo-400"
            >
              <option value="">All Types</option>
              <option value="TV">TV</option>
              <option value="Movie">Movie</option>
              <option value="OVA">OVA</option>
              <option value="ONA">ONA</option>
              <option value="Special">Special</option>
            </select>

            {/* Rating */}
            <select
              aria-label="Rating"
              value={ratingFilter}
              onChange={(e) => {
                setPage(1);
                setRatingFilter(e.target.value as typeof ratingFilter);
              }}
              className="rounded-lg border border-white/10 bg-neutral-800/80 px-3 py-2 text-neutral-100 focus-visible:ring-2 focus-visible:ring-indigo-400"
            >
              {RATING_OPTIONS.map((r) => (
                <option key={r.value || "all"} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>

            {/* Manual refresh */}
            <button
              onClick={() => fetchAnime()}
              className="rounded-lg border border-white/10 bg-neutral-800/80 px-3 py-2 text-neutral-100 hover:bg-neutral-800 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
            >
              Refresh
            </button>
          </div>
        </div>
      </section>

      {/* Content */}
      <main className="max-w-7xl w-full px-6 py-8 relative z-10">
        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="h-64 rounded-xl border border-white/10 bg-neutral-900/70 animate-pulse"
              />
            ))}
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="rounded-xl border border-red-400/30 bg-red-950/40 p-4 text-sm text-red-200">
            Failed to load: {error}
          </div>
        )}

        {/* Empty */}
        {showEmpty && (
          <div className="rounded-xl border border-white/10 bg-neutral-900/60 p-6 text-sm text-neutral-300">
            No anime matched your filters. Try clearing filters or searching something else.
          </div>
        )}

        {/* Grid */}
        {!loading && !error && filtered.length > 0 && (
          <motion.div
            layout
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5"
          >
            {filtered.map((item, i) => (
              <motion.div
                key={item.mal_id}
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="group"
              >
                <Link
                  href={`/anime/${item.mal_id}`}
                  className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 rounded-xl"
                >
                  <div className="overflow-hidden rounded-xl border border-white/10 bg-neutral-900/70 shadow-sm hover:shadow-md transition">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.images?.jpg?.image_url || "/placeholder.png"}
                      alt={item.title_english || item.title}
                      className="w-full h-56 object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="p-3">
                      <h4 className="text-sm font-medium line-clamp-2 text-neutral-100 group-hover:text-indigo-400 transition-colors">
                        {item.title_english || item.title}
                      </h4>

                      <div className="mt-2 flex items-center justify-between text-xs text-neutral-400">
                        <span>{item.type || "—"}</span>
                        {item.score != null && <span>⭐ {item.score}</span>}
                      </div>

                      <div className="mt-2 flex items-center gap-2">
                        {/* Status badge */}
                        <span
                          className={`text-[10px] px-2 py-1 rounded-full ${
                            item.status === "Currently Airing"
                              ? "bg-emerald-400/20 text-emerald-200"
                              : item.status === "Not yet aired"
                              ? "bg-yellow-400/20 text-yellow-200"
                              : "bg-blue-400/20 text-blue-200"
                          }`}
                        >
                          {item.status || "—"}
                        </span>

                        {/* Rating chip */}
                        {item.rating && (
                          <span className="text-[10px] px-2 py-1 rounded-full border border-white/15 text-neutral-300">
                            {item.rating.split(" - ")[0]}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Pagination */}
        <div className="flex justify-center items-center gap-3 mt-10">
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1 || loading}
            className="rounded-lg border border-white/10 bg-neutral-900/70 px-4 py-2 text-neutral-100 disabled:opacity-50 hover:bg-neutral-900 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
          >
            Previous
          </button>

          <span className="text-sm font-medium text-neutral-300">
            Page {loading ? "…" : data?.pagination?.current_page ?? page}
          </span>

          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={!hasNext || loading}
            className="rounded-lg border border-white/10 bg-neutral-900/70 px-4 py-2 text-neutral-100 disabled:opacity-50 hover:bg-neutral-900 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
          >
            Next
          </button>
        </div>
      </main>
    </div>
  );
}
