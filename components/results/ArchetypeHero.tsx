"use client";

import { motion } from "motion/react";
import StrengthRadar from "./StrengthRadar";
import type { ArchetypeResult } from "@/lib/types";

export default function ArchetypeHero({ result, firstName }: { result: ArchetypeResult; firstName?: string }) {
  const greeting = firstName?.trim()
    ? `${firstName.trim()} — your athletic archetype`
    : "Your athletic archetype";
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="glass glass-shine rounded-3xl p-8 sm:p-12 relative overflow-hidden"
    >
      <div className="absolute -top-32 -right-32 size-96 rounded-full opacity-30 blur-3xl bg-gradient-to-br from-[var(--olympic)] via-[var(--accent-gold)] to-[var(--paralympic)]" />

      <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
        <div>
          <div className="text-xs uppercase tracking-[0.18em] text-muted-soft mb-4 font-mono">
            {greeting}
          </div>
          <h1 className="display text-5xl sm:text-7xl font-semibold tracking-tight mb-6 max-w-xl">
            <span className="bg-gradient-to-r from-[var(--olympic)] via-[var(--accent-gold)] to-[var(--paralympic)] bg-clip-text text-transparent">
              {result.archetypeName}
            </span>
          </h1>
          <p className="text-[15.5px] sm:text-base text-muted leading-relaxed max-w-xl">
            {result.summary}
          </p>
        </div>

        <div>
          <div className="text-xs uppercase tracking-[0.18em] text-muted-soft mb-3 font-mono text-center">
            Strength profile
          </div>
          <StrengthRadar
            power={result.strengthProfile.power}
            speed={result.strengthProfile.speed}
            endurance={result.strengthProfile.endurance}
            coordination={result.strengthProfile.coordination}
          />
          <div className="grid grid-cols-4 gap-2 mt-2 text-center text-xs">
            <Stat label="Power" v={result.strengthProfile.power} />
            <Stat label="Speed" v={result.strengthProfile.speed} />
            <Stat label="Endurance" v={result.strengthProfile.endurance} />
            <Stat label="Coord" v={result.strengthProfile.coordination} />
          </div>
        </div>
      </div>
    </motion.section>
  );
}

function Stat({ label, v }: { label: string; v: number }) {
  return (
    <div>
      <div className="text-foreground font-semibold tabular-nums">{v}</div>
      <div className="text-muted-soft uppercase tracking-[0.12em] mt-0.5 text-[10px]">{label}</div>
    </div>
  );
}
