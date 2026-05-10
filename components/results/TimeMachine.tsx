"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import type { ClusterMatch } from "@/lib/types";
import { clusterDisplaySport } from "@/lib/sport-discipline";
import { cmToFeetInches, kgToLb } from "@/lib/units";

const ALL_DECADES = [
  1900, 1910, 1920, 1930, 1940, 1950, 1960, 1970, 1980, 1990, 2000, 2010, 2020,
];

export default function TimeMachine({
  olympicByDecade,
  paralympicByDecade,
}: {
  olympicByDecade?: Record<number, ClusterMatch>;
  paralympicByDecade?: Record<number, ClusterMatch>;
}) {
  // Decades that have a real match on either side
  const availableDecades = useMemo(() => {
    return ALL_DECADES.filter(
      (d) => olympicByDecade?.[d] != null || paralympicByDecade?.[d] != null,
    );
  }, [olympicByDecade, paralympicByDecade]);

  // Default to the most recent decade with data — usually 2020s
  const defaultIdx = Math.max(0, availableDecades.length - 1);
  const [idx, setIdx] = useState(defaultIdx);

  if (availableDecades.length === 0) return null;

  const decade = availableDecades[idx];
  const oly = olympicByDecade?.[decade] ?? null;
  const para = paralympicByDecade?.[decade] ?? null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.55 }}
      className="space-y-6"
    >
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] font-mono text-[var(--accent-gold)]">
          <span className="size-2 rounded-full bg-[var(--accent-gold)]" />
          <span>Time machine · 1896–2024</span>
        </div>
        <h3 className="display text-3xl sm:text-4xl font-semibold tracking-tight leading-[1.05]">
          Drag through history.
        </h3>
        <p className="text-muted text-[15px] leading-relaxed max-w-2xl">
          Slide through every Team USA decade — your closest cohort match updates live.
          See how your archetype maps across 128 years.
        </p>
      </div>

      <div className="glass glass-shine rounded-2xl p-6 sm:p-8 space-y-6">
        {/* Decade pills + slider */}
        <div className="space-y-4">
          <div className="flex items-baseline justify-between">
            <div className="display text-5xl sm:text-6xl font-semibold tabular-nums tracking-tight">
              {decade}s
            </div>
            <div className="text-xs uppercase tracking-[0.18em] text-muted-soft font-mono">
              {availableDecades.length} decades available
            </div>
          </div>
          <input
            type="range"
            min={0}
            max={availableDecades.length - 1}
            value={idx}
            onChange={(e) => setIdx(parseInt(e.target.value, 10))}
            className="w-full"
          />
          <div className="flex justify-between text-[10px] text-muted-soft font-mono tabular-nums px-1">
            {availableDecades.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setIdx(availableDecades.indexOf(d))}
                className={`transition ${
                  d === decade ? "text-foreground font-semibold" : "hover:text-foreground"
                }`}
              >
                {d.toString().slice(2)}
              </button>
            ))}
          </div>
        </div>

        {/* Live cohort cards for this decade */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DecadeMatchTile match={oly} variant="olympic" />
          <DecadeMatchTile match={para} variant="paralympic" />
        </div>
      </div>
    </motion.section>
  );
}

function DecadeMatchTile({
  match,
  variant,
}: {
  match: ClusterMatch | null;
  variant: "olympic" | "paralympic";
}) {
  const accent = variant === "olympic" ? "var(--olympic)" : "var(--paralympic)";
  const label = variant === "olympic" ? "Olympic" : "Paralympic";

  return (
    <div
      className="rounded-xl border p-5 min-h-[180px] relative overflow-hidden"
      style={{ borderColor: "rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)" }}
    >
      <div
        className="text-[10.5px] uppercase tracking-[0.2em] font-mono mb-3"
        style={{ color: accent }}
      >
        {label} · top match this decade
      </div>
      <AnimatePresence mode="wait">
        {match ? (
          <motion.div
            key={match.cluster.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="display text-xl font-semibold tracking-tight leading-tight mb-1">
              {clusterDisplaySport(match.cluster.sport, match.cluster.representativeEvents)}
            </div>
            <div className="text-sm text-muted mb-3 flex flex-wrap gap-x-2 gap-y-0.5">
              <span>{match.cluster.sex === "M" ? "Men" : "Women"}</span>
              <span className="text-muted-soft">·</span>
              <span>{match.cluster.count} athlete{match.cluster.count === 1 ? "" : "s"}</span>
              <span className="text-muted-soft">·</span>
              <span className="tabular-nums">{Math.round(match.similarity * 100)}% match</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <Stat
                label="Avg ht"
                value={match.cluster.avgHeightCm ? cmToFeetInches(match.cluster.avgHeightCm).label : "—"}
              />
              <Stat
                label="Avg wt"
                value={match.cluster.avgWeightKg ? `${kgToLb(match.cluster.avgWeightKg)} lb` : "—"}
              />
              <Stat
                label="Avg age"
                value={match.cluster.avgAge ? `${match.cluster.avgAge}` : "—"}
              />
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-sm text-muted-soft italic"
          >
            No {label.toLowerCase()} cohort recorded for this decade.
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-white/[0.03] py-2">
      <div className="text-foreground font-semibold tabular-nums text-sm">{value}</div>
      <div className="text-[9px] text-muted-soft uppercase tracking-[0.14em] mt-0.5">{label}</div>
    </div>
  );
}
