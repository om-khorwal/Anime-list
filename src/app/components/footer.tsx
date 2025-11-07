"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative mt-24 border-t text-neutral-400">
      {/* soft glow */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(60%_60%_at_50%_120%,rgba(99,102,241,0.15),transparent_70%)] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mx-auto max-w-6xl px-6 py-12"
      >
        <div className="grid gap-10 md:grid-cols-3">
          {/* Brand + About */}
          <div className="space-y-3 md:col-span-2">
            <Link href="/" className="inline-flex items-center gap-2">
              <span className="text-lg font-extrabold bg-gradient-to-r from-indigo-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
                Ani-Ike
              </span>
            </Link>

            <p className="text-sm text-neutral-400 leading-relaxed">
              Discover anime the modern way — beautifully crafted, fast, and made for fans who love stories that move them.
            </p>

            {/* Attribution */}
            <div className="inline-flex items-center gap-2 rounded-full border border-neutral-800 bg-neutral-900 backdrop-blur px-3 py-1 mt-3">
              <span className="text-xs text-neutral-400">
                Made with ❤️ — a venture by
              </span>
              <Link
                href="https://theokcompany.in"
                target="_blank"
                className="text-xs font-medium text-indigo-400 hover:text-indigo-300"
              >
                TheOKCompany
              </Link>
            </div>
          </div>

          {/* Quick links */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-neutral-300">Explore</h3>
            <ul className="space-y-2 text-sm text-neutral-400">
              <li>
                <Link
                  className="hover:text-neutral-100"
                  href="/"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  className="hover:text-neutral-100"
                  href="/about"
                >
                  About
                </Link>
              </li>
            </ul>

            {/* Contact Email */}
            <div className="pt-2">
              <h3 className="text-sm font-semibold text-neutral-300 mb-1">Contact</h3>
              <a
                href="mailto:omkhorwalofficial@gmail.com"
                className="text-sm text-neutral-400 hover:text-indigo-400"
              >
                omkhorwalofficial@gmail.com
              </a>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-neutral-800 pt-6 md:flex-row">
          <p className="text-xs text-neutral-500">
            © {year} Ani-Ike. All rights reserved.
          </p>
          <p className="text-xs text-neutral-500">
            Built for performance, accessibility, and vibes ✨
          </p>
        </div>
      </motion.div>
    </footer>
  );
}
