// Extended enrichment for Team USA Olympic medalists at Tokyo 2020 + Paris
// 2024 — the Kaggle dataset stops at Rio 2016 and our hand-curated modern set
// has ~50 athletes. This script enumerates Team USA medalists by (sport, year)
// using Gemini grounded search, with strict accuracy guardrails: multi-source
// corroboration required, null returned for uncertain stats, NEVER invented.
//
// Output: data/modern-usa-extended.json (separate from modern-usa.json so it
// can be inspected before merging into the pool via lib/data.ts).

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { GoogleGenAI } from "@google/genai";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUTPUT_PATH = path.join(ROOT, "data", "modern-usa-extended.json");
const MODERN_PATH = path.join(ROOT, "data", "modern-usa.json");
const HISTORICAL_PATH = path.join(ROOT, "data", "olympic-usa.json");

function loadEnvLocal() {
  const envPath = path.join(ROOT, ".env.local");
  if (!fs.existsSync(envPath)) return;
  const text = fs.readFileSync(envPath, "utf8");
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, "");
  }
}
loadEnvLocal();

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("GEMINI_API_KEY is not set");
  process.exit(1);
}
const ai = new GoogleGenAI({ apiKey });

// Per-(year, sport) batches — fine enough to fit in maxOutputTokens, broad
// enough to be efficient. Sports active at each Games.
const GAMES = [
  {
    year: 2020,
    label: "Tokyo 2020 (held 2021)",
    sports: [
      "Athletics", "Swimming", "Diving", "Water Polo", "Rowing", "Sailing",
      "Canoeing", "Surfing", "Skateboarding", "Sport Climbing",
      "Basketball", "Volleyball", "Beach Volleyball", "Tennis", "Badminton",
      "Table Tennis", "Handball", "Football", "Hockey", "Rugby Sevens",
      "Baseball", "Softball", "Boxing", "Wrestling", "Judo", "Taekwondo",
      "Karate", "Fencing", "Weightlifting", "Artistic Gymnastics",
      "Rhythmic Gymnastics", "Trampoline", "Artistic Swimming",
      "Equestrianism", "Modern Pentathlon", "Triathlon", "Cycling",
      "Archery", "Shooting", "Golf",
    ],
  },
  {
    year: 2024,
    label: "Paris 2024",
    sports: [
      "Athletics", "Swimming", "Diving", "Water Polo", "Rowing", "Sailing",
      "Canoeing", "Surfing", "Skateboarding", "Sport Climbing", "Breaking",
      "Basketball", "Volleyball", "Beach Volleyball", "Tennis", "Badminton",
      "Table Tennis", "Handball", "Football", "Hockey", "Rugby Sevens",
      "Boxing", "Wrestling", "Judo", "Taekwondo", "Fencing", "Weightlifting",
      "Artistic Gymnastics", "Rhythmic Gymnastics", "Trampoline",
      "Artistic Swimming", "Equestrianism", "Modern Pentathlon", "Triathlon",
      "Cycling", "Archery", "Shooting", "Golf",
    ],
  },
];

const MIN_INTERVAL_MS = 1500;

function slugify(name) {
  return "modern-ext-" + name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function readJsonSafe(p) {
  if (!fs.existsSync(p)) return [];
  let raw = fs.readFileSync(p, "utf8");
  if (raw.charCodeAt(0) === 0xfeff) raw = raw.slice(1);
  try { return JSON.parse(raw); } catch { return []; }
}

function extractJson(text) {
  const cleaned = text.replace(/```json\s*|```/g, "").trim();
  try { return JSON.parse(cleaned); } catch {}
  const m = cleaned.match(/\[[\s\S]*\]/);
  if (m) return JSON.parse(m[0]);
  throw new Error("No JSON array found in response");
}

async function enumerateMedalists(year, label, sport) {
  const prompt = `You are an expert sports historian with access to Google Search. Find Team USA athletes who won an Olympic medal in ${sport} at ${label}.

REQUIREMENTS:
- Use Google Search to corroborate every entry against multiple authoritative sources (USOPC, Wikipedia, Team USA, NBC Olympics, OlymPedia, Sports Reference). If sources disagree by more than 3 cm on height or 3 kg on weight, return null for that field. NEVER fabricate.
- Include ALL Team USA medalists in this (sport, year) — gold, silver, bronze. Include team-event members (e.g. basketball squad members get individual records).
- Convert all heights to integer cm and weights to integer kg.
- Age = competition year (${year}) minus birth year.

Return ONLY a JSON array — no prose, no markdown — each element matching:

{
  "name": "<full name>",
  "sex": "M" or "F",
  "primarySport": "${sport}",
  "height_cm": <integer cm, or null if sources disagree or no data>,
  "weight_kg": <integer kg, or null if sources disagree or no data>,
  "age_at_year": <integer age at ${year}, or null if birth year unknown>,
  "events": [
    {
      "year": ${year},
      "sport": "${sport}",
      "event": "<event description, e.g. '100m Freestyle', 'Team gold-medal squad'>",
      "medal": "Gold" | "Silver" | "Bronze"
    }
  ],
  "medals": { "gold": <int>, "silver": <int>, "bronze": <int> },
  "_enrichmentNotes": "<one short sentence on source agreement / nulls>"
}

If no Team USA medalists in this sport at this Games, return [].`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
      temperature: 0.15,
      thinkingConfig: { thinkingBudget: 0 },
      maxOutputTokens: 8192,
    },
  });
  const text = response.text;
  if (!text) return [];
  const parsed = extractJson(text);
  if (!Array.isArray(parsed)) return [];
  return parsed;
}

