"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import type { ArchetypeResult } from "@/lib/types";

type Phase = "idle" | "loading" | "ready" | "error";

const LOADING_MESSAGES = [
  "Sketching the silhouette…",
  "Layering art-deco geometry…",
  "Tuning the palette…",
  "Forging the medallion…",
];

export default function ArchetypeCrest({
  result,
  firstName,
}: {
  result: ArchetypeResult;
  firstName?: string;
}) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [phaseIdx, setPhaseIdx] = useState(0);
  const requestedRef = useRef(false);

  const topSport = result.olympicMatches[0]?.cluster.sport ?? "athletics";

  // Cycle loading-phase copy so it reads as alive while Imagen works (~20s).
  useEffect(() => {
    if (phase !== "loading") return;
    const id = setInterval(() => {
      setPhaseIdx((i) => (i + 1) % LOADING_MESSAGES.length);
    }, 4000);
    return () => clearInterval(id);
  }, [phase]);

  useEffect(() => {
    if (requestedRef.current) return;
    requestedRef.current = true;
    let cancelled = false;
    setPhase("loading");
    fetch("/api/crest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        archetypeName: result.archetypeName,
        sport: topSport,
      }),
    })
      .then(async (r) => {
        if (!r.ok) {
          const data = await r.json().catch(() => ({}));
          throw new Error(data.error || `Request failed (${r.status})`);
        }
        return r.json();
      })
      .then((data) => {
        if (cancelled) return;
        setImageUrl(data.dataUrl);
        setPhase("ready");
      })
      .catch((e) => {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Unknown error");
        setPhase("error");
      });
    return () => {
      cancelled = true;
    };
  }, [result.archetypeName, topSport]);

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="glass glass-shine rounded-3xl p-6 sm:p-10 relative overflow-hidden"
    >
      <div className="absolute -top-20 -right-20 size-80 rounded-full opacity-25 blur-3xl bg-gradient-to-br from-[var(--accent-gold)] via-[var(--olympic)] to-[var(--paralympic)]" />

      <div className="relative grid grid-cols-1 md:grid-cols-[auto_1fr] gap-8 sm:gap-12 items-center">
        {/* The crest, foregrounded */}
        <div className="relative w-full max-w-[440px] mx-auto md:max-w-[420px] aspect-square rounded-3xl overflow-hidden">
          <AnimatePresence mode="wait">
            {phase === "loading" && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center glass"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--olympic)]/15 via-[var(--accent-gold)]/15 to-[var(--paralympic)]/15 animate-pulse" />
                <div className="relative text-center space-y-5 px-6">
                  <div className="relative size-20 mx-auto">
                    <div className="absolute inset-0 rounded-full border-2 border-[var(--accent-gold)]/30 border-t-[var(--accent-gold)] animate-spin" />
                    <div className="absolute inset-2 rounded-full border-2 border-[var(--olympic)]/30 border-t-[var(--olympic)] animate-spin [animation-direction:reverse] [animation-duration:1.6s]" />
                    <div className="absolute inset-4 rounded-full border-2 border-[var(--paralympic)]/30 border-t-[var(--paralympic)] animate-spin [animation-duration:2.2s]" />
                  </div>
                  <div className="text-xs uppercase tracking-[0.18em] text-muted-soft font-mono">
                    Imagen forging your crest
                  </div>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={phaseIdx}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.4 }}
                      className="text-sm text-muted"
                    >
                      {LOADING_MESSAGES[phaseIdx]}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
            {phase === "ready" && imageUrl && (
              <motion.img
                key="img"
                src={imageUrl}
                alt={`Generated archetype emblem for ${result.archetypeName}`}
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="absolute inset-0 w-full h-full object-cover"
              />
            )}
            {phase === "error" && (
              <motion.div
                key="err"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 flex items-center justify-center text-center px-6 glass"
              >
                <div className="space-y-2">
                  <div className="text-xs uppercase tracking-[0.18em] text-accent-red font-mono">
                    Crest unavailable
                  </div>
                  <div className="text-xs text-muted-soft">{error}</div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Headline + caption */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-[11px] tracking-[0.18em] uppercase text-muted font-mono">
            <span className="size-1.5 rounded-full bg-accent-gold animate-pulse" />
            Powered by Imagen
          </div>
          <h2 className="display text-3xl sm:text-5xl font-semibold tracking-tight">
            {firstName?.trim()
              ? `${firstName.trim()}'s archetype emblem`
              : "Your archetype emblem"}
          </h2>
          <p className="text-muted text-[15.5px] leading-relaxed max-w-xl">
            A one-of-a-kind crest, generated for you by Gemini&apos;s Imagen model. The model is given your archetype name and matched cohort sport, and constrained to abstract art-deco motifs only — no Olympic rings, IOC marks, real flags, or athlete imagery. Every user gets a different emblem.
          </p>
          <div className="pt-2 grid grid-cols-3 gap-3 text-xs">
            <div className="glass rounded-xl p-3">
              <div className="text-muted-soft uppercase tracking-[0.14em] text-[10px] mb-1">Archetype</div>
              <div className="font-semibold tracking-tight truncate">{result.archetypeName}</div>
            </div>
            <div className="glass rounded-xl p-3">
              <div className="text-muted-soft uppercase tracking-[0.14em] text-[10px] mb-1">Anchor sport</div>
              <div className="font-semibold tracking-tight truncate">{topSport}</div>
            </div>
            <div className="glass rounded-xl p-3">
              <div className="text-muted-soft uppercase tracking-[0.14em] text-[10px] mb-1">Style</div>
              <div className="font-semibold tracking-tight truncate">Art-deco crest</div>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
