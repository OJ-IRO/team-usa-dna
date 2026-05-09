"use client";

import { motion } from "motion/react";
import PrimaryButton from "@/components/ui/PrimaryButton";

export default function Hero({
  olympicCount,
  paralympicCount,
  yearMin,
  yearMax,
}: {
  olympicCount: number;
  paralympicCount: number;
  yearMin: number;
  yearMax: number;
}) {
  return (
    <section className="relative w-full px-6 sm:px-8 pt-28 sm:pt-32 pb-16">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="inline-flex items-center gap-2 mb-7 px-3.5 py-1.5 rounded-full glass text-[12.5px] tracking-wide text-muted"
        >
          <span className="size-1.5 rounded-full bg-accent-gold animate-pulse" />
          POWERED BY GEMINI · TEAM USA DNA
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
          className="display text-[12vw] sm:text-7xl lg:text-[88px] font-semibold max-w-5xl"
        >
          Find the archetype<br />
          <span className="bg-gradient-to-r from-[var(--olympic)] via-[var(--accent-gold)] to-[var(--paralympic)] bg-clip-text text-transparent">
            inside your build.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="mt-7 text-lg sm:text-xl text-muted max-w-2xl leading-relaxed"
        >
          Team USA DNA clusters {yearMin}–{yearMax} of Team USA Olympic and Paralympic data
          ({olympicCount.toLocaleString()}+ athletes analyzed, never named) into <span className="text-foreground font-medium">cohort archetypes</span> —
          then matches your biometrics, preferences, and (optionally) a photo to the closest ones.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="mt-10 flex flex-wrap items-center gap-3"
        >
          <PrimaryButton href="/onboarding">
            Find my archetype
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8H13M13 8L8.5 3.5M13 8L8.5 12.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </PrimaryButton>
          <PrimaryButton href="#how-it-works" variant="ghost">
            How it works
          </PrimaryButton>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-16 flex flex-wrap gap-x-10 gap-y-6 text-sm text-muted"
        >
          <Stat label="Years of data" value={`${yearMax - yearMin}`} />
          <Stat label="Team USA athletes" value={(olympicCount + paralympicCount).toLocaleString()} />
          <Stat label="Olympic + Paralympic" value="Equal weight" />
          <Stat label="Conditional language" value="Always" />
        </motion.div>
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-foreground text-2xl font-semibold tracking-tight">{value}</div>
      <div className="text-xs uppercase tracking-[0.14em] mt-1 text-muted-soft">{label}</div>
    </div>
  );
}