function normalize(raw, year) {
  if (!raw || typeof raw !== "object") return null;
  if (typeof raw.name !== "string" || !raw.name.trim()) return null;
  const sex = raw.sex === "M" || raw.sex === "F" ? raw.sex : null;
  if (!sex) return null;
  const primarySport = typeof raw.primarySport === "string" && raw.primarySport.trim() ? raw.primarySport.trim() : null;
  if (!primarySport) return null;
  const events = Array.isArray(raw.events)
    ? raw.events
        .filter((e) => e && typeof e === "object" && typeof e.year === "number" && (e.medal === "Gold" || e.medal === "Silver" || e.medal === "Bronze"))
        .map((e) => ({
          year: Math.round(e.year),
          sport: typeof e.sport === "string" && e.sport.trim() ? e.sport.trim() : primarySport,
          event: typeof e.event === "string" ? e.event.trim() : "",
          medal: e.medal,
        }))
    : [];
  if (events.length === 0) return null;

  const medals = (raw.medals && typeof raw.medals === "object") ? raw.medals : {};
  const goldCount = typeof medals.gold === "number" ? Math.round(medals.gold) : events.filter((e) => e.medal === "Gold").length;
  const silverCount = typeof medals.silver === "number" ? Math.round(medals.silver) : events.filter((e) => e.medal === "Silver").length;
  const bronzeCount = typeof medals.bronze === "number" ? Math.round(medals.bronze) : events.filter((e) => e.medal === "Bronze").length;

  return {
    id: slugify(raw.name),
    name: raw.name.trim(),
    sex,
    height_cm: typeof raw.height_cm === "number" ? Math.round(raw.height_cm) : null,
    weight_kg: typeof raw.weight_kg === "number" ? Math.round(raw.weight_kg) : null,
    age: typeof raw.age_at_year === "number" ? Math.round(raw.age_at_year) : null,
    games: "olympic",
    primarySport,
    events,
    medals: { gold: goldCount, silver: silverCount, bronze: bronzeCount },
    _enrichmentNotes: typeof raw._enrichmentNotes === "string" ? raw._enrichmentNotes : `Extended modern Olympic enrichment for ${year}`,
  };
}

async function main() {
  // Build a name-Set from existing data so we skip duplicates.
  const existingModern = readJsonSafe(MODERN_PATH);
  const existingHistorical = readJsonSafe(HISTORICAL_PATH);
  const existingNames = new Set(
    [...existingModern, ...existingHistorical]
      .map((a) => (typeof a?.name === "string" ? a.name.toLowerCase().trim() : null))
      .filter(Boolean),
  );
  console.log(`Existing names in pool: ${existingNames.size}`);

  // Allow resume — read previous output if exists.
  const all = readJsonSafe(OUTPUT_PATH);
  const haveIds = new Set(all.map((a) => a.id));
  for (const a of all) {
    if (a?.name) existingNames.add(a.name.toLowerCase().trim());
  }
  console.log(`Resuming with ${all.length} already-enriched athletes`);

  let lastReqAt = 0;
  for (const games of GAMES) {
    for (const sport of games.sports) {
      console.log(`\n[${games.year} · ${sport}] enumerating...`);
      const since = Date.now() - lastReqAt;
      if (since < MIN_INTERVAL_MS) {
        await new Promise((r) => setTimeout(r, MIN_INTERVAL_MS - since));
      }
      lastReqAt = Date.now();
      let entries = [];
      try {
        entries = await enumerateMedalists(games.year, games.label, sport);
      } catch (e) {
        console.error(`  FAILED ${games.year} ${sport}: ${e?.message || e}`);
        continue;
      }
      let kept = 0, skipped = 0;
      for (const raw of entries) {
        const a = normalize(raw, games.year);
        if (!a) { skipped++; continue; }
        const nameLower = a.name.toLowerCase().trim();
        if (existingNames.has(nameLower)) {
          // Athlete already covered elsewhere — skip to avoid duplicate clusters.
          skipped++;
          continue;
        }
        if (haveIds.has(a.id)) { skipped++; continue; }
        existingNames.add(nameLower);
        haveIds.add(a.id);
        all.push(a);
        kept++;
      }
      console.log(`  -> kept ${kept}, skipped ${skipped} (${entries.length} from search)`);
      fs.writeFileSync(OUTPUT_PATH, JSON.stringify(all, null, 2));
    }
  }
  console.log(`\nWrote ${OUTPUT_PATH} (${all.length} new athletes total)`);
}

main().catch((e) => {
  console.error("Fatal:", e);
  process.exit(1);
});
