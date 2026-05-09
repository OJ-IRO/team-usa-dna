// Fallback narrative when Gemini is unavailable. Composes the archetype output
// from cluster matches alone — no individual athletes ever named.

import type { ClusterMatch, UserProfile } from "./types";
import { profileForSport } from "./sport-taxonomy";
import { clusterLabel } from "./matching";

function dominantTrait(profile: UserProfile) {
  const explosive = 1 - profile.explosiveVsEndurance;
  if (explosive > 0.7) return "Explosive";
  if (profile.explosiveVsEndurance > 0.7) return "Endurance";
  if (profile.reactionSpeed >= 4) return "Reactive";
  if (profile.activityLevel >= 4) return "Versatile";
  return "Balanced";
}

function archetypeName(profile: UserProfile, top: ClusterMatch | undefined): string {
  const word = dominantTrait(profile);
  const sport = top?.cluster.sport ?? "Multi-Discipline";
  return `${word} ${sport} Archetype`;
}

function summarize(profile: UserProfile, top: ClusterMatch | undefined): string {
  const trait = dominantTrait(profile).toLowerCase();
  const sport = top?.cluster.sport ?? "varied disciplines";
  const company = profile.soloVsTeam > 0.6 ? "team-driven energy" : "solo competition focus";
  const greeting = profile.firstName ? `${profile.firstName}, your` : "Your";
  return `${greeting} ${profile.heightCm} cm / ${profile.weightKg} kg build, paired with a ${trait} preference and ${company}, places you closest to a Team USA cohort historically clustered in ${sport}. This profile could suit disciplines that reward ${trait === "explosive" ? "short, powerful efforts" : trait === "endurance" ? "long, sustained output" : "consistent versatility"}.`;
}

function narrativeFor(label: string, matches: ClusterMatch[]): string {
  if (matches.length === 0) {
    return `No ${label.toLowerCase()} cohort surfaced for this profile.`;
  }
  const labels = matches.map((m) => clusterLabel(m.cluster)).join("; ");
  const totalCohort = matches.reduce((n, m) => n + m.cluster.count, 0);
  const totalMedals = matches.reduce(
    (n, m) => n + m.cluster.medals.gold + m.cluster.medals.silver + m.cluster.medals.bronze,
    0,
  );
  return `Your closest ${label} cohorts — ${labels} — represent ${totalCohort} Team USA athletes who collectively earned ${totalMedals} medals. The matcher weighted average build, era, and sport demands.`;
}

function sportRecommendations(matches: ClusterMatch[]): { sport: string; reason: string }[] {
  const sports: { sport: string; count: number }[] = [];
  for (const m of matches) {
    const found = sports.find((s) => s.sport === m.cluster.sport);
    if (found) found.count += 1;
    else sports.push({ sport: m.cluster.sport, count: 1 });
  }
  sports.sort((a, b) => b.count - a.count);
  return sports.slice(0, 3).map((s) => {
    const profile = profileForSport(s.sport);
    const dominant =
      profile.power >= 0.8 ? "explosive power" :
      profile.endurance >= 0.85 ? "sustained endurance" :
      profile.coordination >= 0.9 ? "fine coordination" :
      profile.reactionDemand >= 0.9 ? "fast reactions" :
      "versatile athleticism";
    return {
      sport: s.sport,
      reason: `${s.sport} historically rewards ${dominant}, which could suit your profile.`,
    };
  });
}

export function fallbackNarrative(
  profile: UserProfile,
  olympicMatches: ClusterMatch[],
  paralympicMatches: ClusterMatch[],
) {
  const allMatches = [...olympicMatches, ...paralympicMatches];

  return {
    archetypeName: archetypeName(profile, olympicMatches[0]),
    summary: summarize(profile, olympicMatches[0]),
    sportRecommendations: sportRecommendations(allMatches),
    olympicNarrative: narrativeFor("Olympic", olympicMatches),
    paralympicNarrative: narrativeFor("Paralympic", paralympicMatches),
    hometownInsight: `${profile.hometown} has its own sports culture that could shape an athlete with this archetype. Hometown ecosystem details require Gemini's narrative model, which was unavailable for this request.`,
    visionInsight: undefined as string | undefined,
  };
}
