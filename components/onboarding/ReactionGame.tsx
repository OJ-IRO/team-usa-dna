"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

const TRIALS = 3;
const MIN_DELAY_MS = 1100;
const MAX_DELAY_MS = 2800;

type Phase = "idle" | "armed" | "go" | "done";

export default function ReactionGame({
  onComplete,
}: {
  onComplete: (avgMs: number, trials: number[]) => void;
}) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [trials, setTrials] = useState<number[]>([]);
  const [lastMs, setLastMs] = useState<number | null>(null);
  const [tooSoon, setTooSoon] = useState(false);
  const goAtRef = useRef<number>(0);
  const armTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function arm() {
    setTooSoon(false);
    setLastMs(null);
    setPhase("armed");
    const delay = MIN_DELAY_MS + Math.random() * (MAX_DELAY_MS - MIN_DELAY_MS);
    armTimerRef.current = setTimeout(() => {
      goAtRef.current = performance.now();
      setPhase("go");
    }, delay);
  }

  function handleClick() {
    if (phase === "idle") {
      // Resume from current trial count — only the explicit "Play again"
      // button in the GradeBanner clears trials.
      arm();
      return;
    }
    if (phase === "armed") {
      // Clicked too early. Just go back to idle WITHOUT clearing prior trials —
      // user can immediately tap to retry the current trial.
      if (armTimerRef.current) clearTimeout(armTimerRef.current);
      setTooSoon(true);
      setPhase("idle");
      return;
    }
    // phase === "done" intentionally does nothing — replay is handled by the
    // dedicated button in the GradeBanner so a stray click can't restart.
    if (phase === "done") return;
    if (phase === "go") {
      const elapsed = Math.round(performance.now() - goAtRef.current);
      setLastMs(elapsed);
      const newTrials = [...trials, elapsed];
      setTrials(newTrials);

      if (newTrials.length >= TRIALS) {
        // Drop slowest, average the rest
        const sorted = [...newTrials].sort((a, b) => a - b);
        const kept = sorted.slice(0, sorted.length - 1);
        const avg = Math.round(kept.reduce((s, v) => s + v, 0) / kept.length);
        setPhase("done");
        setTimeout(() => onComplete(avg, newTrials), 800);
      } else {
        setPhase("idle");
        setTimeout(arm, 700);
      }
    }
  }

  useEffect(() => {
    return () => {
      if (armTimerRef.current) clearTimeout(armTimerRef.current);
    };
  }, []);

  const padBg =
    phase === "armed"
      ? "bg-[#3a0e10] border-[var(--accent-red)]/50"
      : phase === "go"
      ? "bg-emerald-500/40 border-emerald-300"
      : phase === "done"
      ? "bg-[var(--accent-gold)]/30 border-[var(--accent-gold)]/60"
      : "bg-white/[0.03] border-white/10";

  const text =
    phase === "idle"
      ? trials.length === 0
        ? "Tap to start"
        : `Tap when you see green · ${trials.length}/${TRIALS}`
      : phase === "armed"
      ? "Wait for green…"
      : phase === "go"
      ? "TAP NOW"
      : "Done";

  return (
    <div className="space-y-5">
      <button
        type="button"
        onClick={handleClick}
        className={`w-full h-56 rounded-2xl border-2 transition-colors duration-150 select-none flex items-center justify-center font-semibold text-2xl tracking-tight ${padBg}`}
      >
        <AnimatePresence mode="wait">
          <motion.span
            key={phase}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            {text}
          </motion.span>
        </AnimatePresence>
      </button>

      <div className="flex items-center justify-between text-sm">
        <div className="flex gap-1.5">
          {Array.from({ length: TRIALS }).map((_, i) => (
            <div
              key={i}
              className={`size-2.5 rounded-full transition-all ${
                i < trials.length
                  ? "bg-foreground"
                  : i === trials.length && phase !== "idle"
                  ? "bg-foreground/50"
                  : "bg-white/10"
              }`}
            />
          ))}
        </div>
        <div className="text-muted-soft tabular-nums font-mono">
          {lastMs != null && phase !== "done" && `Last: ${lastMs} ms`}
          {tooSoon && <span className="text-accent-red">Too soon — try again</span>}
        </div>
      </div>
      {phase === "done" && trials.length === TRIALS && (
        <GradeBanner ms={avgOfBest(trials)} onReplay={() => { setTrials([]); arm(); }} />
      )}
    </div>
  );
}

function avgOfBest(trials: number[]) {
  const sorted = [...trials].sort((a, b) => a - b);
  const kept = sorted.slice(0, sorted.length - 1);
  return Math.round(kept.reduce((s, v) => s + v, 0) / kept.length);
}

function gradeFor(ms: number) {
  if (ms <= 220) return { letter: "S", color: "var(--accent-gold)", note: "Elite reflex band" };
  if (ms <= 260) return { letter: "A", color: "var(--olympic)", note: "Olympic-fast" };
  if (ms <= 310) return { letter: "B", color: "#7dc4f5", note: "Above the average crowd" };
  if (ms <= 380) return { letter: "C", color: "#cccccc", note: "Right at the median" };
  return { letter: "D", color: "var(--paralympic)", note: "Plenty of headroom" };
}

function GradeBanner({ ms, onReplay }: { ms: number; onReplay: () => void }) {
  const g = gradeFor(ms);
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
        <div className="display text-2xl font-semibold tabular-nums tracking-tight">{ms} ms</div>
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
