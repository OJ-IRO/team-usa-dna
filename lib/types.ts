export type Sex = "M" | "F";

export type Games = "olympic" | "paralympic";

export type Medal = "Gold" | "Silver" | "Bronze" | null;

export type AthleteEvent = {
  year: number;
  sport: string;
  event: string;
  medal: Medal;
};

// Internal — never rendered, never named in output. Used only for clustering.
export type Athlete = {
  id: string;
  name: string;
  sex: Sex;
  height_cm: number | null;
  weight_kg: number | null;
  age: number | null;
  games: Games;
  events: AthleteEvent[];
  medals: { gold: number; silver: number; bronze: number };
  primarySport: string;
};

export type SportProfile = {
  power: number;
  endurance: number;
  speed: number;
  coordination: number;
  soloVsTeam: number;
  reactionDemand: number;
};

export type Climate =
  | "coastal"
  | "hot_humid"
  | "hot_dry"
  | "temperate"
  | "cold_continental"
  | "mountain"
  | "any";

export type UserProfile = {
  // Personalization (no matcher influence)
  firstName?: string;
  climate?: Climate;
  favoriteSports?: string[]; // explicit: NEVER used to score the matcher

  heightCm: number;
  weightKg: number;
  age: number;
  sex: Sex;
  activityLevel: 1 | 2 | 3 | 4 | 5;
  explosiveVsEndurance: number;
  reactionSpeed: 1 | 2 | 3 | 4 | 5; // derived from reactionTimeMs
  soloVsTeam: number;
  hometown: string;
  photoDataUrl?: string;
  // Measured by the in-app mini-games (optional — null = user skipped or not played).
  reactionTimeMs?: number | null;
  tapsPerSecond?: number | null;
  // True when user picked the twitch tier from the manual slider instead of
  // playing the game — used by the Measured Stats card to show "Tier X / 5"
  // instead of pretending the value was measured.
  tapsRatedManually?: boolean;
};

// A cluster of Team USA competitors grouped by games/sport/decade/sex.
// Public-facing output never references the individual athletes inside.
export type Cluster = {
  id: string; // e.g. "olympic-Swimming-2010s-M"
  games: Games;
  sport: string;
  decade: number; // 1900, 1910, ..., 2020
  sex: Sex;
  count: number;
  avgHeightCm: number | null;
  avgWeightKg: number | null;
  avgAge: number | null;
  // Total athlete-medals (sums across all members — each gold-winning team
  // member counts as one). Useful for ranking, less useful in UI than the
  // year-level summary below.
  medals: { gold: number; silver: number; bronze: number };
  // Distinct YEARS in which any cohort member won that medal. "Won gold in
  // 1952, 1956" reads cleanly to a fan; "26 gold athlete-credits" does not.
  medalYears: { gold: number[]; silver: number[]; bronze: number[] };
  // Distinct event labels seen in this cluster (sample, capped).
  representativeEvents: string[];
};

export type ClusterMatch = {
  cluster: Cluster;
  similarity: number;
  rationale: string[];
};

export type ArchetypeResult = {
  archetypeName: string;
  summary: string;
  strengthProfile: {
    power: number;
    endurance: number;
    speed: number;
    coordination: number;
  };
  olympicMatches: ClusterMatch[];
  paralympicMatches: ClusterMatch[];
  // Cohorts ranked 4-10 — sent to the agent so it can suggest alternates
  // when the user asks hypothetical questions; not displayed in the main UI.
  olympicAlternates?: ClusterMatch[];
  paralympicAlternates?: ClusterMatch[];
  // For the Time Machine slider: the user's best match within each decade.
  // Sparse map — only decades that produced a viable cluster appear.
  olympicByDecade?: Record<number, ClusterMatch>;
  paralympicByDecade?: Record<number, ClusterMatch>;
  olympicNarrative: string;
  paralympicNarrative: string;
  sportRecommendations: { sport: string; reason: string }[];
  hometownInsight: string;
  visionInsight?: string;
  disclaimer: string;
};
