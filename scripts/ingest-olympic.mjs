import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Papa from "papaparse";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const CSV_PATH = path.join(ROOT, "data", "raw", "athlete_events.csv");
const OUTPUT_PATH = path.join(ROOT, "data", "olympic-usa.json");

console.log(`Reading ${CSV_PATH}...`);
const csvText = fs.readFileSync(CSV_PATH, "utf8");

console.log("Parsing CSV (this is a 41MB file, give it a moment)...");
const { data, errors } = Papa.parse(csvText, {
  header: true,
  skipEmptyLines: true,
});
if (errors.length > 0) {
  console.warn(`Parser produced ${errors.length} warnings (first: ${errors[0]?.message})`);
}
console.log(`Total rows parsed: ${data.length}`);

const usaRows = data.filter((r) => r.NOC === "USA");
console.log(`Team USA rows: ${usaRows.length}`);

function parseNum(v) {
  if (v == null || v === "" || v === "NA") return null;
  const n = parseFloat(v);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function parseMedal(v) {
  if (v === "Gold" || v === "Silver" || v === "Bronze") return v;
  return null;
}

function median(arr) {
  if (arr.length === 0) return null;
  const sorted = [...arr].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}

function slugify(s, id) {
  return (
    "oly-" +
    s
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 60) +
    "-" +
    id
  );
}

// Group rows by athlete ID (more reliable than name due to homonyms)
const byId = new Map();
for (const r of usaRows) {
  const id = r.ID;
  if (!byId.has(id)) byId.set(id, []);
  byId.get(id).push(r);
}

const athletes = [];
for (const [id, rows] of byId) {
  const sample = rows[0];
  const heights = rows.map((r) => parseNum(r.Height)).filter((n) => n != null);
  const weights = rows.map((r) => parseNum(r.Weight)).filter((n) => n != null);
  const ages = rows.map((r) => parseNum(r.Age)).filter((n) => n != null);

  const sportCounts = {};
  for (const r of rows) sportCounts[r.Sport] = (sportCounts[r.Sport] || 0) + 1;
  const primarySport = Object.entries(sportCounts).sort((a, b) => b[1] - a[1])[0][0];

  const medals = { gold: 0, silver: 0, bronze: 0 };
  for (const r of rows) {
    const m = parseMedal(r.Medal);
    if (m === "Gold") medals.gold++;
    else if (m === "Silver") medals.silver++;
    else if (m === "Bronze") medals.bronze++;
  }

  // Dedupe events by year+event (each row in CSV is per-event, but team events repeat)
  const eventsMap = new Map();
  for (const r of rows) {
    const ekey = `${r.Year}|${r.Event}`;
    if (!eventsMap.has(ekey)) {
      eventsMap.set(ekey, {
        year: parseInt(r.Year, 10),
        sport: r.Sport,
        event: r.Event,
        medal: parseMedal(r.Medal),
      });
    } else {
      // Promote to highest medal if current is null
      const existing = eventsMap.get(ekey);
      const m = parseMedal(r.Medal);
      if (m && !existing.medal) existing.medal = m;
    }
  }

  const events = Array.from(eventsMap.values()).sort((a, b) => a.year - b.year);

  athletes.push({
    id: slugify(sample.Name, id),
    name: sample.Name,
    sex: sample.Sex,
    height_cm: median(heights) ? Math.round(median(heights)) : null,
    weight_kg: median(weights) ? Math.round(median(weights)) : null,
    age: median(ages) ? Math.round(median(ages)) : null,
    games: "olympic",
    primarySport,
    events,
    medals,
  });
}

console.log(`Unique Team USA athletes: ${athletes.length}`);
console.log(`  with height: ${athletes.filter((a) => a.height_cm).length}`);
console.log(`  with weight: ${athletes.filter((a) => a.weight_kg).length}`);
console.log(`  with any medal: ${athletes.filter((a) => a.medals.gold + a.medals.silver + a.medals.bronze > 0).length}`);

// To keep the JSON lean for Cloud Run cold-start, prefer athletes with at least
// one of (height, weight) recorded — they make stronger biometric matches.
// Include medal-less athletes too: they widen the candidate pool.
const filtered = athletes.filter((a) => a.height_cm != null || a.weight_kg != null);
console.log(`After filtering to athletes with bio data: ${filtered.length}`);

fs.writeFileSync(OUTPUT_PATH, JSON.stringify(filtered));
const sizeKB = Math.round(fs.statSync(OUTPUT_PATH).size / 1024);
console.log(`Wrote ${OUTPUT_PATH} (${sizeKB} KB)`);

// Sanity: top 5 sports
const sportTotals = {};
for (const a of filtered) sportTotals[a.primarySport] = (sportTotals[a.primarySport] || 0) + 1;
const top = Object.entries(sportTotals).sort((a, b) => b[1] - a[1]).slice(0, 8);
console.log("Top sports:", top);

// Sanity: year span
const allYears = filtered.flatMap((a) => a.events.map((e) => e.year));
console.log(`Year span: ${Math.min(...allYears)} – ${Math.max(...allYears)}`);
