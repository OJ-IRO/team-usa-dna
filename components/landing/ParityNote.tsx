"use client";

import { motion } from "motion/react";

export default function ParityNote() {
  return (
    <section className="relative w-full px-6 sm:px-8 py-20">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="glass glass-shine rounded-3xl p-10 sm:p-14 grid grid-cols-1 md:grid-cols-2 gap-10 items-center"
        >
          <div>
            <div className="text-xs uppercase tracking-[0.18em] text-muted-soft mb-4">
              On equal footing
            </div>
            <h2 className="display text-3xl sm:text-4xl font-semibold tracking-tight mb-4">
              Olympic and Paralympic, weighted the same.
            </h2>
            <p className="text-muted text-[15px] leading-relaxed">
              Every result includes Olympic <em>and</em> Paralympic cohort matches with equal
              prominence, equal narrative depth, and the same matching algorithm. Paralympic
              representation isn&apos;t a sidebar — it&apos;s structural.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl p-5 border border-[var(--olympic)]/30 bg-[var(--olympic)]/[0.06]">
              <div className="size-2 rounded-full bg-[var(--olympic)] mb-4" />
              <div className="text-sm uppercase tracking-[0.14em] text-muted-soft mb-1">
                Olympic
              </div>
              <div className="text-2xl font-semibold">1896 — 2024</div>
              <div className="text-xs text-muted-soft mt-3">
                Summer + Winter, Team USA only. The canonical 120-year dataset (through Rio 2016) plus a Gemini-grounded modern era supplement (Tokyo, Beijing, Paris).
              </div>
            </div>
            <div className="rounded-2xl p-5 border border-[var(--paralympic)]/30 bg-[var(--paralympic)]/[0.06]">
              <div className="size-2 rounded-full bg-[var(--paralympic)] mb-4" />
              <div className="text-sm uppercase tracking-[0.14em] text-muted-soft mb-1">
                Paralympic
              </div>
              <div className="text-2xl font-semibold">2008 — 2020</div>
              <div className="text-xs text-muted-soft mt-3">
                Curated set of Team USA Paralympic medalists across 10+ disciplines.
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
