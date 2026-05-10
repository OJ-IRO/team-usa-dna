// Per-athlete focused deep-dive to fill missing height_cm / weight_kg / age
// across the entire Team USA Paralympic dataset (curated, modern, historical).
//
// The original enrichment scripts looked up each athlete in a single broad
// prompt; this one issues a focused multi-source prompt per athlete with
// targeted instructions ("read Wikipedia infobox, IPC profile, USOPC
// profile") and only updates fields that are still null. Existing values are
// never overwritten.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { GoogleGenAI } from "@google/genai";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const FILES = [
  path.join(ROOT, "data", "paralympic-usa.json"),
  path.join(ROOT, "data", "paralympic-enriched.json"),
  path.join(ROOT, "data", "paralympic-enriched-historical.json"),
];

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

function readJson(p) {
  let raw = fs.readFileSync(p, "utf8");
  if (raw.charCodeAt(0) === 0xfeff) raw = raw.slice(1);
  return JSON.parse(raw);
}

function extractJson(text) {
  const cleaned = text.replace(/```json\s*|```/g, "").trim();
  try { return JSON.parse(cleaned); } catch {}
  const m = cleaned.match(/\{[\s\S]*\}/);
  if (m) return JSON.parse(m[0]);
  throw new Error("No JSON object found in response");
}

function representativeYear(athlete) {
  if (!athlete.events || athlete.events.length === 0) return null;
  const golds = athlete.events.filter((e) => e.medal === "Gold");
  const pick = golds.length > 0 ? golds : athlete.events;
  return Math.min(...pick.map((e) => e.year));
}

async function deepEnrichOne(athlete) {
  const repYear = representativeYear(athlete);
  const events = athlete.events
    .slice(0, 4)
    .map((e) => `${e.year} ${e.event} (${e.medal})`)
    .join("; ");

  const prompt = `Find publicly listed physical stats for this Team USA Paralympian:

Name: ${athlete.name}
Sex: ${athlete.sex}
Sport: ${athlete.primarySport}
Notable events: ${events}
Reference year for age calc: ${repYear ?? "—"}

Search Wikipedia (infobox), Paralympic.org / IPC profile, USOPC profile, Team USA, NBC athlete pages, and reputable sports-reference databases. Convert imperial to metric (1 in = 2.54 cm, 1 lb = 0.4536 kg).

Return ONLY a JSON object — no prose, no markdown — with this exact shape:

{
  "height_cm": <integer cm, or null if no source has it>,
  "weight_kg": <integer kg, or null if no source has it>,
  "age_at_year": <integer age in ${repYear}, or null if birth year unknown>,
  "notes": "<one short sentence on which sources agreed or why null>"
}

Be conservative — return null for anything genuinely uncertain. NEVER invent a number to fill a field.`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
      temperature: 0.1,
      thinkingConfig: { thinkingBudget: 0 },
      maxOutputTokens: 1024,
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
  let totalScanned = 0;
  let totalNeeded = 0;
  let totalUpdated = 0;
  let totalFieldsFilled = 0;
  let lastReqAt = 0;

  for (const filePath of FILES) {
    if (!fs.existsSync(filePath)) {
      console.log(`SKIP ${path.basename(filePath)} (missing)`);
      continue;
    }
    const list = readJson(filePath);
    console.log(`\n=== ${path.basename(filePath)}: ${list.length} athletes ===`);

    for (let i = 0; i < list.length; i++) {
      const ath = list[i];
      totalScanned++;
      const missing = [];
      if (ath.height_cm == null) missing.push("h");
      if (ath.weight_kg == null) missing.push("w");
      if (ath.age == null) missing.push("a");
      if (missing.length === 0) continue;
      totalNeeded++;

      const since = Date.now() - lastReqAt;
      if (since < MIN_INTERVAL_MS) {
        await new Promise((r) => setTimeout(r, MIN_INTERVAL_MS - since));
      }

      let enriched = null;
      let lastErr = null;
      for (let attempt = 0; attempt <= MAX_RETRIES && !enriched; attempt++) {
        try {
          lastReqAt = Date.now();
          enriched = await deepEnrichOne(ath);
        } catch (e) {
          lastErr = e;
          if (attempt < MAX_RETRIES) {
            await new Promise((r) => setTimeout(r, 4000 * (attempt + 1)));
          }
        }
      }
      if (!enriched) {
        console.error(`  [${i + 1}/${list.length}] ${ath.name} — failed after retries: ${lastErr?.message || lastErr}`);
        continue;
      }

      const filled = [];
      if (ath.height_cm == null && enriched.height_cm != null) {
        ath.height_cm = enriched.height_cm;
        filled.push(`h=${enriched.height_cm}`);
      }
      if (ath.weight_kg == null && enriched.weight_kg != null) {
        ath.weight_kg = enriched.weight_kg;
        filled.push(`w=${enriched.weight_kg}`);
      }
      if (ath.age == null && enriched.age_at_year != null) {
        ath.age = enriched.age_at_year;
        filled.push(`age=${enriched.age_at_year}`);
      }
      if (filled.length > 0) {
        totalUpdated++;
        totalFieldsFilled += filled.length;
        ath._enrichmentNotes = `${ath._enrichmentNotes || ""}${ath._enrichmentNotes ? "; " : ""}deepen: ${enriched.notes}`;
        console.log(`  [${i + 1}/${list.length}] ${ath.name} → ${filled.join(", ")}`);
      } else {
        console.log(`  [${i + 1}/${list.length}] ${ath.name} → no new data`);
      }

      // Persist after each athlete for resilience
      fs.writeFileSync(filePath, JSON.stringify(list, null, 2));
    }
    console.log(`  -> ${path.basename(filePath)} done`);
  }

  console.log(`\nScanned ${totalScanned} · ${totalNeeded} needed enrichment · ${totalUpdated} got at least one field filled · ${totalFieldsFilled} total fields filled`);
}

main().catch((e) => {
  console.error("Fatal:", e);
  process.exit(1);
});
