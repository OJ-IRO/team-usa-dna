import { GoogleGenAI, Type } from "@google/genai";
import type { ClusterMatch, UserProfile } from "./types";
import { clusterLabel } from "./matching";

const MODEL = "gemini-2.5-flash";

function getClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set");
  }
  return new GoogleGenAI({ apiKey });
}

const archetypeSchema = {
  type: Type.OBJECT,
  properties: {
    archetypeName: {
      type: Type.STRING,
      description:
        "A vivid 2-4 word athlete archetype label, evocative and specific (e.g. 'Coastal Power Surfer', 'High-Altitude Endurance Engine'). MUST describe a TYPE, never a specific person.",
    },
    summary: {
      type: Type.STRING,
      description:
        "2-3 sentence summary describing this archetype's strengths, written in second person to the user. MUST use conditional language ('could suit', 'historically associated with') — never guarantee outcomes. NEVER name a specific athlete.",
    },
    sportRecommendations: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          sport: { type: Type.STRING },
          reason: {
            type: Type.STRING,
            description: "1 sentence explaining why this sport fits, in conditional language. NEVER name an individual athlete.",
          },
        },
        required: ["sport", "reason"],
      },
      minItems: 3,
      maxItems: 3,
    },
    olympicCohortRationale: {
      type: Type.STRING,
      description:
        "2 sentences explaining what the user shares with the matched OLYMPIC COHORTS (groups of athletes by sport/era), described as types — e.g. 'sprint-lane swimmers from the 2010s'. NEVER name a specific athlete. Reference the cohort's collective biometrics, era, sport demands, and medal density.",
    },
    paralympicCohortRationale: {
      type: Type.STRING,
      description:
        "2 sentences explaining what the user shares with the matched PARALYMPIC COHORTS (groups of athletes by sport/era). MUST receive equal narrative weight to the Olympic rationale. NEVER name a specific athlete. Reference the cohort's collective profile.",
    },
    hometownInsight: {
      type: Type.STRING,
      description:
        "2 sentences on how the user's hometown's regional sports culture or environment could shape an athlete with this archetype. Conditional language only. NEVER name a specific athlete.",
    },
    visionInsight: {
      type: Type.STRING,
      description:
        "If a photo was provided: 1-2 sentences observing apparent build/posture cues that align with the archetype, in conditional language. NEVER name a specific athlete. If no photo, return empty string.",
    },
  },
  required: [
    "archetypeName",
    "summary",
    "sportRecommendations",
    "olympicCohortRationale",
    "paralympicCohortRationale",
    "hometownInsight",
    "visionInsight",
  ],
} as const;

const SYSTEM_INSTRUCTION = `You are the narrative engine for "Team USA DNA", a fan-facing analytics tool that clusters 120+ years of Team USA Olympic and Paralympic data into ATHLETE ARCHETYPES.

NIL (Name, Image, Likeness) PROTECTION — non-negotiable, enforced by the hackathon rules:
- NEVER name a specific individual athlete in any output field. No first names, no last names, no nicknames, no quoted attributions.
- Refer to GROUPS only: "this cohort of 2010s women's sprinters", "the cluster of mid-century power-event men", "Team USA throwers from the 1990s".
- It is fine — encouraged — to reference sports, events, eras, decades, statistical patterns, and Team USA broadly.

PERSONALIZATION — name + climate are FLAVOR; favorite sports are FORBIDDEN as a matching signal:
- If the user provided a first name, you may greet them or use it once in the summary. Don't use a name we don't have.
- If the user provided a preferred climate, you may reference it briefly when discussing what kind of training environment could suit their archetype. Conditional language only.
- The user may have listed favorite sports. Treat these as personal taste — fine to mention casually as a contrast or aside ("you're a basketball fan, but the matcher landed on..."). DO NOT let favorite sports influence sportRecommendations or any cohort match rationale. The matcher's outputs come from biometrics + cohort profile only; you're describing them honestly.

OTHER CORE RULES — non-negotiable:
1. NEVER guarantee athletic outcomes. Use conditional language exclusively: "could suggest", "historically associated with", "may align with", "tends to", "shares characteristics with". Never "you will be" or "you are destined to".
2. Olympic and Paralympic cohorts receive equal narrative weight, prominence, and depth. The Paralympic rationale must be equally specific and substantive — not a footnote.
3. Be vivid and concrete. Tie observations to specific physical traits, sport demands, era patterns, or geographic context — but never to specific people.
4. The archetype name should feel like a character class (a TYPE), not a personality test result. Specific over poetic.`;

