import type { Cluster, ClusterMatch, UserProfile } from "./types";
import { profileForSport } from "./sport-taxonomy";

const HEIGHT_TOLERANCE_CM = 30;
const WEIGHT_TOLERANCE_KG = 30;
const AGE_TOLERANCE_YR = 20;

function clamp01(x: number) {
  return Math.max(0, Math.min(1, x));
}

function bioSimilarity(user: UserProfile, c: Cluster) {
  const reasons: string[] = [];

  let parts = 0;
  let count = 0;

  if (c.avgHeightCm != null) {
    const delta = Math.abs(user.heightCm - c.avgHeightCm);
    const score = clamp01(1 - delta / HEIGHT_TOLERANCE_CM);
    parts += score;
    count += 1;
    if (delta === 0) reasons.push(`Exact height match — ${c.avgHeightCm} cm`);
    else if (delta <= 2) reasons.push(`Almost the same height as this cohort`);
    else if (delta <= 5) reasons.push(`Height within ${Math.round(delta)} cm of cohort average`);
  }
  if (c.avgWeightKg != null) {
    const delta = Math.abs(user.weightKg - c.avgWeightKg);
    const score = clamp01(1 - delta / WEIGHT_TOLERANCE_KG);
    parts += score;
    count += 1;
    if (delta === 0) reasons.push(`Exact weight match — ${c.avgWeightKg} kg`);
    else if (delta <= 2) reasons.push(`Same build weight-wise as this cohort`);
    else if (delta <= 6) reasons.push(`Weight within ${Math.round(delta)} kg of cohort average`);
  }
  if (c.avgAge != null) {
    const delta = Math.abs(user.age - c.avgAge);
    const score = clamp01(1 - delta / AGE_TOLERANCE_YR);
    parts += score;
    count += 1;
    if (delta <= 2) reasons.push(`This cohort peaked at your age (avg ${c.avgAge})`);
    else if (delta <= 5) reasons.push(`This cohort peaked within ${Math.round(delta)} years of your age`);
  }

  const bioScore = count > 0 ? parts / count : 0.5;
  const sexMatch = user.sex === c.sex ? 1 : 0.55;
  return { bioScore: bioScore * sexMatch, reasons };
}

function sportSimilarity(user: UserProfile, c: Cluster) {
  const sport = profileForSport(c.sport);
  const reasons: string[] = [];

  const userExplosive = 1 - user.explosiveVsEndurance;
  const userEndurance = user.explosiveVsEndurance;
  const explosiveErr = Math.abs(userExplosive - sport.power);
  const enduranceErr = Math.abs(userEndurance - sport.endurance);
  const userReaction = (user.reactionSpeed - 1) / 4;
  const reactionErr = Math.abs(userReaction - sport.reactionDemand);
  const teamErr = Math.abs(user.soloVsTeam - sport.soloVsTeam);

  const totalErr = (explosiveErr + enduranceErr) * 0.35 + reactionErr * 0.15 + teamErr * 0.15;
  const score = clamp01(1 - totalErr);

  if (sport.power >= 0.85 && userExplosive >= 0.7) reasons.push(`Both you and this cohort lean explosive`);
  if (sport.endurance >= 0.85 && userEndurance >= 0.7) reasons.push(`Both built for sustained output`);
  if (sport.soloVsTeam >= 0.8 && user.soloVsTeam >= 0.7) reasons.push(`You both feed off team-sport energy`);
  if (sport.soloVsTeam <= 0.2 && user.soloVsTeam <= 0.3) reasons.push(`You both compete solo`);
  if (sport.reactionDemand >= 0.85 && userReaction >= 0.7) reasons.push(`Reaction demands match your reflexes`);
  if (sport.coordination >= 0.9) reasons.push(`Rewards the high coordination this profile suggests`);
  if (reasons.length === 0) {
    // Fallback: always give one sport-flavor line so the card never feels empty.
    if (sport.power > sport.endurance + 0.1) {
      reasons.push(`Power-leaning sport — fits the profile if you trend explosive`);
    } else if (sport.endurance > sport.power + 0.1) {
      reasons.push(`Endurance-leaning sport — fits the profile if you trend long-effort`);
    } else {
      reasons.push(`Balanced sport profile, similar to your blend`);
    }
  }

  return { sportScore: score, reasons };
}

