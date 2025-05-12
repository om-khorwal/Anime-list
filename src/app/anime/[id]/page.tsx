'use client';
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
export default function AnimeDetail() {
  const { id } = useParams(); // works in app router
  const [anime, setAnime] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!id) return;

    const fetchAnime = async () => {
      try {
        const res = await fetch(`https://api.jikan.moe/v4/anime/${id}`);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        setAnime(data.data);
      } catch (error) {
        console.error('Fetch failed:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnime();
  }, [id]);

  if (loading) return <div className="text-white p-10">Loading...</div>;
  if (!anime) return <div className="text-white p-10">Anime not found 😢</div>;

  return (
    <div className="min-h-screen p-10 text-white bg-black/90">
      <button
      onClick={() => router.back()}
      className='mb-6 px-4 py-2 bg-white text-black rounded hover:scale-105 transition'
      >
        ← Back
      </button>
      <h1 className="text-4xl font-bold mb-4">{anime.title_english || anime.title}</h1>
      <img
        src={anime.images.jpg.image_url}
        alt={anime.title}
        className="w-64 h-auto rounded-md mb-4"
      />
      <p className="mb-4">{anime.synopsis}</p>
      <p className="text-sm">Score: {anime.score} | Episodes: {anime.episodes}</p>
    </div>
  );
}