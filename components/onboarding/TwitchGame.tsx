"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

const DURATION_MS = 5000;

type Phase = "idle" | "running" | "done";

export default function TwitchGame({
  onComplete,
}: {
  onComplete: (taps: number, tps: number) => void;
}) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [taps, setTaps] = useState(0);
  const [remainingMs, setRemainingMs] = useState(DURATION_MS);
  const startRef = useRef(0);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stopRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function start() {
    setTaps(0);
    setRemainingMs(DURATION_MS);
    setPhase("running");
    startRef.current = performance.now();
    tickRef.current = setInterval(() => {
      const elapsed = performance.now() - startRef.current;
      const left = Math.max(0, DURATION_MS - elapsed);
      setRemainingMs(left);
    }, 33);
    stopRef.current = setTimeout(() => {
      finish();
    }, DURATION_MS);
  }

  function finish() {
    if (tickRef.current) clearInterval(tickRef.current);
    if (stopRef.current) clearTimeout(stopRef.current);
    setRemainingMs(0);
    setPhase("done");
    setTaps((current) => {
      const tps = Math.round((current / (DURATION_MS / 1000)) * 10) / 10;
      setTimeout(() => onComplete(current, tps), 750);
      return current;
    });
  }

  function tap() {
    if (phase === "idle") {
      start();
      // Count this tap as the trigger but not as a play tap (game starts now).
      return;
    }
    if (phase === "running") {
      setTaps((t) => t + 1);
    }
    // phase === "done" intentionally does nothing — replay is handled by the
    // dedicated button in the GradeBanner so an over-tap can't restart.
  }

  useEffect(() => {
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
      if (stopRef.current) clearTimeout(stopRef.current);
    };
  }, []);

  const progress = 1 - remainingMs / DURATION_MS;
  const displayText =
    phase === "idle" ? (taps === 0 ? "Tap to start · 5 seconds" : "Tap to play again")
    : phase === "running" ? "TAP! TAP! TAP!"
    : `Done — ${taps} taps`;

  return (
    <div className="space-y-5">
      <button
        type="button"
        onClick={tap}
        className={`relative w-full h-56 rounded-2xl border-2 transition-colors duration-100 select-none overflow-hidden ${
          phase === "running"
            ? "bg-[var(--olympic)]/15 border-[var(--olympic)]/60"
            : phase === "done"
            ? "bg-[var(--accent-gold)]/20 border-[var(--accent-gold)]/60"
            : "bg-white/[0.03] border-white/10"
        }`}
      >
        {/* Progress fill */}
        {phase === "running" && (
          <div
            className="absolute inset-0 origin-left"
            style={{
              background:
                "linear-gradient(90deg, rgba(73,131,255,0.18), rgba(73,131,255,0.04))",
              transform: `scaleX(${progress})`,
              transformOrigin: "left",
              transition: "transform 33ms linear",
            }}
          />
        )}
        <div className="relative h-full flex flex-col items-center justify-center gap-2">
          <AnimatePresence mode="wait">
            <motion.span
              key={phase}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="font-semibold text-2xl tracking-tight"
            >
              {displayText}
            </motion.span>
          </AnimatePresence>
          {phase === "running" && (
            <div className="display text-7xl font-semibold tabular-nums tracking-tight">
              {taps}
            </div>
          )}
        </div>
      </button>

      <div className="flex items-center justify-between text-sm">
        <div className="text-muted-soft font-mono tabular-nums">
          {phase === "running" && `${(remainingMs / 1000).toFixed(1)}s left`}
          {phase === "idle" && taps === 0 && "Single hand only · use index finger"}
        </div>
      </div>
      {phase === "done" && taps > 0 && (
        <GradeBanner taps={taps} onReplay={start} />
      )}
    </div>
  );
}

function gradeFor(tps: number) {
  if (tps >= 9) return { letter: "S", color: "var(--accent-gold)", note: "Sustained elite twitch" };
  if (tps >= 7.5) return { letter: "A", color: "var(--olympic)", note: "Fast-twitch dominant" };
  if (tps >= 6) return { letter: "B", color: "#7dc4f5", note: "Above the average crowd" };
  if (tps >= 4.5) return { letter: "C", color: "#cccccc", note: "Steady, controlled tap" };
  return { letter: "D", color: "var(--paralympic)", note: "Casual pace" };
}

function GradeBanner({ taps, onReplay }: { taps: number; onReplay: () => void }) {
  const tps = taps / 5;
  const g = gradeFor(tps);
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl glass glass-shine p-5 flex items-center gap-5"
    >
      <div
        className="size-16 rounded-2xl flex items-center justify-center display text-4xl font-semibold"
        style={{ background: g.color, color: "#000" }}
      >
        {g.letter}
      </div>
      <div className="flex-1">
        <div className="display text-2xl font-semibold tabular-nums tracking-tight">
          {taps} taps · {tps.toFixed(1)}/s
        </div>
        <div className="text-xs uppercase tracking-[0.16em] text-muted-soft mt-1">{g.note}</div>
      </div>
      <button
        type="button"
        onClick={onReplay}
        className="text-xs uppercase tracking-[0.18em] text-muted-soft hover:text-foreground transition"
      >
        Play again ↻
      </button>
    </motion.div>
  );
}
