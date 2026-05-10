"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import dynamic from "next/dynamic";
import type { ClusterMatch } from "@/lib/types";
import { clusterDisplaySport } from "@/lib/sport-discipline";
import { cmToFeetInches, kgToLb } from "@/lib/units";

// three.js scene is heavy; lazy-load only when modal opens.
const CohortMotif = dynamic(() => import("./CohortMotif"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="size-8 rounded-full border-2 border-white/20 border-t-[var(--accent-gold)] animate-spin" />
    </div>
  ),
});

export default function CohortDetailModal({
  match,
  variant,
  onClose,
}: {
  match: ClusterMatch | null;
  variant: "olympic" | "paralympic";
  onClose: () => void;
}) {
  // ESC to close
  useEffect(() => {
    if (!match) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [match, onClose]);

  return (
    <AnimatePresence>
      {match && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[80] flex items-center justify-center px-4 sm:px-8"
          onClick={onClose}
          style={{ background: "rgba(3, 4, 10, 0.85)", backdropFilter: "blur(8px)" }}
        >
          <motion.div
            initial={{ scale: 0.96, y: 12, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.96, y: 12, opacity: 0 }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-3xl max-h-[90vh] glass-strong rounded-3xl overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 3D motif as the hero of the modal */}
            <div className="relative w-full h-[220px] sm:h-[260px] bg-[#03040a]">
              <CohortMotif
                sport={match.cluster.sport}
                events={match.cluster.representativeEvents}
                variant={variant}
              />
              {/* Close button */}
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="absolute top-4 right-4 size-9 rounded-full bg-black/50 hover:bg-black/80 border border-white/10 flex items-center justify-center transition"
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </button>
              {/* Top corner accent badge */}
              <div
                className="absolute top-4 left-4 px-3 py-1 rounded-full text-[10.5px] uppercase tracking-[0.2em] font-mono"
                style={{
                  color: variant === "olympic" ? "#3b7afe" : "#ff3148",
                  background: "rgba(0,0,0,0.6)",
                  border: "1px solid rgba(255,255,255,0.12)",
                }}
              >
                {variant === "olympic" ? "Olympic cohort" : "Paralympic cohort"}
              </div>
            </div>

            {/* Detail panel */}
            <div className="p-6 sm:p-8 space-y-5">
              <div>
                <h3 className="display text-3xl font-semibold tracking-tight leading-tight mb-1.5">
                  {clusterDisplaySport(match.cluster.sport, match.cluster.representativeEvents)}
                </h3>
                <div className="text-sm text-muted flex flex-wrap gap-x-2 gap-y-0.5">
                  <span>{match.cluster.decade}s</span>
                  <span className="text-muted-soft">·</span>
                  <span>{match.cluster.sex === "M" ? "Men" : "Women"}</span>
                  <span className="text-muted-soft">·</span>
                  <span>{match.cluster.count} athlete{match.cluster.count === 1 ? "" : "s"}</span>
                  <span className="text-muted-soft">·</span>
                  <span className="tabular-nums font-mono">{Math.round(match.similarity * 100)}% match</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <Stat
                  label="Avg height"
                  value={match.cluster.avgHeightCm ? cmToFeetInches(match.cluster.avgHeightCm).label : "—"}
                  sub={match.cluster.avgHeightCm ? `${match.cluster.avgHeightCm} cm` : null}
                />
                <Stat
                  label="Avg weight"
                  value={match.cluster.avgWeightKg ? `${kgToLb(match.cluster.avgWeightKg)} lb` : "—"}
                  sub={match.cluster.avgWeightKg ? `${match.cluster.avgWeightKg} kg` : null}
                />
                <Stat label="Avg age" value={match.cluster.avgAge ? `${match.cluster.avgAge}` : "—"} sub={null} />
              </div>

              {/* Medal years */}
              {(match.cluster.medalYears.gold.length > 0 ||
                match.cluster.medalYears.silver.length > 0 ||
                match.cluster.medalYears.bronze.length > 0) && (
                <div className="space-y-1.5 text-xs font-mono">
                  {match.cluster.medalYears.gold.length > 0 && (
                    <div className="flex gap-2 items-baseline">
                      <span className="px-1.5 py-0.5 rounded bg-[var(--accent-gold)]/15 text-[var(--accent-gold)] tracking-tight">GOLD</span>
                      <span className="text-foreground/85">{match.cluster.medalYears.gold.join(", ")}</span>
                    </div>
                  )}
                  {match.cluster.medalYears.silver.length > 0 && (
                    <div className="flex gap-2 items-baseline">
                      <span className="px-1.5 py-0.5 rounded bg-white/10 text-white/80 tracking-tight">SILVER</span>
                      <span className="text-foreground/85">{match.cluster.medalYears.silver.join(", ")}</span>
                    </div>
                  )}
                  {match.cluster.medalYears.bronze.length > 0 && (
                    <div className="flex gap-2 items-baseline">
                      <span className="px-1.5 py-0.5 rounded bg-orange-400/15 text-orange-300 tracking-tight">BRONZE</span>
                      <span className="text-foreground/85">{match.cluster.medalYears.bronze.join(", ")}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Representative events */}
              {match.cluster.representativeEvents.length > 0 && (
                <div className="space-y-1.5">
                  <div className="text-[11px] uppercase tracking-[0.18em] text-muted-soft font-mono">
                    Common events in this cohort
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {match.cluster.representativeEvents.slice(0, 4).map((e) => (
                      <span
                        key={e}
                        className="px-2.5 py-1 rounded-md bg-white/[0.04] border border-white/10 text-[12px] text-muted"
                      >
                        {e}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Why this match */}
              {match.rationale.length > 0 && (
                <div className="space-y-1.5">
                  <div className="text-[11px] uppercase tracking-[0.18em] text-muted-soft font-mono">
                    Why this cohort matched you
                  </div>
                  <ul className="space-y-1.5 text-[14px] text-muted">
                    {match.rationale.map((r, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="text-muted-soft">·</span>
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Stat({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub: string | null;
}) {
  return (
    <div className="rounded-lg bg-white/[0.04] py-3 px-3 text-center">
      <div className="text-foreground font-semibold tabular-nums text-base">{value}</div>
      {sub && <div className="text-[10px] text-muted-soft tabular-nums mt-0.5">{sub}</div>}
      <div className="text-[10px] text-muted-soft uppercase tracking-[0.14em] mt-0.5">{label}</div>
    </div>
  );
}
