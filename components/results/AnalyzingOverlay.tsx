"use client";

import { motion } from "motion/react";

const PHASES = [
  "Reading your build…",
  "Scanning 120 years of Team USA athletes…",
  "Matching biometrics across Olympic and Paralympic data…",
  "Asking Gemini to write your archetype…",
];

export default function AnalyzingOverlay() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="text-center max-w-md"
      >
        <div className="relative size-32 mx-auto mb-10">
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-[var(--olympic)]"
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="absolute inset-3 rounded-full border-2 border-[var(--accent-gold)]"
            animate={{ rotate: -360 }}
            transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="absolute inset-6 rounded-full border-2 border-[var(--paralympic)]"
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="size-3 rounded-full bg-foreground animate-pulse" />
          </div>
        </div>

        <div className="display text-3xl font-semibold tracking-tight mb-6">
          Analyzing your athletic DNA
        </div>

        <div className="space-y-2.5">
          {PHASES.map((p, i) => (
            <motion.div
              key={p}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.7, duration: 0.4 }}
              className="text-sm text-muted-soft"
            >
              {p}
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
