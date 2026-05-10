"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { toPng } from "html-to-image";
import ShareCard from "./ShareCard";
import PrimaryButton from "@/components/ui/PrimaryButton";
import type { ArchetypeResult } from "@/lib/types";

type Phase = "loading" | "ready" | "error";

const LOADING_MESSAGES = [
  "Sketching the silhouette…",
  "Layering art-deco geometry…",
  "Tuning the palette…",
  "Composing the medallion…",
];

export default function ShareCardSection({
  result,
  firstName,
}: {
  result: ArchetypeResult;
  firstName?: string;
}) {
  const [busy, setBusy] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const [emblemPhase, setEmblemPhase] = useState<Phase>("loading");
  const [emblemUrl, setEmblemUrl] = useState<string | null>(null);
  const [emblemError, setEmblemError] = useState<string | null>(null);
  const [phaseIdx, setPhaseIdx] = useState(0);
  const requestedRef = useRef(false);

  const topSport = result.olympicMatches[0]?.cluster.sport ?? "athletics";

  // Cycle the loading copy while Imagen works (~20s)
  useEffect(() => {
    if (emblemPhase !== "loading") return;
    const id = setInterval(() => {
      setPhaseIdx((i) => (i + 1) % LOADING_MESSAGES.length);
    }, 4000);
    return () => clearInterval(id);
  }, [emblemPhase]);

  // Fetch the emblem once on mount
  useEffect(() => {
    if (requestedRef.current) return;
    requestedRef.current = true;
    let cancelled = false;
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
        setEmblemUrl(data.dataUrl);
        setEmblemPhase("ready");
      })
      .catch((e) => {
        if (cancelled) return;
        setEmblemError(e instanceof Error ? e.message : "Unknown error");
        setEmblemPhase("error");
      });
    return () => {
      cancelled = true;
    };
  }, [result.archetypeName, topSport]);

  async function downloadPng() {
    const node = document.getElementById("share-card");
    if (!node) return;
    setBusy(true);
    setDownloadError(null);
    try {
      const dataUrl = await toPng(node, {
        pixelRatio: 2,
        cacheBust: true,
        backgroundColor: "#03040a",
      });
      const a = document.createElement("a");
      a.download = `team-usa-dna-${result.archetypeName.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.png`;
      a.href = dataUrl;
      a.click();
    } catch (e) {
      setDownloadError(e instanceof Error ? e.message : "Failed to render image");
    } finally {
      setBusy(false);
    }
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="space-y-5"
    >
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-[11px] tracking-[0.18em] uppercase text-muted font-mono mb-3">
            <span className="size-1.5 rounded-full bg-accent-gold animate-pulse" />
            Powered by Imagen + Gemini
          </div>
          <h3 className="display text-3xl sm:text-4xl font-semibold tracking-tight">
            {firstName?.trim() ? `${firstName.trim()}'s Athlete DNA card` : "Your Athlete DNA card"}
          </h3>
          <p className="text-muted text-sm mt-2 max-w-2xl">
            A one-of-a-kind crest generated for you by Imagen, paired with your top cohort matches. Download as PNG to share.
          </p>
          {emblemPhase === "loading" && (
            <AnimatePresence mode="wait">
              <motion.div
                key={phaseIdx}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="text-xs text-muted-soft font-mono mt-3"
              >
                {LOADING_MESSAGES[phaseIdx]}
              </motion.div>
            </AnimatePresence>
          )}
          {emblemPhase === "error" && (
            <div className="text-xs text-accent-red mt-3 font-mono">Emblem generation failed: {emblemError}</div>
          )}
        </div>
        <PrimaryButton onClick={downloadPng} disabled={busy || emblemPhase === "loading"}>
          {busy ? "Rendering…" : emblemPhase === "loading" ? "Forging emblem…" : "Download my DNA card"}
          {!busy && emblemPhase === "ready" && (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 2v9M3.5 7.5L8 12l4.5-4.5M2 13.5h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </PrimaryButton>
      </div>
      <div className="max-w-3xl">
        <ShareCard
          result={result}
          firstName={firstName}
          emblemUrl={emblemUrl}
          emblemPhase={emblemPhase}
        />
      </div>
      {downloadError && <div className="text-sm text-accent-red">{downloadError}</div>}
    </motion.section>
  );
}
