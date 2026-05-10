"use client";

import { motion } from "motion/react";
import type { ClusterMatch } from "@/lib/types";
import { clusterDisplaySport } from "@/lib/sport-discipline";
import { cmToFeetInches, kgToLb } from "@/lib/units";

export default function ClusterCard({
  match,
  variant,
  index,
  onExpand,
}: {
  match: ClusterMatch;
  variant: "olympic" | "paralympic";
  index: number;
  onExpand?: (m: ClusterMatch) => void;
}) {
  const c = match.cluster;
  const totalMedals = c.medals.gold + c.medals.silver + c.medals.bronze;
  const accent = variant === "olympic" ? "var(--olympic)" : "var(--paralympic)";
  const sexLabel = c.sex === "M" ? "Men" : "Women";

  return (
    <motion.button
      type="button"
      onClick={() => onExpand?.(match)}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
      className="glass glass-shine rounded-2xl p-6 relative overflow-hidden group text-left w-full focus:outline-none focus:ring-2 focus:ring-foreground/40"
    >
      <div
        className="absolute top-0 left-0 right-0 h-[3px]"
        style={{ background: accent }}
      />

      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="text-[11px] uppercase tracking-[0.2em] font-mono" style={{ color: accent }}>
          Cohort #{index + 1}
        </div>
        <div className="text-xs text-muted-soft tabular-nums">
          {Math.round(match.similarity * 100)}% match
        </div>
      </div>

      <h3 className="display text-2xl font-semibold tracking-tight mb-1.5 leading-tight line-clamp-2 min-h-[4rem]">
        {clusterDisplaySport(c.sport, c.representativeEvents)}
      </h3>
      <div className="text-sm text-muted mb-4 flex flex-wrap gap-x-2 gap-y-0.5">
        <span>{c.decade}s · {sexLabel}</span>
        <span className="text-muted-soft">·</span>
        <span>{c.count} athlete{c.count === 1 ? "" : "s"}</span>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4 text-center">
        <Stat
          label="Avg ht"
          value={c.avgHeightCm ? cmToFeetInches(c.avgHeightCm).label : "—"}
          sub={c.avgHeightCm ? `${c.avgHeightCm} cm` : null}
        />
        <Stat
          label="Avg wt"
          value={c.avgWeightKg ? `${kgToLb(c.avgWeightKg)} lb` : "—"}
          sub={c.avgWeightKg ? `${c.avgWeightKg} kg` : null}
        />
        <Stat label="Avg age" value={c.avgAge ? `${c.avgAge}` : "—"} sub={null} />
      </div>

      {/* Medals block — always rendered so all cards align vertically. */}
      <div className="space-y-1.5 mb-4 text-xs font-mono min-h-[64px]">
        {totalMedals > 0 ? (
          <>
            {c.medalYears.gold.length > 0 && (
              <div className="flex gap-2 items-baseline">
                <span className="px-1.5 py-0.5 rounded bg-[var(--accent-gold)]/15 text-[var(--accent-gold)] tracking-tight">GOLD</span>
                <span className="text-foreground/85">{c.medalYears.gold.join(", ")}</span>
              </div>
            )}
            {c.medalYears.silver.length > 0 && (
              <div className="flex gap-2 items-baseline">
                <span className="px-1.5 py-0.5 rounded bg-white/10 text-white/80 tracking-tight">SILVER</span>
                <span className="text-foreground/85">{c.medalYears.silver.join(", ")}</span>
              </div>
            )}
            {c.medalYears.bronze.length > 0 && (
              <div className="flex gap-2 items-baseline">
                <span className="px-1.5 py-0.5 rounded bg-orange-400/15 text-orange-300 tracking-tight">BRONZE</span>
                <span className="text-foreground/85">{c.medalYears.bronze.join(", ")}</span>
              </div>
            )}
            <div className="text-[10px] text-muted-soft pt-1">Years this cohort medaled in their primary sport</div>
          </>
        ) : (
          <div className="text-[11px] text-muted-soft uppercase tracking-[0.16em] pt-1">
            No medals on record for this decade
          </div>
        )}
      </div>

      {match.rationale.length > 0 && (
        <ul className="space-y-1.5 text-[13.5px] text-muted">
          {match.rationale.map((r, i) => (
            <li key={i} className="flex gap-2">
              <span className="text-muted-soft">·</span>
              <span>{r}</span>
            </li>
          ))}
        </ul>
      )}

      {onExpand && (
        <div className="mt-4 pt-3 border-t border-white/5 text-[11px] text-muted-soft uppercase tracking-[0.2em] flex items-center gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
          <span>Tap for cohort detail</span>
          <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
            <path d="M3 8H13M13 8L8.5 3.5M13 8L8.5 12.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      )}
    </motion.button>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub: string | null }) {
  return (
    <div className="rounded-lg bg-white/[0.03] py-2.5">
      <div className="text-foreground font-semibold tabular-nums text-sm">{value}</div>
      {sub && <div className="text-[10px] text-muted-soft tabular-nums mt-0.5">{sub}</div>}
      <div className="text-[10px] text-muted-soft uppercase tracking-[0.14em] mt-0.5">{label}</div>
    </div>
  );
}
