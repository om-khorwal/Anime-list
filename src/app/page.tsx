"use client";
import React from "react";
import axios from "axios";
import { useDebounce } from "../hooks/useDebounce";
import { useRouter } from "next/router";
import Link from "next/link";

export default function Home() {
  const [statusFilter, setStatusFilter] = React.useState("");
  const [typeFilter, setTypeFilter] = React.useState("");
  const [anime, setanime] = React.useState<any>(null);
  const [year, setYear] = React.useState("2025");
  const [page, setPage] = React.useState(1);
  const [loading, setLoading] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const getAnime = () => {
    setLoading(true);
    
    const url = debouncedSearchTerm.trim()
     ? `https://api.jikan.moe/v4/anime?q=${debouncedSearchTerm}&page=${page}`
     : `https://api.jikan.moe/v4/seasons/${year}/spring?sfw&page=${page}`;

     axios
      .get(url)
      .then((response) => {
         setanime(response.data);
         setLoading(false);
       })
      .catch((error) => {
         console.log(error);
         setLoading(false);
       });
  };

  React.useEffect(() => {
    if (debouncedSearchTerm.trim()) {
      setPage(1); // reset page on new search
      getAnime();
    }
  }, [debouncedSearchTerm]);
  

  React.useEffect(()=> {
    if (!searchTerm.trim()) {
      getAnime();
    }
  }, [page, year]);

  React.useEffect(() => {
    setPage(1);
  }, [year]);

  return (
    <div className="min-h-screen w-full flex flex-col">
      {/* Background Image */}
      <div className="fixed top-0 left-0 w-full h-full bg-cover bg-center -z-10">
        <img
          className="w-full h-full object-cover"
          src="https://images.pexels.com/photos/8137085/pexels-photo-8137085.png?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
          alt="Background"
        />
      </div>

      {/* Main Content */}
      <div className="w-full h-auto flex flex-col items-center justify-start pt-10 z-10">
        {/* search Bar*/}
        <div className="flex flex-col sm:flex-row items-center gap-2">
          <input 
            type="text"
            placeholder="Search for anime..." 
            value = {searchTerm}
            onChange={(e)=> setSearchTerm(e.target.value)}
            className="px-4 py-2 rounded-lg bg-white text-black w-full sm:w-64"
          />
          <button
            onClick={()=> {
              setPage(1);
              getAnime();
            }}
            className="px-4 py-2 rounded-xl bg-green-500 hover:scale-105 transition w-20 sm:w-auto"
          >
            Search
          </button>
        </div>
        {/* Title */}
        <div className="text-white flex flex-col items-center justify-center p-10 w-full">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-center">
            Welcome to the world of anime.
          </h1>
        </div>

        {/* Year Selection */}
        <div className="flex gap-4 mb-6">
          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="px-4 py-2 rounded-lg bg-white text-black max-h-[200px] overflow-y-auto"
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

          <select
            value={statusFilter}
            onChange={(e)=> setStatusFilter(e.target.value)}
            className="px-4 py-2 rounded-lg bg-white text-black "
          >
            <option value="">All Status</option>
            <option value="Currently Airing">Currently Airing</option>
            <option value="Finished Airing">Finished Airing</option>
            <option value="Not yet aired"></option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 rounded-lg bg-white text-black"
          >
            <option value="">All Types</option>
            <option value="TV">TV</option>
            <option value="Movie">Movie</option>
            <option value="OVA">OVA</option>
            <option value="ONA">ONA</option>
            <option value="Special">Special</option>
          </select>

          <button
            onClick={getAnime}
            className="px-5 py-2 bg-white rounded-xl hover:scale-105 transition"
          >
            Get Anime
          </button>
        </div>

        {/* Loading Indicator */}
        {loading && (
          <div className="text-white text-xl text-center py-6">Loading...</div>
        )}

        {/* Anime Grid */}
        <div className="w-full px-4 sm:px-6 lg:px-12 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {anime?.data
          ?.filter((item: any) => {
            const matchesStatus = statusFilter ? item.status === statusFilter : true;
            const matchesType = typeFilter ? item.type === typeFilter : true;
          
            return matchesStatus && matchesType;
          })
          .map((item: any, index: number) => (
              <Link href={`/anime/${item.mal_id}`} key={index}>
                <div className="bg-white/20 rounded-xl p-3 flex flex-col items-center cursor-pointer hover:scale-105 transition">
                  <img
                    src={item.images?.jpg?.image_url}
                    alt={item.title}
                    className="w-full object-cover rounded-md"
                  />
                  <h4 className="text-white text-center mt-2 text-sm font-semibold">
                    {item.title_english || item.title}
                  </h4>
                  <span
                    className={`mt-1 text-xs px-3 py-1 rounded-full ${
                      item.status === "Currently Airing"
                        ? "bg-green-600 text-white"
                        : "bg-blue-600 text-white"
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
              </Link>
            ))}
        </div>
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center gap-4 py-6">
        <button
          onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          disabled={page === 1 || loading}
          className="px-4 py-2 bg-white rounded-lg disabled:opacity-50"
        >
           Previous
        </button>

        <span className="text-white font-semibold">
          Page {loading ? "Loading..." : page}
        </span>

        <button
          onClick={() => setPage((prev) => prev + 1)}
          disabled={loading}
          className="px-4 py-2 bg-white rounded-lg disabled:opacity-50"
        >
          Next 
        </button>
      </div>
    </div>
  );
}