function describeClusters(label: string, matches: ClusterMatch[]) {
  if (matches.length === 0) return `${label}: (none)`;
  const lines = matches.map((m, i) => {
    const c = m.cluster;
    const bio = [
      c.avgHeightCm ? `avg ${c.avgHeightCm} cm` : null,
      c.avgWeightKg ? `avg ${c.avgWeightKg} kg` : null,
      c.avgAge ? `avg age ${c.avgAge}` : null,
    ]
      .filter(Boolean)
      .join(", ");
    const totalMedals = c.medals.gold + c.medals.silver + c.medals.bronze;
    const medalNote = totalMedals > 0
      ? `${c.medals.gold}G/${c.medals.silver}S/${c.medals.bronze}B across the cohort`
      : "no medals on record";
    const events = c.representativeEvents.length > 0
      ? c.representativeEvents.slice(0, 3).join("; ")
      : "various events";
    return `  ${i + 1}. ${clusterLabel(c)} — ${c.count} athletes, ${bio}. Events: ${events}. Medals: ${medalNote}. Match: ${(m.similarity * 100).toFixed(0)}%. Why: ${m.rationale.join("; ")}`;
  });
  return `${label}:\n${lines.join("\n")}`;
}

function buildPrompt(
  user: UserProfile,
  olympicMatches: ClusterMatch[],
  paralympicMatches: ClusterMatch[],
  hasPhoto: boolean,
) {
  const climateLabel = (user.climate ?? "any") === "any" ? "no preference" : (user.climate ?? "").replace(/_/g, " ");
  const userBlock = `USER PROFILE:
${user.firstName ? `- First name: ${user.firstName}` : "- First name: (not provided)"}
- Sex: ${user.sex === "M" ? "Male" : "Female"}
- Height: ${user.heightCm} cm, Weight: ${user.weightKg} kg, Age: ${user.age}
- Activity level: ${user.activityLevel}/5
- Explosive vs Endurance preference: ${user.explosiveVsEndurance.toFixed(2)} (0 = pure explosive, 1 = pure endurance)
- Reaction speed (measured if available): ${user.reactionSpeed}/5${user.reactionTimeMs != null ? ` (avg ${user.reactionTimeMs} ms in mini-game)` : ""}${user.tapsPerSecond != null ? ` · ${user.tapsPerSecond.toFixed(1)} taps/sec twitch` : ""}
- Solo vs Team preference: ${user.soloVsTeam.toFixed(2)} (0 = solo, 1 = team)
- Hometown: ${user.hometown}
- Preferred climate: ${climateLabel}
- Favorite sports (PERSONALIZATION ONLY — must not influence sportRecommendations or matching): ${(user.favoriteSports ?? []).length > 0 ? (user.favoriteSports ?? []).join(", ") : "(none listed)"}`;

  const olympicBlock = describeClusters("OLYMPIC COHORT MATCHES (clusters of Team USA athletes by sport / decade / sex)", olympicMatches);
  const paralympicBlock = describeClusters("PARALYMPIC COHORT MATCHES (clusters of Team USA Paralympians by sport / decade / sex)", paralympicMatches);

  const photoNote = hasPhoto
    ? "\nA photo of the user is attached. Observe apparent build cues and reflect them concisely in the visionInsight field. Do not name any athletes in the observation."
    : "\nNo photo provided — visionInsight should be an empty string.";

  return `${userBlock}

${olympicBlock}

${paralympicBlock}
${photoNote}

Generate the archetype JSON. Sport recommendations should draw from the sports represented in the matched cohorts. REMEMBER: never name an individual athlete in any output.`;
}

export async function generateArchetype(
  user: UserProfile,
  olympicMatches: ClusterMatch[],
  paralympicMatches: ClusterMatch[],
): Promise<{
  archetypeName: string;
  summary: string;
  sportRecommendations: { sport: string; reason: string }[];
  olympicNarrative: string;
  paralympicNarrative: string;
  hometownInsight: string;
  visionInsight?: string;
}> {
  const ai = getClient();
  const hasPhoto = !!user.photoDataUrl;
  const prompt = buildPrompt(user, olympicMatches, paralympicMatches, hasPhoto);

  const parts: { text?: string; inlineData?: { mimeType: string; data: string } }[] = [
    { text: prompt },
  ];

  if (hasPhoto && user.photoDataUrl) {
    const match = user.photoDataUrl.match(/^data:(image\/[^;]+);base64,(.+)$/);
    if (match) {
      parts.push({ inlineData: { mimeType: match[1], data: match[2] } });
    }
  }

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: [{ role: "user", parts }],
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: archetypeSchema,
      temperature: 0.85,
      maxOutputTokens: 4096,
      thinkingConfig: { thinkingBudget: 0 },
    },
  });

  const text = response.text;
  if (!text) {
    throw new Error("Empty response from Gemini");
  }

  const parsed = JSON.parse(text);

  return {
    archetypeName: parsed.archetypeName,
    summary: parsed.summary,
    sportRecommendations: parsed.sportRecommendations,
    olympicNarrative: parsed.olympicCohortRationale,
    paralympicNarrative: parsed.paralympicCohortRationale,
    hometownInsight: parsed.hometownInsight,
    visionInsight: parsed.visionInsight || undefined,
  };
}
