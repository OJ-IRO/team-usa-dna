import { NextResponse } from "next/server";
import { olympicClusters, paralympicClusters } from "@/lib/data";
import { bestPerDecade, rankClusters, strengthProfileFromUser } from "@/lib/matching";
import { generateArchetype } from "@/lib/gemini";
import { fallbackNarrative } from "@/lib/fallback";
import type { ArchetypeResult, UserProfile } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

function validate(body: unknown): UserProfile | null {
  if (!body || typeof body !== "object") return null;
  const b = body as Record<string, unknown>;
  if (b.sex !== "M" && b.sex !== "F") return null;
  if (typeof b.heightCm !== "number" || b.heightCm < 100 || b.heightCm > 260) return null;
  if (typeof b.weightKg !== "number" || b.weightKg < 30 || b.weightKg > 250) return null;
  if (typeof b.age !== "number" || b.age < 10 || b.age > 100) return null;
  if (typeof b.activityLevel !== "number" || b.activityLevel < 1 || b.activityLevel > 5) return null;
  if (typeof b.explosiveVsEndurance !== "number" || b.explosiveVsEndurance < 0 || b.explosiveVsEndurance > 1) return null;
  if (typeof b.reactionSpeed !== "number" || b.reactionSpeed < 1 || b.reactionSpeed > 5) return null;
  if (typeof b.soloVsTeam !== "number" || b.soloVsTeam < 0 || b.soloVsTeam > 1) return null;
  if (typeof b.hometown !== "string" || b.hometown.length < 1) return null;
  if (b.photoDataUrl !== undefined && typeof b.photoDataUrl !== "string") return null;
  if (b.firstName !== undefined && typeof b.firstName !== "string") return null;
  if (b.climate !== undefined && typeof b.climate !== "string") return null;
  if (b.favoriteSports !== undefined && !Array.isArray(b.favoriteSports)) return null;
  return b as unknown as UserProfile;
}

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const profile = validate(json);
    if (!profile) {
      return NextResponse.json({ error: "Invalid profile data" }, { status: 400 });
    }

    // Display top 3 in the UI; the agent route also receives the full top-10
    // through the result so it can recommend specific alternate cohorts when
    // asked hypothetical questions ("what if I were taller?").
    const olympicAll = rankClusters(profile, olympicClusters, 10);
    const paralympicAll = rankClusters(profile, paralympicClusters, 10);
    const olympicMatches = olympicAll.slice(0, 3);
    const paralympicMatches = paralympicAll.slice(0, 3);
    const strengthProfile = strengthProfileFromUser(profile);

    let narrative;
    let usedFallback = false;
    try {
      narrative = await generateArchetype(profile, olympicMatches, paralympicMatches);
    } catch (geminiErr) {
      console.warn(
        "[/api/analyze] Gemini unavailable, falling back to algorithmic narrative:",
        geminiErr instanceof Error ? geminiErr.message : geminiErr,
      );
      narrative = fallbackNarrative(profile, olympicMatches, paralympicMatches);
      usedFallback = true;
    }

    const baseDisclaimer =
      "These insights describe historical patterns at the cohort level; outputs never identify individual athletes per hackathon NIL policy. They are not predictions of athletic outcomes.";
    const disclaimer = usedFallback
      ? `${baseDisclaimer} Gemini's narrative model was unavailable for this request; the archetype above was composed by the matching algorithm alone.`
      : baseDisclaimer;

    const result: ArchetypeResult = {
      archetypeName: narrative.archetypeName,
      summary: narrative.summary,
      strengthProfile,
      olympicMatches,
      paralympicMatches,
      olympicAlternates: olympicAll.slice(3),
      paralympicAlternates: paralympicAll.slice(3),
      olympicByDecade: bestPerDecade(profile, olympicClusters),
      paralympicByDecade: bestPerDecade(profile, paralympicClusters),
      olympicNarrative: narrative.olympicNarrative,
      paralympicNarrative: narrative.paralympicNarrative,
      sportRecommendations: narrative.sportRecommendations,
      hometownInsight: narrative.hometownInsight,
      visionInsight: narrative.visionInsight,
      disclaimer,
    };

    return NextResponse.json(result);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    console.error("[/api/analyze]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
