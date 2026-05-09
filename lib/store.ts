"use client";

import { create } from "zustand";
import type { ArchetypeResult, UserProfile } from "./types";

type OnboardingState = {
  step: number;
  profile: Partial<UserProfile>;
  result: ArchetypeResult | null;
  isAnalyzing: boolean;
  error: string | null;
  setStep: (step: number) => void;
  next: () => void;
  prev: () => void;
  update: (patch: Partial<UserProfile>) => void;
  reset: () => void;
  setResult: (r: ArchetypeResult | null) => void;
  setAnalyzing: (b: boolean) => void;
  setError: (e: string | null) => void;
};

export const TOTAL_STEPS = 9;

const INITIAL_PROFILE: Partial<UserProfile> = {
  firstName: "",
  sex: "M",
  heightCm: 178,
  weightKg: 75,
  age: 24,
  activityLevel: 4,
  explosiveVsEndurance: 0.5,
  reactionSpeed: 3,
  soloVsTeam: 0.5,
  hometown: "",
  reactionTimeMs: null,
  tapsPerSecond: null,
  climate: "any",
  favoriteSports: [],
};

// Map measured reaction time (ms) to the matcher's 1-5 reaction speed dial.
// Anchors: <200ms ≈ near-physical limit, >420ms ≈ deliberate. Skewed toward
// the central 250-330ms band where most users land.
export function reactionMsToScore(ms: number): 1 | 2 | 3 | 4 | 5 {
  if (ms <= 210) return 5;
  if (ms <= 270) return 4;
  if (ms <= 340) return 3;
  if (ms <= 420) return 2;
  return 1;
}

// Map measured taps-per-second to the same 1-5 dial. Sustained 8+ TPS over
// 5 seconds is genuinely fast-twitch; below 4 indicates relaxed tapping.
export function tpsToScore(tps: number): 1 | 2 | 3 | 4 | 5 {
  if (tps >= 8) return 5;
  if (tps >= 7) return 4;
  if (tps >= 5.5) return 3;
  if (tps >= 4) return 2;
  return 1;
}

// Combine the two measurements: take the max so users get credit for whichever
// dimension they're stronger on.
export function combinedReactionScore(
  ms: number | null | undefined,
  tps: number | null | undefined,
): 1 | 2 | 3 | 4 | 5 {
  const a = ms != null ? reactionMsToScore(ms) : null;
  const b = tps != null ? tpsToScore(tps) : null;
  if (a != null && b != null) return Math.max(a, b) as 1 | 2 | 3 | 4 | 5;
  if (a != null) return a;
  if (b != null) return b;
  return 3;
}

export const useOnboardingStore = create<OnboardingState>()((set) => ({
  step: 0,
  profile: { ...INITIAL_PROFILE },
  result: null,
  isAnalyzing: false,
  error: null,
  setStep: (step) => set({ step }),
  next: () => set((s) => ({ step: Math.min(TOTAL_STEPS - 1, s.step + 1) })),
  prev: () => set((s) => ({ step: Math.max(0, s.step - 1) })),
  update: (patch) => set((s) => ({ profile: { ...s.profile, ...patch } })),
  reset: () => set({ step: 0, profile: { ...INITIAL_PROFILE }, result: null, error: null }),
  setResult: (result) => set({ result }),
  setAnalyzing: (isAnalyzing) => set({ isAnalyzing }),
  setError: (error) => set({ error }),
}));
