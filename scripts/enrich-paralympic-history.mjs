// Backfill Team USA Paralympic medalists from 1960s through 2000s — the
// existing dataset only covers 2008-2024, leaving the first 48 years of the
// Paralympic Movement unrepresented in our cluster pool. We use grounded
// Gemini search to enumerate notable medalists per decade and emit them in
// the same JSON shape as data/paralympic-enriched.json so they can merge in.
//
// One grounded call per decade. Reviewed manually before merging into the
// production pool.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { GoogleGenAI } from "@google/genai";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUTPUT_PATH = path.join(ROOT, "data", "paralympic-enriched-historical.json");

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

// 1960s-2000s — the gap left by our 2008+ enrichment.
const DECADES = [
  { decade: 1960, range: "1960-1969", games: "1960 Rome, 1964 Tokyo, 1968 Tel Aviv" },
  { decade: 1970, range: "1970-1979", games: "1972 Heidelberg, 1976 Toronto" },
  { decade: 1980, range: "1980-1989", games: "1980 Arnhem, 1984 Stoke Mandeville/New York, 1988 Seoul" },
  { decade: 1990, range: "1990-1999", games: "1992 Barcelona, 1996 Atlanta" },
  { decade: 2000, range: "2000-2007", games: "2000 Sydney, 2004 Athens" },
];

function slugify(name) {
  return (
    "para-historical-" +
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
  );
}

function extractJson(text) {
  const cleaned = text.replace(/```json\s*|```/g, "").trim();
  // try direct parse
  try { return JSON.parse(cleaned); } catch {}
  // try array match
  const arrMatch = cleaned.match(/\[[\s\S]*\]/);
  if (arrMatch) {
    try { return JSON.parse(arrMatch[0]); } catch {}
  }
  throw new Error("No JSON array found in response");
}

async function enrichDecade({ decade, range, games }) {
  const prompt = `You are an expert on Team USA Paralympic history. Use Google Search to consult IPC paralympic.org, USOPC, Wikipedia, Team USA, and reputable archives.

List the 8-12 most notable Team USA Paralympic medalists who competed PRIMARILY between ${range}. Include athletes from Summer AND Winter Paralympics. Prefer multi-medalists and pioneers (first US medal in their event, etc.). It is fine if these athletes are now retired.

For each, return ALL of the following. If a stat is unknown, return null and note it briefly. NEVER invent values.

Return ONLY a JSON array (no prose, no markdown), each element matching this exact shape:

{
  "name": "<full name>",
  "sex": "M" or "F",
  "primarySport": "<e.g. 'Para Athletics', 'Para Swimming', 'Wheelchair Basketball', 'Para Alpine Skiing', 'Goalball', 'Wheelchair Rugby', 'Para Cycling', 'Para Equestrian'>",
  "height_cm": <integer cm, or null>,
  "weight_kg": <integer kg, or null>,
  "age_at_peak_games": <integer, age at their most-decorated Paralympics, or null>,
  "events": [
    {
      "year": <integer Paralympic year, must be in ${range}>,
      "sport": "<sport name>",
      "event": "<event description, e.g. 'Freestyle S7', '100m T44', 'Gold-medal squad'>",
      "medal": "Gold" | "Silver" | "Bronze"
    }
    // 1-3 most notable medal events
  ],
  "medals": { "gold": <int>, "silver": <int>, "bronze": <int> },
  "_enrichmentNotes": "<one short sentence about source agreement / nulls>"
}

Decade context: ${games}.
Be conservative on unknowns — null is much better than invented numbers.`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
      temperature: 0.2,
      thinkingConfig: { thinkingBudget: 0 },
      maxOutputTokens: 6144,
    },
  });

  const text = response.text;
  if (!text) throw new Error(`Empty response for decade ${decade}`);
  const parsed = extractJson(text);
  if (!Array.isArray(parsed)) throw new Error(`Decade ${decade}: response wasn't a JSON array`);
  return parsed;
}

function normalize(raw, decade) {
  // Defensive: coerce, validate, drop bad records.
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
  if (events.length === 0) return null; // no medal events = drop

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
    age: typeof raw.age_at_peak_games === "number" ? Math.round(raw.age_at_peak_games) : null,
    games: "paralympic",
    primarySport,
    events,
    medals: { gold: goldCount, silver: silverCount, bronze: bronzeCount },
    _enrichmentNotes: typeof raw._enrichmentNotes === "string" ? raw._enrichmentNotes : `Backfilled from ${decade}s grounded search`,
  };
}

async function main() {
  const all = [];
  const seenIds = new Set();
  for (const d of DECADES) {
    console.log(`\n=== Decade ${d.decade}s (${d.range}) ===`);
    let entries = [];
    try {
      entries = await enrichDecade(d);
    } catch (e) {
      console.error(`  FAILED for ${d.decade}s: ${e?.message || e}`);
      continue;
    }
    let added = 0;
    for (const raw of entries) {
      const a = normalize(raw, d.decade);
      if (!a) {
        console.log(`  - skip invalid record:`, raw?.name || "<no name>");
        continue;
      }
      if (seenIds.has(a.id)) {
        console.log(`  - skip duplicate:`, a.name);
        continue;
      }
      seenIds.add(a.id);
      all.push(a);
      added++;
      const ev = a.events[0];
      console.log(`  + ${a.name} (${a.sex}) ${a.primarySport} ${ev.year} ${ev.medal}`);
    }
    console.log(`  -> +${added} kept (${entries.length - added} dropped)`);
    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(all, null, 2));
    // brief pause between decade calls
    await new Promise((r) => setTimeout(r, 1500));
  }
  console.log(`\nWrote ${OUTPUT_PATH} (${all.length} athletes total)`);
}

main().catch((e) => {
  console.error("Fatal:", e);
  process.exit(1);
});