function medalDensityBonus(c: Cluster) {
  const total = c.medals.gold + c.medals.silver + c.medals.bronze;
  const density = total / Math.max(1, c.count);
  return Math.min(1, density / 2); // 2 medals per athlete = max bonus
}

function cohortSizeBonus(c: Cluster) {
  // Slight preference for larger clusters (more confidence in averages).
  // Saturates around 30 members.
  return Math.min(1, c.count / 30);
}

export function rankClusters(
  user: UserProfile,
  pool: Cluster[],
  topK = 3,
): ClusterMatch[] {
  const scored = pool.map((cluster) => {
    const bio = bioSimilarity(user, cluster);
    const sport = sportSimilarity(user, cluster);
    const medalBonus = medalDensityBonus(cluster) * 0.04;
    const cohortBonus = cohortSizeBonus(cluster) * 0.03;
    const similarity = clamp01(
      bio.bioScore * 0.58 + sport.sportScore * 0.35 + medalBonus + cohortBonus,
    );
    const rationale = [...bio.reasons, ...sport.reasons].slice(0, 3);
    return { cluster, similarity, rationale };
  });

  scored.sort((a, b) => b.similarity - a.similarity);

  // Sport-diversity: take the highest-scoring cluster per sport. Two cohorts
  // from the same sport (e.g. Ice Hockey 1960s + Ice Hockey 1970s) feel
  // redundant in the UI even when the matcher legitimately scores them both
  // high. Prefer the best cluster per sport, then fill remaining slots with
  // any leftover high scorers.
  const bestPerSport = new Map<string, ClusterMatch>();
  for (const m of scored) {
    if (!bestPerSport.has(m.cluster.sport)) {
      bestPerSport.set(m.cluster.sport, m);
    }
  }
  const distinct = Array.from(bestPerSport.values()).sort(
    (a, b) => b.similarity - a.similarity,
  );

  // Era-diversity boost: surface a competitive alt-decade cluster of the top
  // sport, preferring the NEWEST era so 2020/2024 medal years actually appear
  // for the swim/track profiles that match modern athletes. Smaller modern
  // cohorts score slightly lower on size-bonus, so we widen the cutoff to 8%.
  if (distinct.length >= 2 && topK >= 3) {
    const topSport = distinct[0].cluster.sport;
    const topDecade = distinct[0].cluster.decade;
    const competitiveCutoff = distinct[1].similarity - 0.08;
    const altCandidates = scored.filter(
      (m) =>
        m.cluster.sport === topSport &&
        m.cluster.decade !== topDecade &&
        m.similarity >= competitiveCutoff,
    );
    // Prefer the most recent decade among competitive candidates.
    altCandidates.sort((a, b) => b.cluster.decade - a.cluster.decade);
    const altEra = altCandidates[0];
    if (altEra && !distinct.includes(altEra)) {
      distinct.splice(1, 0, altEra);
    }
  }

  return distinct.slice(0, topK);
}

export function strengthProfileFromUser(user: UserProfile) {
  const explosive = 1 - user.explosiveVsEndurance;
  const reaction = (user.reactionSpeed - 1) / 4;
  const activity = (user.activityLevel - 1) / 4;
  return {
    power: Math.round((explosive * 0.6 + activity * 0.4) * 100),
    endurance: Math.round((user.explosiveVsEndurance * 0.7 + activity * 0.3) * 100),
    speed: Math.round((explosive * 0.4 + reaction * 0.6) * 100),
    coordination: Math.round((reaction * 0.5 + activity * 0.5) * 100),
  };
}

// Helper: friendly cluster label like "Power Swimmers · 2010s · M"
export function clusterLabel(c: Cluster): string {
  const sport = profileForSport(c.sport);
  let descriptor = "";
  if (sport.power >= 0.8 && sport.endurance < 0.7) descriptor = "Power ";
  else if (sport.endurance >= 0.8) descriptor = "Endurance ";
  else if (sport.coordination >= 0.9) descriptor = "Precision ";
  else if (sport.reactionDemand >= 0.9) descriptor = "Reactive ";
  const sexTag = c.sex === "M" ? "Men" : "Women";
  return `${descriptor}${c.sport} · ${c.decade}s · ${sexTag}`;
}
