"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";

import { useOnboardingStore } from "@/lib/store";
import AnalyzingOverlay from "@/components/results/AnalyzingOverlay";
import CinematicReveal from "@/components/results/CinematicReveal";
import ArchetypeHero from "@/components/results/ArchetypeHero";
import MatchesSection from "@/components/results/MatchesSection";
import InsightCard from "@/components/results/InsightCard";
import HometownEcosystem from "@/components/results/HometownEcosystem";
import ShareCardSection from "@/components/results/ShareCardSection";
import AskAgent from "@/components/results/AskAgent";
import TimeMachine from "@/components/results/TimeMachine";
import CohortDetailModal from "@/components/results/CohortDetailModal";
import type { ClusterMatch } from "@/lib/types";
import PrimaryButton from "@/components/ui/PrimaryButton";
import type { UserProfile } from "@/lib/types";

// Maps the ManualTwitchPicker preset TPS values back to the user's chosen tier.
function tpsTierLabel(tps: number): number {
  if (tps >= 9.5) return 5;
  if (tps >= 7.5) return 4;
  if (tps >= 6) return 3;
  if (tps >= 4.5) return 2;
  return 1;
}

// three.js bundle is heavy — lazy-load and skip SSR (it touches `window`).
const ArchetypeConstellation = dynamic(
  () => import("@/components/results/ArchetypeConstellation"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full aspect-[16/10] sm:aspect-[16/8] rounded-3xl glass flex items-center justify-center">
        <div className="text-xs uppercase tracking-[0.2em] text-muted-soft animate-pulse">
          Rendering constellation…
        </div>
      </div>
    ),
  },
);

