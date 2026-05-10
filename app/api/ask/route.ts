import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import type { ArchetypeResult, UserProfile } from "@/lib/types";
import { clusterDisplaySport } from "@/lib/sport-discipline";

export const runtime = "nodejs";
export const maxDuration = 60;

const MODEL = "gemini-2.5-flash";

const SYSTEM_INSTRUCTION = `You are the conversational follow-up agent for "Team USA DNA". The user has just received their archetype analysis and is now asking follow-up questions.

You have access to:
- Their TOP 3 Olympic and Paralympic cohorts (the displayed matches)
- An EXTENDED list of cohorts ranked 4-10 in each pool ("ALTERNATE COHORTS") — use these when asked hypotheticals to surface SPECIFIC alternative matches by name and stats

CORE RULES — same as the original analysis, non-negotiable:

1. NIL (Name, Image, Likeness): NEVER name an individual athlete. No first names, no last names. Reference cohorts ("the cluster of 1990s women's swimmers"), sports, eras, statistical patterns only.

2. CONDITIONAL LANGUAGE: Always "could suggest", "may align", "historically associated with", "tends to". Never "you will be" or "you are destined to". No predictions of athletic outcomes.

3. GROUNDED + PROACTIVE: Stay within the data provided. When asked hypotheticals like "what if I were 10 cm taller / 5 years older / a different climate", actively REFERENCE specific cohorts from BOTH the top-3 list AND the alternate-cohorts list, by sport + decade + sex, with their exact stats. Don't speak in generalities — name two or three specific cohorts that would shift in or out, and quote their averages.

4. NO BIASED RECOMMENDATIONS: The user may have listed favorite sports — those are personal taste only. Do NOT use them to influence what sports you say would suit them. The matcher's outputs come from biometrics + sport profile alone.

5. ENGAGE, DON'T HEDGE: 3-5 sentences. Answer the question concretely with named cohorts and numbers. Avoid filler like "this might also influence..." Be confident in conditional language.

6. PERSONALIZE: If the user provided a first name, you may address them by name once or twice naturally. Don't overuse it.

7. PARITY: Treat Paralympic cohorts with equal seriousness when relevant. Don't deflect Paralympic questions with "less data" — engage with them fully.`;

function formatClusterLine(m: { cluster: ArchetypeResult["olympicMatches"][number]["cluster"]; similarity: number }): string {
  const sport = clusterDisplaySport(m.cluster.sport, m.cluster.representativeEvents);
  const bio = [
    m.cluster.avgHeightCm ? `${m.cluster.avgHeightCm}cm` : null,
    m.cluster.avgWeightKg ? `${m.cluster.avgWeightKg}kg` : null,
    m.cluster.avgAge ? `peak age ${m.cluster.avgAge}` : null,
  ]
    .filter(Boolean)
    .join(", ") || "limited bio data";
  const goldYears = m.cluster.medalYears.gold.join(", ") || "—";
  return `  - ${sport} · ${m.cluster.decade}s · ${m.cluster.sex === "M" ? "Men" : "Women"} · ${m.cluster.count} athletes · avg ${bio} · gold years: ${goldYears} · match ${Math.round(m.similarity * 100)}%`;
}

