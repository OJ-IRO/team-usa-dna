"use client";

import type { ArchetypeResult } from "@/lib/types";

function clusterDisplayLabel(c: { sport: string; decade: number; sex: "M" | "F" }) {
  return `${c.sport} · ${c.decade}s · ${c.sex === "M" ? "Men" : "Women"}`;
}

export default function ShareCard({
  result,
  firstName,
  emblemUrl,
  emblemPhase,
}: {
  result: ArchetypeResult;
  firstName?: string;
  emblemUrl?: string | null;
  emblemPhase: "loading" | "ready" | "error";
}) {
  const top1 = result.olympicMatches[0];
  const topPara = result.paralympicMatches[0];
  const headline = firstName?.trim()
    ? `${firstName.trim()}'s athletic archetype`
    : "Athletic archetype";

  return (
    <div
      id="share-card"
      className="relative w-full aspect-[1.91/1] rounded-3xl overflow-hidden"
      style={{
        background:
          "radial-gradient(circle at 20% 0%, rgba(73,131,255,0.45), transparent 60%), radial-gradient(circle at 100% 100%, rgba(239,58,71,0.45), transparent 60%), #03040a",
      }}
    >
      <div className="absolute inset-0 p-10 flex flex-col justify-between">
        {/* Top row — brand wordmark + emblem medallion */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className="size-7 rounded-lg bg-gradient-to-br from-[var(--olympic)] via-[var(--accent-gold)] to-[var(--paralympic)]" />
            <span className="font-semibold tracking-tight text-white text-[15px]">
              Team USA DNA
            </span>
          </div>
          {/* Generated emblem as a small medallion — supports the brand, doesn't crowd it */}
          <EmblemMedallion url={emblemUrl} phase={emblemPhase} />
        </div>

        {/* Archetype name */}
        <div>
          <div className="text-[11px] uppercase tracking-[0.22em] text-white/60 font-mono mb-3">
            {headline}
          </div>
          <div className="display text-[44px] sm:text-[64px] leading-[0.95] font-semibold tracking-tight text-white max-w-xl">
            <span className="bg-gradient-to-r from-[var(--olympic)] via-[var(--accent-gold)] to-[var(--paralympic)] bg-clip-text text-transparent">
              {result.archetypeName}
            </span>
          </div>
        </div>

        {/* Cohort matches */}
        <div className="grid grid-cols-2 gap-6 text-white/85 text-sm">
          {top1 && (
            <div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-[var(--olympic)] font-mono mb-1.5">
                Olympic cohort
              </div>
              <div className="text-base font-semibold tracking-tight text-white">
                {clusterDisplayLabel(top1.cluster)}
              </div>
              <div className="text-xs text-white/60">
                {top1.cluster.count} athletes · {Math.round(top1.similarity * 100)}% match
              </div>
            </div>
          )}
          {topPara && (
            <div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-[var(--paralympic)] font-mono mb-1.5">
                Paralympic cohort
              </div>
              <div className="text-base font-semibold tracking-tight text-white">
                {clusterDisplayLabel(topPara.cluster)}
              </div>
              <div className="text-xs text-white/60">
                {topPara.cluster.count} athlete{topPara.cluster.count === 1 ? "" : "s"} · {Math.round(topPara.similarity * 100)}% match
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function EmblemMedallion({
  url,
  phase,
}: {
  url?: string | null;
  phase: "loading" | "ready" | "error";
}) {
  // Rounded-square frame instead of a circle — the generated emblems are
  // square (often a vertical shield silhouette) and a circular crop was
  // clipping the bottom point. The square fits the full image cleanly.
  return (
    <div
      className="relative size-24 sm:size-28 rounded-2xl overflow-hidden shrink-0"
      style={{
        boxShadow: "0 0 0 1px rgba(255,255,255,0.14), 0 12px 32px rgba(0,0,0,0.55)",
        background:
          "linear-gradient(135deg, rgba(255,255,255,0.04), rgba(0,0,0,0.35))",
      }}
    >
      {phase === "ready" && url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt="Generated archetype emblem"
          className="absolute inset-0 w-full h-full object-contain p-1"
        />
      ) : phase === "loading" ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="size-7 rounded-full border-2 border-white/15 border-t-[var(--accent-gold)] animate-spin" />
        </div>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="size-3 rounded-full bg-white/20" />
        </div>
      )}
    </div>
  );
}