export default function ResultsPage() {
  const router = useRouter();
  const { result, isAnalyzing, error, profile, reset } = useOnboardingStore();
  const [revealComplete, setRevealComplete] = useState(false);
  const [modalMatch, setModalMatch] = useState<ClusterMatch | null>(null);
  const [modalVariant, setModalVariant] = useState<"olympic" | "paralympic">("olympic");

  function openModal(m: ClusterMatch, v: "olympic" | "paralympic") {
    setModalMatch(m);
    setModalVariant(v);
  }

  // If user lands here directly without any data, send them home.
  useEffect(() => {
    if (!isAnalyzing && !result && !error && !profile.heightCm) {
      router.replace("/");
    }
  }, [isAnalyzing, result, error, profile.heightCm, router]);

  if (isAnalyzing && !result) {
    return <AnalyzingOverlay />;
  }

  if (error && !result) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-md text-center space-y-4">
          <div className="text-xs uppercase tracking-[0.18em] text-accent-red font-mono">
            Something went wrong
          </div>
          <h2 className="display text-3xl font-semibold tracking-tight">
            We couldn&apos;t finish your analysis.
          </h2>
          <p className="text-muted text-sm">{error}</p>
          <div className="pt-3">
            <PrimaryButton href="/onboarding">Try again</PrimaryButton>
          </div>
        </div>
      </div>
    );
  }

  if (!result) return null;

  return (
    <div className="min-h-screen pb-20">
      {/* Cinematic 6-second reveal that plays once on first arrival with a fresh result. */}
      {!revealComplete && (
        <CinematicReveal
          result={result}
          firstName={profile.firstName}
          onComplete={() => setRevealComplete(true)}
        />
      )}
      <header className="px-6 sm:px-8 pt-6 pb-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="size-6 rounded-lg bg-gradient-to-br from-[var(--olympic)] via-[var(--accent-gold)] to-[var(--paralympic)]" />
          <span className="font-semibold tracking-tight text-[15px]">Team USA DNA</span>
        </Link>
        <div className="flex items-center gap-2">
          <PrimaryButton
            variant="ghost"
            onClick={() => {
              reset();
              router.push("/onboarding");
            }}
          >
            Start over
          </PrimaryButton>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 sm:px-8 space-y-12 pt-4">
        <ArchetypeConstellation result={result} />
        <ArchetypeHero result={result} firstName={profile.firstName} />

        <InsightCard label="Measured stats" title="What we clocked from your mini-games">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
            {/* Reaction tile — shows measured ms when game was played, otherwise the manually-rated tier so the card never feels empty */}
            <div className="rounded-xl bg-white/[0.04] p-5">
              <div className="text-xs uppercase tracking-[0.16em] text-muted-soft mb-2">Reaction time</div>
              {profile.reactionTimeMs != null ? (
                <>
                  <div className="display text-4xl font-semibold tabular-nums">
                    {profile.reactionTimeMs}
                    <span className="text-base text-muted-soft ml-1.5">ms</span>
                  </div>
                  <div className="text-xs text-muted-soft mt-2">
                    {profile.reactionTimeMs <= 250
                      ? "Fast — top range for measured users"
                      : profile.reactionTimeMs <= 330
                      ? "Solid — central band"
                      : "Deliberate — there's headroom"}
                  </div>
                </>
              ) : (
                <>
                  <div className="display text-4xl font-semibold tabular-nums">
                    {profile.reactionSpeed ?? 3}
                    <span className="text-base text-muted-soft ml-1.5">/ 5</span>
                  </div>
                  <div className="text-xs text-muted-soft mt-2">
                    Self-rated · skipped the timing game
                  </div>
                </>
              )}
            </div>

            {/* Twitch tile — same treatment. tapsRatedManually means the user
                picked a tier slider; we surface the tier rather than the
                representative TPS so the card can't read as a measured number. */}
            <div className="rounded-xl bg-white/[0.04] p-5">
              <div className="text-xs uppercase tracking-[0.16em] text-muted-soft mb-2">Quick twitch</div>
              {profile.tapsPerSecond != null && !profile.tapsRatedManually ? (
                <>
                  <div className="display text-4xl font-semibold tabular-nums">
                    {profile.tapsPerSecond.toFixed(1)}
                    <span className="text-base text-muted-soft ml-1.5">taps/s</span>
                  </div>
                  <div className="text-xs text-muted-soft mt-2">
                    {profile.tapsPerSecond >= 8
                      ? "Elite fast-twitch sustain"
                      : profile.tapsPerSecond >= 6
                      ? "Above average burst rate"
                      : "Steady, controlled tap"}
                  </div>
                </>
              ) : (
                <>
                  <div className="display text-4xl font-semibold tabular-nums">
                    {profile.tapsPerSecond != null
                      ? tpsTierLabel(profile.tapsPerSecond)
                      : (profile.reactionSpeed ?? 3)}
                    <span className="text-base text-muted-soft ml-1.5">/ 5</span>
                  </div>
                  <div className="text-xs text-muted-soft mt-2">
                    Self-rated · skipped the tap test
                  </div>
                </>
              )}
            </div>
          </div>
        </InsightCard>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <HometownEcosystem
            hometown={profile.hometown}
            geminiInsight={result.hometownInsight}
          />
          <InsightCard label="Sports that could fit" title="Top 3 sport matches">
            <ul className="space-y-3 mt-2">
              {result.sportRecommendations.map((s, i) => (
                <li key={i} className="flex gap-4">
                  <span className="text-2xl font-mono text-muted-soft tabular-nums w-7 shrink-0">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <div className="font-semibold tracking-tight">{s.sport}</div>
                    <div className="text-sm text-muted leading-relaxed">{s.reason}</div>
                  </div>
                </li>
              ))}
            </ul>
          </InsightCard>
        </div>

        {result.visionInsight && (
          <InsightCard
            label="Vision"
            title="What the photo suggested"
            body={result.visionInsight}
            delay={0.05}
          />
        )}

        <MatchesSection
          variant="olympic"
          subtitle="Olympic cohorts · 1896–2024"
          title="Closest Team USA Olympic cohorts"
          narrative={result.olympicNarrative}
          matches={result.olympicMatches}
          onExpand={(m) => openModal(m, "olympic")}
        />

        <MatchesSection
          variant="paralympic"
          subtitle="Paralympic cohorts"
          title="Closest Team USA Paralympic cohorts"
          narrative={result.paralympicNarrative}
          matches={result.paralympicMatches}
          onExpand={(m) => openModal(m, "paralympic")}
        />

        <TimeMachine
          olympicByDecade={result.olympicByDecade}
          paralympicByDecade={result.paralympicByDecade}
        />

        <AskAgent result={result} profile={profile as UserProfile} />

        <ShareCardSection result={result} firstName={profile.firstName} />

        <div className="pt-6 text-xs text-muted-soft leading-relaxed border-t border-white/5">
          {result.disclaimer}
        </div>
      </main>

      <CohortDetailModal
        match={modalMatch}
        variant={modalVariant}
        onClose={() => setModalMatch(null)}
      />
    </div>
  );
}