function buildContextBlock(result: ArchetypeResult, profile: UserProfile): string {
  const olympicLines = result.olympicMatches.map(formatClusterLine).join("\n");
  const paralympicLines = result.paralympicMatches.map(formatClusterLine).join("\n");
  const olympicAlt = (result.olympicAlternates ?? []).map(formatClusterLine).join("\n");
  const paralympicAlt = (result.paralympicAlternates ?? []).map(formatClusterLine).join("\n");

  return `USER PROFILE
Name: ${profile.firstName ?? "(not provided)"}
Sex: ${profile.sex === "M" ? "Male" : "Female"} · ${profile.heightCm}cm · ${profile.weightKg}kg · age ${profile.age}
Activity: ${profile.activityLevel}/5 · explosive→endurance: ${profile.explosiveVsEndurance.toFixed(2)} · solo→team: ${profile.soloVsTeam.toFixed(2)} · reaction tier: ${profile.reactionSpeed}/5
Hometown: ${profile.hometown} · preferred climate: ${profile.climate ?? "any"}
Favorite sports (PERSONAL TASTE — do NOT use as a matching signal): ${(profile.favoriteSports ?? []).join(", ") || "(none)"}

ARCHETYPE
"${result.archetypeName}"
${result.summary}

STRENGTH PROFILE (0-100)
power: ${result.strengthProfile.power} · speed: ${result.strengthProfile.speed} · endurance: ${result.strengthProfile.endurance} · coordination: ${result.strengthProfile.coordination}

OLYMPIC COHORT MATCHES (top 3 — these are displayed to the user)
${olympicLines}
NARRATIVE: ${result.olympicNarrative}

ALTERNATE OLYMPIC COHORTS (ranked 4-${3 + (result.olympicAlternates?.length ?? 0)} — use these to recommend alternates when answering hypotheticals)
${olympicAlt || "  (none)"}

PARALYMPIC COHORT MATCHES (top 3 — these are displayed to the user)
${paralympicLines}
NARRATIVE: ${result.paralympicNarrative}

ALTERNATE PARALYMPIC COHORTS (ranked 4-${3 + (result.paralympicAlternates?.length ?? 0)})
${paralympicAlt || "  (none)"}

HOMETOWN INSIGHT: ${result.hometownInsight}

SPORT RECOMMENDATIONS:
${result.sportRecommendations.map((s) => `  - ${s.sport}: ${s.reason}`).join("\n")}`;
}

type Turn = { role: "user" | "model"; text: string };

function validate(body: unknown): {
  question: string;
  result: ArchetypeResult;
  profile: UserProfile;
  history: Turn[];
} | null {
  if (!body || typeof body !== "object") return null;
  const b = body as Record<string, unknown>;
  if (typeof b.question !== "string" || b.question.trim().length === 0 || b.question.length > 600) return null;
  if (!b.result || typeof b.result !== "object") return null;
  if (!b.profile || typeof b.profile !== "object") return null;
  const history = Array.isArray(b.history) ? (b.history as Turn[]) : [];
  return {
    question: b.question.trim(),
    result: b.result as ArchetypeResult,
    profile: b.profile as UserProfile,
    history,
  };
}

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const v = validate(json);
    if (!v) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY is not set");
    const ai = new GoogleGenAI({ apiKey });

    const contextBlock = buildContextBlock(v.result, v.profile);

    // Build conversation: prefix the first user turn with context, then alternate
    // user/model turns from history, ending with the new question.
    type Content = { role: "user" | "model"; parts: { text: string }[] };
    const contents: Content[] = [];

    if (v.history.length === 0) {
      contents.push({
        role: "user",
        parts: [{ text: `${contextBlock}\n\n---\n\nUSER QUESTION: ${v.question}` }],
      });
    } else {
      // First user turn carries the context.
      contents.push({
        role: "user",
        parts: [{ text: `${contextBlock}\n\n---\n\nUSER QUESTION: ${v.history[0].text}` }],
      });
      for (let i = 1; i < v.history.length; i++) {
        contents.push({
          role: v.history[i].role === "user" ? "user" : "model",
          parts: [{ text: v.history[i].text }],
        });
      }
      contents.push({ role: "user", parts: [{ text: v.question }] });
    }

    const response = await ai.models.generateContent({
      model: MODEL,
      contents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.85,
        maxOutputTokens: 800,
        thinkingConfig: { thinkingBudget: 0 },
      },
    });

    const answer = response.text?.trim();
    if (!answer) {
      return NextResponse.json({ error: "Empty response" }, { status: 502 });
    }

    return NextResponse.json({ answer });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "unknown";
    console.error("[/api/ask]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
