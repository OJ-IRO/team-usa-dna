"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";

import { TOTAL_STEPS, useOnboardingStore, reactionMsToScore, combinedReactionScore } from "@/lib/store";
import StepShell from "@/components/onboarding/StepShell";
import StepDots from "@/components/onboarding/StepDots";
import PreferenceSlider from "@/components/onboarding/PreferenceSlider";
import NumberDial from "@/components/onboarding/NumberDial";
import PhotoUpload from "@/components/onboarding/PhotoUpload";
import ReactionGame from "@/components/onboarding/ReactionGame";
import TwitchGame from "@/components/onboarding/TwitchGame";
import PrimaryButton from "@/components/ui/PrimaryButton";
import type { Climate, Sex, UserProfile } from "@/lib/types";

const CLIMATE_OPTIONS: { value: Climate; label: string; icon: string }[] = [
  { value: "coastal", label: "Coastal · breezy", icon: "🌊" },
  { value: "hot_humid", label: "Hot & humid", icon: "🌴" },
  { value: "hot_dry", label: "Hot & dry", icon: "🏜️" },
  { value: "temperate", label: "Temperate · 4 seasons", icon: "🍂" },
  { value: "cold_continental", label: "Cold continental", icon: "❄️" },
  { value: "mountain", label: "Mountain · high altitude", icon: "⛰️" },
  { value: "any", label: "No preference", icon: "🌐" },
];

const FAVORITE_SPORTS = [
  "Basketball", "Football (American)", "Soccer", "Baseball", "Track & Field",
  "Swimming", "Tennis", "Golf", "Cycling", "Volleyball", "Skiing/Snowboarding",
  "Gymnastics", "Wrestling", "Boxing/MMA", "Hockey", "Surfing", "Climbing",
];

