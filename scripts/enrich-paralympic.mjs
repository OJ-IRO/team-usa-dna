// Build-time enrichment for Team USA Paralympians.
// Mirrors enrich-modern-athletes.mjs but writes to data/paralympic-enriched.json
// and tags every athlete with games: "paralympic".

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { GoogleGenAI } from "@google/genai";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SEED_PATH = path.join(__dirname, "paralympic-seed.json");
const OUTPUT_PATH = path.join(ROOT, "data", "paralympic-enriched.json");
const FORCE = process.argv.includes("--force");

const MIN_INTERVAL_MS = 1500;
const MAX_RETRIES = 2;

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

function slugify(name) {
  return (
    "para-enriched-" +
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
  );
}

function existingById() {
  if (!fs.existsSync(OUTPUT_PATH)) return new Map();
  try {
    let raw = fs.readFileSync(OUTPUT_PATH, "utf8");
    if (raw.charCodeAt(0) === 0xfeff) raw = raw.slice(1);
    const data = JSON.parse(raw);
    return new Map(data.map((a) => [a.id, a]));
  } catch (e) {
    console.warn("existingById parse failed —", e?.message ?? e);
    return new Map();
  }
}

function extractJson(text) {
  const cleaned = text.replace(/```json\s*|```/g, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch {}
  const m = cleaned.match(/\{[\s\S]*\}/);
  if (m) return JSON.parse(m[0]);
  throw new Error("No JSON object found in response");
}

async function enrichOne(seed) {
  const prompt = `Find the **publicly listed height (cm) and weight (kg)** of this Team USA Paralympian:

Name: ${seed.name}
Sport: ${seed.primarySport}
Event(s): ${seed.representativeEvent}
Paralympic year: ${seed.representativeYear}

Use Google Search to consult multiple authoritative sources (Paralympic.org / IPC profile, USOPC profile, Wikipedia, Team USA, NBC). Convert imperial to metric where needed (1 in = 2.54 cm, 1 lb = 0.4536 kg).

Then determine their age at the ${seed.representativeYear} Paralympic Games (year of competition − birth year).

Return ONLY a JSON object — no prose, no markdown — matching this exact shape:

{
  "height_cm": <integer cm, or null if sources disagree by >3cm or no data>,
  "weight_kg": <integer kg, or null if sources disagree by >3kg or no data>,
  "age_at_year": <integer age in ${seed.representativeYear}, or null if birth year unknown>,
  "notes": "<one short sentence on which sources agreed or why null>"
}

Be conservative: if uncertain by more than 3 units, return null for that field.`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
      temperature: 0.1,
    },
  });

  const text = response.text;
  if (!text) throw new Error("Empty response");
  const parsed = extractJson(text);
  return {
    height_cm: typeof parsed.height_cm === "number" ? Math.round(parsed.height_cm) : null,
    weight_kg: typeof parsed.weight_kg === "number" ? Math.round(parsed.weight_kg) : null,
    age_at_year: typeof parsed.age_at_year === "number" ? Math.round(parsed.age_at_year) : null,
    notes: typeof parsed.notes === "string" ? parsed.notes : "",
  };
}

async function main() {
  const seed = JSON.parse(fs.readFileSync(SEED_PATH, "utf8"));
  const existing = FORCE ? new Map() : existingById();

  console.log(`Paralympic seed: ${seed.length} athletes; cached: ${existing.size}; force=${FORCE}`);

  const results = [];
  let lastReqAt = 0;

  for (let i = 0; i < seed.length; i++) {
    const s = seed[i];
    const id = slugify(s.name);

    if (existing.has(id)) {
      results.push(existing.get(id));
      console.log(`[${i + 1}/${seed.length}] ${s.name} — cached, skipping`);
      continue;
    }

    const since = Date.now() - lastReqAt;
    if (since < MIN_INTERVAL_MS) {
      await new Promise((r) => setTimeout(r, MIN_INTERVAL_MS - since));
    }

    let enriched = null;
    let lastErr = null;
    for (let attempt = 0; attempt <= MAX_RETRIES && !enriched; attempt++) {
      try {
        lastReqAt = Date.now();
        enriched = await enrichOne(s);
      } catch (e) {
        lastErr = e;
        const msg = e instanceof Error ? e.message : String(e);
        console.warn(`[${i + 1}/${seed.length}] ${s.name} attempt ${attempt + 1} failed: ${msg}`);
        if (attempt < MAX_RETRIES) {
          await new Promise((r) => setTimeout(r, 5000 * (attempt + 1)));
        }
      }
    }

    if (!enriched) {
      console.error(`[${i + 1}/${seed.length}] ${s.name} — giving up: ${lastErr?.message}`);
      enriched = { height_cm: null, weight_kg: null, age_at_year: null, notes: "enrichment failed" };
    }

    const athlete = {
      id,
      name: s.name,
      sex: s.sex,
      height_cm: enriched.height_cm,
      weight_kg: enriched.weight_kg,
      age: enriched.age_at_year,
      games: "paralympic",
      primarySport: s.primarySport,
      events: [
        {
          year: s.representativeYear,
          sport: s.primarySport,
          event: s.representativeEvent,
          medal:
            s.medals.gold > 0 ? "Gold" :
            s.medals.silver > 0 ? "Silver" :
            s.medals.bronze > 0 ? "Bronze" : null,
        },
      ],
      medals: s.medals,
      _enrichmentNotes: enriched.notes,
    };

    results.push(athlete);
    console.log(
      `[${i + 1}/${seed.length}] ${s.name} — h=${enriched.height_cm ?? "—"} w=${enriched.weight_kg ?? "—"} age=${enriched.age_at_year ?? "—"}`,
    );
    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(results, null, 2));
  }

  console.log(`\nWrote ${OUTPUT_PATH} (${results.length} athletes)`);
}

main().catch((e) => {
  console.error("Fatal:", e);
  process.exit(1);
});
