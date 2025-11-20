"use client";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Header() {
  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="sticky top-0 z-50 w-full bg-white/70 dark:bg-neutral-900/70 backdrop-blur-lg border-b border-neutral-200/40 dark:border-white/10"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="text-xl font-bold text-gradient tracking-tight hover:opacity-80 transition"
        >
          Anime-Ike
        </Link>

        <nav className="flex gap-5 text-sm font-medium text-neutral-700 dark:text-neutral-300">
          <Link href="/" className="hover:text-indigo-500 transition">
            Home
          </Link>
          <Link href="/about" className="hover:text-indigo-500 transition">
            About
          </Link>
           {/* <Link href="/manga" className="hover:text-indigo-500 transition">
            Manga
          </Link> */}
        
        </nav>
      </div>
    </motion.header>
  );
}