export default function OnboardingPage() {
  const router = useRouter();
  const { step, profile, next, prev, update, setAnalyzing, setError, setResult } =
    useOnboardingStore();
  const [skipReaction, setSkipReaction] = useState(false);
  const [skipTwitch, setSkipTwitch] = useState(false);

  function NavFooter({ canNext = true, isFinal = false }: { canNext?: boolean; isFinal?: boolean }) {
    return (
      <>
        {step > 0 && (
          <PrimaryButton variant="ghost" onClick={prev}>
            Back
          </PrimaryButton>
        )}
        {!isFinal ? (
          <PrimaryButton onClick={next} disabled={!canNext}>
            Continue
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8H13M13 8L8.5 3.5M13 8L8.5 12.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </PrimaryButton>
        ) : (
          <PrimaryButton onClick={submit} disabled={!canNext}>
            Reveal my archetype
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8H13M13 8L8.5 3.5M13 8L8.5 12.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </PrimaryButton>
        )}
      </>
    );
  }

  async function submit() {
    setAnalyzing(true);
    setError(null);
    setResult(null);
    router.push("/results");
    try {
      // Derive matcher's reaction-speed from BOTH measured games (max of the two
      // mappings — a user with great reaction OR great twitch counts as quick).
      const reactionSpeed = combinedReactionScore(
        profile.reactionTimeMs,
        profile.tapsPerSecond,
      );
      const payload = { ...profile, reactionSpeed } as UserProfile;
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Request failed (${res.status})`);
      }
      const data = await res.json();
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setAnalyzing(false);
    }
  }

  const hometownOk = (profile.hometown ?? "").trim().length >= 2;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="px-6 sm:px-8 pt-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="size-6 rounded-lg bg-gradient-to-br from-[var(--olympic)] via-[var(--accent-gold)] to-[var(--paralympic)]" />
          <span className="font-semibold tracking-tight text-[15px]">Team USA DNA</span>
        </Link>
        <div className="flex-1 max-w-xs mx-6">
          <StepDots current={step} total={TOTAL_STEPS} />
        </div>
        <div className="text-xs text-muted-soft hidden sm:block">
          {Math.round(((step + 1) / TOTAL_STEPS) * 100)}%
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 sm:px-8 py-10">
        <AnimatePresence mode="wait">
          {step === 0 && (
            <StepShell
              key="intro"
              index={0}
              total={TOTAL_STEPS}
              title="Let's start with your name."
              subtitle="We'll personalize your archetype card. And one anchor for the matcher: which Olympic category you're competing in."
              footer={<NavFooter canNext={!!profile.sex && (profile.firstName ?? "").trim().length >= 1} />}
            >
              <div className="space-y-7">
                <div className="space-y-2">
                  <div className="text-xs uppercase tracking-[0.16em] text-muted-soft">First name</div>
                  <input
                    type="text"
                    placeholder="What should we call you?"
                    className="field-input text-2xl py-5"
                    value={profile.firstName ?? ""}
                    maxLength={40}
                    onChange={(e) => update({ firstName: e.target.value })}
                    autoFocus
                  />
                </div>
                <div className="space-y-3">
                  <div className="text-xs uppercase tracking-[0.16em] text-muted-soft">Olympic category</div>
                  <div className="grid grid-cols-2 gap-3">
                    {(["M", "F"] as Sex[]).map((s) => (
                      <motion.button
                        key={s}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => update({ sex: s })}
                        className={`glass rounded-2xl p-5 text-left transition-all ${
                          profile.sex === s ? "ring-2 ring-foreground bg-white/[0.08]" : "hover:bg-white/[0.06]"
                        }`}
                      >
                        <div className="display text-2xl font-semibold mb-0.5">
                          {s === "M" ? "Men's events" : "Women's events"}
                        </div>
                        <div className="text-xs text-muted-soft">
                          {s === "M" ? "Men's Olympic / Paralympic categories" : "Women's Olympic / Paralympic categories"}
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>
            </StepShell>
          )}

          {step === 1 && (
            <StepShell
              key="body"
              index={1}
              total={TOTAL_STEPS}
              title="Your build."
              subtitle="Height and weight in metric. The matcher uses these to find the most physically similar Team USA cohorts across 128 years."
              footer={<NavFooter />}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <NumberDial
                  label="Height"
                  unit="cm"
                  min={140}
                  max={220}
                  value={profile.heightCm ?? 178}
                  onChange={(v) => update({ heightCm: v })}
                />
                <NumberDial
                  label="Weight"
                  unit="kg"
                  min={40}
                  max={140}
                  value={profile.weightKg ?? 75}
                  onChange={(v) => update({ weightKg: v })}
                />
              </div>
            </StepShell>
          )}

          {step === 2 && (
            <StepShell
              key="age"
              index={2}
              total={TOTAL_STEPS}
              title="Age and intensity."
              subtitle="How old are you, and how active is your week on average?"
              footer={<NavFooter />}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <NumberDial
                  label="Age"
                  unit="yrs"
                  min={14}
                  max={70}
                  value={profile.age ?? 24}
                  onChange={(v) => update({ age: v })}
                />
                <div className="space-y-4">
                  <div className="text-xs uppercase tracking-[0.16em] text-muted-soft">
                    Activity level
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        onClick={() => update({ activityLevel: n as 1 | 2 | 3 | 4 | 5 })}
                        className={`rounded-xl py-4 text-lg font-semibold transition-all ${
                          profile.activityLevel === n
                            ? "bg-foreground text-background"
                            : "glass hover:bg-white/[0.08]"
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                  <div className="flex justify-between text-xs text-muted-soft">
                    <span>Sedentary</span>
                    <span>Elite</span>
                  </div>
                </div>
              </div>
            </StepShell>
          )}

          {step === 3 && (
            <StepShell
              key="explosive"
              index={3}
              total={TOTAL_STEPS}
              title="Style of competition."
              subtitle="Two quick reads on how you train and compete."
              footer={<NavFooter />}
            >
              <div className="space-y-10">
                <PreferenceSlider
                  value={profile.explosiveVsEndurance ?? 0.5}
                  onChange={(v) => update({ explosiveVsEndurance: v })}
                  leftLabel="Explosive"
                  leftHint="Sprinter, lifter, jumper"
                  rightLabel="Endurance"
                  rightHint="Marathon, distance, long sets"
                />
                <PreferenceSlider
                  value={profile.soloVsTeam ?? 0.5}
                  onChange={(v) => update({ soloVsTeam: v })}
                  leftLabel="Solo"
                  leftHint="Alone in the zone"
                  rightLabel="Team"
                  rightHint="Energy from the squad"
                />
              </div>
            </StepShell>
          )}

          {step === 4 && (
            <StepShell
              key="reaction-game"
              index={4}
              total={TOTAL_STEPS}
              title="Reaction time."
              subtitle={skipReaction
                ? "No game — pick a tier from 1 (slow) to 5 (lightning)."
                : "Wait for green, tap as fast as you can. Five trials — we drop the slowest. Or skip and rate manually."}
              footer={
                <NavFooter
                  canNext={skipReaction
                    ? !!profile.reactionSpeed
                    : profile.reactionTimeMs != null && profile.reactionTimeMs > 0}
                />
              }
            >
              {!skipReaction ? (
                <>
                  <ReactionGame
                    onComplete={(avgMs) => update({ reactionTimeMs: avgMs })}
                  />
                  {profile.reactionTimeMs != null && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.2 }}
                      className="mt-4 text-sm text-muted text-center"
                    >
                      Mapped to reaction tier <span className="text-foreground font-mono">{reactionMsToScore(profile.reactionTimeMs)}/5</span> for the matcher.
                    </motion.div>
                  )}
                </>
              ) : (
                <ManualReactionPicker
                  value={profile.reactionSpeed ?? 3}
                  onChange={(n) => update({ reactionSpeed: n, reactionTimeMs: null })}
                />
              )}
              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setSkipReaction((b) => !b);
                    if (!skipReaction) update({ reactionTimeMs: null });
                  }}
                  className="text-xs uppercase tracking-[0.18em] text-muted-soft hover:text-foreground transition"
                >
                  {skipReaction ? "← Play the game instead" : "Skip — rate manually"}
                </button>
              </div>
            </StepShell>
          )}

          {step === 5 && (
            <StepShell
              key="twitch-game"
              index={5}
              total={TOTAL_STEPS}
              title="Quick-twitch tap."
              subtitle={skipTwitch
                ? "No game — pick a tier from 1 (relaxed) to 5 (fast-twitch dominant)."
                : "Tap as many times as you can in five seconds. Single hand, index finger. Or skip and rate manually."}
              footer={
                <NavFooter
                  canNext={skipTwitch
                    ? true
                    : profile.tapsPerSecond != null && profile.tapsPerSecond > 0}
                />
              }
            >
              {!skipTwitch ? (
                <TwitchGame
                  onComplete={(_taps, tps) => update({ tapsPerSecond: tps })}
                />
              ) : (
                <ManualTwitchPicker
                  value={profile.tapsPerSecond ?? null}
                  onChange={(tps) => update({ tapsPerSecond: tps })}
                />
              )}
              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setSkipTwitch((b) => !b);
                    if (!skipTwitch) update({ tapsPerSecond: null });
                  }}
                  className="text-xs uppercase tracking-[0.18em] text-muted-soft hover:text-foreground transition"
                >
                  {skipTwitch ? "← Play the game instead" : "Skip — rate manually"}
                </button>
              </div>
            </StepShell>
          )}

          {step === 6 && (
            <StepShell
              key="climate-favorites"
              index={6}
              total={TOTAL_STEPS}
              title="Vibe and favorites."
              subtitle="Your preferred climate shapes the narrative. Your favorite sports are personalization only — they do not influence what we say you'd be good at."
              footer={<NavFooter />}
            >
              <div className="space-y-8">
                <div className="space-y-3">
                  <div className="text-xs uppercase tracking-[0.16em] text-muted-soft">Preferred climate</div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {CLIMATE_OPTIONS.map((c) => (
                      <button
                        key={c.value}
                        onClick={() => update({ climate: c.value })}
                        className={`glass rounded-xl p-4 text-left transition-all ${
                          profile.climate === c.value ? "ring-2 ring-foreground bg-white/[0.08]" : "hover:bg-white/[0.06]"
                        }`}
                      >
                        <div className="text-2xl mb-1">{c.icon}</div>
                        <div className="text-sm font-medium tracking-tight">{c.label}</div>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-baseline justify-between">
                    <div className="text-xs uppercase tracking-[0.16em] text-muted-soft">Favorite sports (optional)</div>
                    <div className="text-[11px] text-muted-soft italic">Tagging only — not used for matching</div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {FAVORITE_SPORTS.map((s) => {
                      const selected = (profile.favoriteSports ?? []).includes(s);
                      return (
                        <button
                          key={s}
                          onClick={() => {
                            const cur = profile.favoriteSports ?? [];
                            update({
                              favoriteSports: selected
                                ? cur.filter((x) => x !== s)
                                : [...cur, s],
                            });
                          }}
                          className={`px-3.5 py-2 rounded-full text-[13px] tracking-tight transition-all ${
                            selected
                              ? "bg-foreground text-background"
                              : "glass text-muted hover:text-foreground"
                          }`}
                        >
                          {s}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </StepShell>
          )}

          {step === 7 && (
            <StepShell
              key="hometown"
              index={7}
              total={TOTAL_STEPS}
              title="Where are you from?"
              subtitle="Hometown shapes the sports you grew up around. This adds context — it never determines the result."
              footer={<NavFooter canNext={hometownOk} />}
            >
              <input
                type="text"
                placeholder="e.g. Boulder, CO"
                className="field-input text-2xl py-5"
                value={profile.hometown ?? ""}
                onChange={(e) => update({ hometown: e.target.value })}
                autoFocus
              />
            </StepShell>
          )}

          {step === 8 && (
            <StepShell
              key="photo"
              index={8}
              total={TOTAL_STEPS}
              title="Optional: add a photo."
              subtitle="If you upload one, Gemini's vision will read apparent build cues and weave them into your archetype. Skip if you'd rather not."
              footer={<NavFooter isFinal />}
            >
              <PhotoUpload
                value={profile.photoDataUrl}
                onChange={(v) => update({ photoDataUrl: v })}
              />
            </StepShell>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

function ManualReactionPicker({
  value,
  onChange,
}: {
  value: number;
  onChange: (n: 1 | 2 | 3 | 4 | 5) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-5 gap-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            onClick={() => onChange(n as 1 | 2 | 3 | 4 | 5)}
            className={`rounded-xl py-6 text-2xl font-semibold transition-all ${
              value === n ? "bg-foreground text-background" : "glass hover:bg-white/[0.08]"
            }`}
          >
            {n}
          </button>
        ))}
      </div>
      <div className="flex justify-between text-xs text-muted-soft">
        <span>Slow / deliberate</span>
        <span>Lightning</span>
      </div>
    </div>
  );
}

function ManualTwitchPicker({
  value,
  onChange,
}: {
  value: number | null;
  onChange: (tps: number) => void;
}) {
  // Map 1-5 buttons to representative TPS values for the matcher.
  const presets = [
    { tier: 1, tps: 3.5, label: "Casual" },
    { tier: 2, tps: 5, label: "Steady" },
    { tier: 3, tps: 6.5, label: "Sharp" },
    { tier: 4, tps: 8, label: "Fast-twitch" },
    { tier: 5, tps: 10, label: "Lightning" },
  ];
  const matched = value != null ? presets.reduce((closest, p) => Math.abs(p.tps - value) < Math.abs(closest.tps - value) ? p : closest, presets[0]) : null;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-5 gap-2">
        {presets.map((p) => (
          <button
            key={p.tier}
            onClick={() => onChange(p.tps)}
            className={`rounded-xl py-5 transition-all ${
              matched?.tier === p.tier ? "bg-foreground text-background" : "glass hover:bg-white/[0.08]"
            }`}
          >
            <div className="text-2xl font-semibold">{p.tier}</div>
            <div className="text-[10px] uppercase tracking-[0.14em] mt-1 opacity-70">{p.label}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
