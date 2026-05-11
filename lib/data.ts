import "server-only";
import historicalOlympic from "@/data/olympic-usa.json";
import modernOlympic from "@/data/modern-usa.json";
import modernOlympicExtended from "@/data/modern-usa-extended.json";
import winter2026Olympic from "@/data/winter-2026-olympic.json";
import paralympicCurated from "@/data/paralympic-usa.json";
import paralympicEnriched from "@/data/paralympic-enriched.json";
import paralympicHistorical from "@/data/paralympic-enriched-historical.json";
import paralympicModernExtended from "@/data/paralympic-modern-extended.json";
import winter2026Paralympic from "@/data/winter-2026-paralympic.json";
import type { Athlete, Cluster, Games, Sex } from "./types";

const MIN_CLUSTER_SIZE = 5;
const REP_EVENTS_CAP = 4;

// Internal pools — never returned to clients. Used only to compute clusters.
const olympicPool = [
  ...(historicalOlympic as Athlete[]),
  ...(modernOlympic as Athlete[]),
  ...(modernOlympicExtended as Athlete[]),
  ...(winter2026Olympic as Athlete[]),
];
const paralympicPool = [
  ...(paralympicCurated as Athlete[]),
  ...(paralympicEnriched as Athlete[]),
  ...(paralympicHistorical as Athlete[]),
  ...(paralympicModernExtended as Athlete[]),
  ...(winter2026Paralympic as Athlete[]),
];

function decadeOf(year: number): number {
  return Math.floor(year / 10) * 10;
}

function avgOrNull(values: number[]): number | null {
  if (values.length === 0) return null;
  const sum = values.reduce((s, v) => s + v, 0);
  return sum / values.length;
}

function buildClusters(pool: Athlete[], games: Games): Cluster[] {
  // An athlete belongs to EVERY decade they competed in (not just debut).
  // A swimmer who raced 2008-2024 contributes to the 2000s, 2010s AND 2020s
  // Swimming clusters — but each cluster only counts events/medals from
  // its own decade. This way the 2020s cluster surfaces 2020 + 2024 medals,
  // and the 2000s cluster shows only 2000-2008 medals — clean semantics.
  type Bucket = {
    sport: string;
    decade: number;
    sex: Sex;
    members: Array<{ athlete: Athlete; eventsInDecade: Athlete["events"] }>;
  };
  const buckets = new Map<string, Bucket>();

  for (const a of pool) {
    if (a.events.length === 0) continue;
    const eventsByDecade = new Map<number, Athlete["events"]>();
    for (const e of a.events) {
      const dec = decadeOf(e.year);
      if (!eventsByDecade.has(dec)) eventsByDecade.set(dec, []);
      eventsByDecade.get(dec)!.push(e);
    }
    for (const [decade, eventsInDecade] of eventsByDecade) {
      const key = `${a.primarySport}-${decade}-${a.sex}`;
      if (!buckets.has(key)) {
        buckets.set(key, { sport: a.primarySport, decade, sex: a.sex, members: [] });
      }
      buckets.get(key)!.members.push({ athlete: a, eventsInDecade });
    }
  }

  const clusters: Cluster[] = [];
  for (const b of buckets.values()) {
    if (b.members.length < MIN_CLUSTER_SIZE && games === "olympic") continue;
    if (games === "paralympic" && b.members.length < 2) continue;

    const heights = b.members.map((m) => m.athlete.height_cm).filter((v): v is number => v != null);
    const weights = b.members.map((m) => m.athlete.weight_kg).filter((v): v is number => v != null);
    const ages = b.members.map((m) => m.athlete.age).filter((v): v is number => v != null);

    // Medal counts and years come from THIS decade's events only.
    let gold = 0, silver = 0, bronze = 0;
    const goldYears = new Set<number>();
    const silverYears = new Set<number>();
    const bronzeYears = new Set<number>();
    const eventCounts = new Map<string, number>();
    for (const m of b.members) {
      for (const e of m.eventsInDecade) {
        if (e.medal === "Gold") { gold++; goldYears.add(e.year); }
        else if (e.medal === "Silver") { silver++; silverYears.add(e.year); }
        else if (e.medal === "Bronze") { bronze++; bronzeYears.add(e.year); }
        eventCounts.set(e.event, (eventCounts.get(e.event) || 0) + 1);
      }
    }

    const representativeEvents = Array.from(eventCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, REP_EVENTS_CAP)
      .map(([event]) => event);

    clusters.push({
      id: `${games}-${b.sport.replace(/\s+/g, "_")}-${b.decade}s-${b.sex}`,
      games,
      sport: b.sport,
      decade: b.decade,
      sex: b.sex,
      count: b.members.length,
      avgHeightCm: avgOrNull(heights) != null ? Math.round(avgOrNull(heights)!) : null,
      avgWeightKg: avgOrNull(weights) != null ? Math.round(avgOrNull(weights)!) : null,
      avgAge: avgOrNull(ages) != null ? Math.round(avgOrNull(ages)!) : null,
      medals: { gold, silver, bronze },
      medalYears: {
        gold: Array.from(goldYears).sort((a, b) => a - b),
        silver: Array.from(silverYears).sort((a, b) => a - b),
        bronze: Array.from(bronzeYears).sort((a, b) => a - b),
      },
      representativeEvents,
    });
  }

  return clusters;
}

export const olympicClusters = buildClusters(olympicPool, "olympic");
export const paralympicClusters = buildClusters(paralympicPool, "paralympic");

export function datasetStats() {
  const allOlympicYears = olympicPool.flatMap((a) => a.events.map((e) => e.year));
  const olympicYearMin = allOlympicYears.length ? Math.min(...allOlympicYears) : 0;
  const olympicYearMax = allOlympicYears.length ? Math.max(...allOlympicYears) : 0;
  return {
    olympicCount: olympicPool.length,
    paralympicCount: paralympicPool.length,
    olympicClusterCount: olympicClusters.length,
    paralympicClusterCount: paralympicClusters.length,
    olympicYearSpan: { min: olympicYearMin, max: olympicYearMax },
    historicalCount: (historicalOlympic as Athlete[]).length,
    modernCount: (modernOlympic as Athlete[]).length,
  };
}
