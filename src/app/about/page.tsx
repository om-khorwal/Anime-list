"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

export default function AboutPage() {
  return (
    <main className="relative min-h-screen bg-gradient-to-b from-white to-slate-100 dark:from-neutral-950 dark:to-neutral-900 text-neutral-900 dark:text-neutral-100 px-6 py-20">
      {/* Subtle glow background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(124,58,237,0.15),transparent_70%)] pointer-events-none" />

      <div className="mx-auto max-w-5xl relative z-10 space-y-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-cyan-400 bg-clip-text text-transparent">
            About Ani-Ike
          </h1>
          <p className="mt-4 text-base sm:text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
            Discover anime the modern way — beautifully crafted, fast, and made for fans who love stories that move them.
          </p>
        </motion.div>

        {/* Mission */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="grid md:grid-cols-2 gap-10 items-center"
        >
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">🎯 Our Mission</h2>
            <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
              Ani-Ike was born out of a passion for anime and technology - to build a place where design, data, and storytelling
              meet in harmony. We aim to provide anime enthusiasts with a seamless experience to explore, learn, and fall in love
              with their favorite shows - without the clutter.
            </p>
          </div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="rounded-2xl border border-white/10 bg-white/70 dark:bg-neutral-900/70 backdrop-blur-xl shadow-xl p-6"
          >
            <div className="relative w-full h-64 overflow-hidden rounded-xl">
              <img
                src="./sukuna.png"
                alt="Sukuna"
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
          </motion.div>
        </motion.section>

        {/* Who We Are */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          viewport={{ once: true }}
          className="space-y-5"
        >
          <h2 className="text-2xl font-semibold">👨‍💻 Crafted with Care</h2>
          <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
            Ani-Ike is designed, developed, and maintained by{" "}
            <Link
              href="https://theokcompany.in"
              target="_blank"
              className="font-medium text-indigo-500 hover:text-indigo-400 transition"
            >
              TheOKCompany.in
            </Link>{" "}
            - led by{" "}
            <span className="font-semibold text-fuchsia-500">Om Khorwal</span>, a passionate software engineer and creative
            technologist.
          </p>
          <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
            With a focus on clean architecture, delightful user experience, and in-house engineering, Ani-Ike demonstrates
            how design and performance can coexist beautifully in modern web applications.
          </p>
        </motion.section>

        {/* Philosophy */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          viewport={{ once: true }}
          className="space-y-5"
        >
          <h2 className="text-2xl font-semibold">💡 Our Philosophy</h2>
          <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
            We believe technology should enhance creativity, not replace it. Every interaction, motion, and layout in Ani-Ike
            is designed to reflect the emotional essence of anime - vibrant, fluid, and deeply human.
          </p>
          <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
            TheOKCompany’s philosophy is simple - craft meaningful digital experiences that inspire connection and curiosity.
          </p>
        </motion.section>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Link
            href="/"
            className="inline-block rounded-lg bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-cyan-400 text-white px-6 py-3 font-semibold shadow-lg hover:scale-[1.03] transition-transform"
          >
            Explore Ani-Ike
          </Link>
        </motion.div>
      </div>
    </main>
  );
}
