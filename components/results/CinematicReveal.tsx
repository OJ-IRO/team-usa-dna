"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import type { ArchetypeResult } from "@/lib/types";

// Total duration: ~7.5s. Click anywhere to fast-forward.
const STAGE_TIMINGS = {
  intro: 1100, // "ARCHETYPE LOCATED"
  emblem: 2000, // medallion silhouette draws in
  name: 2400, // archetype name types out
  outro: 2000, // hold + fade
} as const;

const TOTAL_MS =
  STAGE_TIMINGS.intro + STAGE_TIMINGS.emblem + STAGE_TIMINGS.name + STAGE_TIMINGS.outro;

export default function CinematicReveal({
  result,
  firstName,
  onComplete,
}: {
  result: ArchetypeResult;
  firstName?: string;
  onComplete: () => void;
}) {
  const [stage, setStage] = useState<"intro" | "emblem" | "name" | "outro" | "done">("intro");
  const [typed, setTyped] = useState("");

  // Stage progression
  useEffect(() => {
    const t1 = setTimeout(() => setStage("emblem"), STAGE_TIMINGS.intro);
    const t2 = setTimeout(() => setStage("name"), STAGE_TIMINGS.intro + STAGE_TIMINGS.emblem);
    const t3 = setTimeout(
      () => setStage("outro"),
      STAGE_TIMINGS.intro + STAGE_TIMINGS.emblem + STAGE_TIMINGS.name,
    );
    const t4 = setTimeout(() => {
      setStage("done");
      onComplete();
    }, TOTAL_MS);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [onComplete]);

  // Type the archetype name out, character by character
  useEffect(() => {
    if (stage !== "name") return;
    const text = result.archetypeName;
    const charDuration = Math.max(35, (STAGE_TIMINGS.name * 0.55) / text.length);
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setTyped(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, charDuration);
    return () => clearInterval(id);
  }, [stage, result.archetypeName]);

  // Click anywhere to skip
  function skip() {
    setStage("done");
    onComplete();
  }

  if (stage === "done") return null;

  return (
    <motion.div
      onClick={skip}
      // Backdrop is FULLY OPAQUE from the very first frame so the results page
      // beneath never bleeds through. Only fades out at outro.
      initial={{ opacity: 1 }}
      animate={{ opacity: stage === "outro" ? 0 : 1 }}
      transition={{ duration: stage === "outro" ? 1.6 : 0.001 }}
      className="fixed inset-0 z-[100] flex items-center justify-center cursor-pointer overflow-hidden"
      style={{ background: "#03040a" }}
    >
      {/* Background gradient that intensifies through the sequence */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: stage === "intro" ? 0.5 : 1 }}
        transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(73,131,255,0.18), transparent 55%), radial-gradient(circle at 25% 100%, rgba(245,181,10,0.18), transparent 60%), radial-gradient(circle at 80% 0%, rgba(239,58,71,0.16), transparent 60%)",
        }}
      />

      {/* Floating particles */}
      <Particles />

      {/* Center stage */}
      <div className="relative flex flex-col items-center text-center px-6 max-w-3xl">
        {/* "ARCHETYPE LOCATED" intro chip */}
        <AnimatePresence>
          {stage === "intro" && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.5 }}
              className="text-xs uppercase tracking-[0.32em] text-muted font-mono"
            >
              {firstName?.trim() ? `${firstName.trim()}, your archetype is` : "Archetype located"}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Animated emblem silhouette */}
        <AnimatePresence>
          {(stage === "emblem" || stage === "name" || stage === "outro") && (
            <motion.div
              key="emblem"
              initial={{ opacity: 0, scale: 0.7, rotate: -8 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 1.06 }}
              transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
              className="mb-10"
            >
              <EmblemMotif />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Archetype name typed out */}
        <AnimatePresence>
          {(stage === "name" || stage === "outro") && (
            <motion.div
              key="name"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="text-[10px] uppercase tracking-[0.32em] text-muted-soft font-mono mb-4">
                Your athletic archetype
              </div>
              <div className="display text-5xl sm:text-7xl font-semibold tracking-tight max-w-3xl mx-auto">
                <span className="bg-gradient-to-r from-[var(--olympic)] via-[var(--accent-gold)] to-[var(--paralympic)] bg-clip-text text-transparent">
                  {typed}
                </span>
                {stage === "name" && typed.length < result.archetypeName.length && (
                  <span className="inline-block w-[3px] h-[0.85em] ml-1 bg-foreground align-middle animate-pulse" />
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Skip hint */}
      <div className="absolute bottom-8 right-8 text-[11px] uppercase tracking-[0.2em] text-muted-soft font-mono">
        Click anywhere to skip
      </div>
    </motion.div>
  );
}

/** Inline SVG that animates as a stylized shield/medallion drawing itself in. */
function EmblemMotif() {
  return (
    <svg
      width="200"
      height="200"
      viewBox="-100 -100 200 200"
      className="drop-shadow-[0_0_28px_rgba(245,181,10,0.45)]"
    >
      <defs>
        <radialGradient id="emblem-fill" cx="0" cy="0" r="80" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#f5b50a" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#03040a" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="emblem-stroke" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4983ff" />
          <stop offset="50%" stopColor="#f5b50a" />
          <stop offset="100%" stopColor="#ef3a47" />
        </linearGradient>
      </defs>

      {/* Outer ring */}
      <motion.circle
        cx="0"
        cy="0"
        r="78"
        stroke="url(#emblem-stroke)"
        strokeWidth="1.5"
        fill="none"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
      />

      {/* Inner ring */}
      <motion.circle
        cx="0"
        cy="0"
        r="62"
        stroke="rgba(255,255,255,0.25)"
        strokeWidth="0.8"
        fill="none"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
      />

      {/* Center fill glow */}
      <motion.circle
        cx="0"
        cy="0"
        r="60"
        fill="url(#emblem-fill)"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.6 }}
      />

      {/* Shield silhouette (stylized) */}
      <motion.path
        d="M 0 -45 L 35 -28 L 35 12 Q 35 38 0 50 Q -35 38 -35 12 L -35 -28 Z"
        stroke="url(#emblem-stroke)"
        strokeWidth="2"
        fill="rgba(245,181,10,0.06)"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1.0, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
      />

      {/* Three orbiting dots (Olympic, Gold, Paralympic) */}
      {[
        { angle: -90, color: "#f5b50a", delay: 0.9 },
        { angle: 30, color: "#4983ff", delay: 1.1 },
        { angle: 150, color: "#ef3a47", delay: 1.3 },
      ].map((d) => {
        const r = 78;
        const x = Math.cos((d.angle * Math.PI) / 180) * r;
        const y = Math.sin((d.angle * Math.PI) / 180) * r;
        return (
          <motion.circle
            key={d.angle}
            cx={x}
            cy={y}
            r="3.5"
            fill={d.color}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: d.delay, ease: [0.16, 1, 0.3, 1] }}
            style={{
              filter: `drop-shadow(0 0 6px ${d.color})`,
            }}
          />
        );
      })}
    </svg>
  );
}

/** Sparse drifting particles for cinematic atmosphere. */
function Particles() {
  // Deterministic seed so layout doesn't reflow across renders
  const dots = Array.from({ length: 38 }, (_, i) => ({
    x: ((i * 73) % 100),
    y: ((i * 41) % 100),
    delay: (i % 12) * 0.15,
    duration: 4 + (i % 5) * 0.4,
    size: ((i % 3) + 1) * 0.8,
  }));
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {dots.map((d, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: [0, 0.6, 0], y: [-10, -120] }}
          transition={{
            duration: d.duration,
            delay: d.delay,
            repeat: Infinity,
            ease: "easeOut",
          }}
          className="absolute rounded-full bg-white/40"
          style={{
            left: `${d.x}%`,
            top: `${d.y}%`,
            width: `${d.size}px`,
            height: `${d.size}px`,
          }}
        />
      ))}
    </div>
  );
}
