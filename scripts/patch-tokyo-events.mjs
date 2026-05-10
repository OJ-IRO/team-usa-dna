// One-off: backfill Tokyo 2020 (held 2021) events for athletes already in
// data/modern-usa.json who medaled at Tokyo. The seed only captured each
// athlete's representative year, so multi-Olympic medalists were missing
// their earlier appearances. This patch adds them to the events array so
// they show up in the cluster's medalYears.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const PATH = path.join(ROOT, "data", "modern-usa.json");

const PATCHES = {
  "Kevin Durant":             { year: 2020, sport: "Basketball",  event: "Men's basketball",        medal: "Gold" },
  "Jrue Holiday":             { year: 2020, sport: "Basketball",  event: "Men's basketball",        medal: "Gold" },
  "Katie Ledecky":            { year: 2020, sport: "Swimming",    event: "1500m freestyle",         medal: "Gold" },
  "Bobby Finke":              { year: 2020, sport: "Swimming",    event: "800m / 1500m freestyle",  medal: "Gold" },
  "Sydney McLaughlin-Levrone":{ year: 2020, sport: "Athletics",   event: "400m hurdles",            medal: "Gold" },
  "Ryan Crouser":             { year: 2020, sport: "Athletics",   event: "Shot put",                medal: "Gold" },
  "Simone Biles":             { year: 2020, sport: "Gymnastics",  event: "Team / Beam",             medal: "Silver" },
  "Sunisa Lee":               { year: 2020, sport: "Gymnastics",  event: "All-around",              medal: "Gold" },
  "Vincent Hancock":          { year: 2020, sport: "Shooting",    event: "Men's skeet",             medal: "Gold" },
  "Helen Maroulis":           { year: 2020, sport: "Wrestling",   event: "Women's freestyle 57kg",  medal: "Bronze" },
  "Allyson Felix":            { year: 2020, sport: "Athletics",   event: "4x400m mixed relay / 400m", medal: "Gold" },
  "Lilly King":               { year: 2020, sport: "Swimming",    event: "Breaststroke",            medal: "Silver" },
  "Ryan Murphy":              { year: 2020, sport: "Swimming",    event: "Backstroke",              medal: "Silver" },
  "Caeleb Dressel":           { year: 2020, sport: "Swimming",    event: "100m freestyle / butterfly", medal: "Gold" },
  // Caeleb already has 2020 in seed, but adding ensures medal year shows
};

let raw = fs.readFileSync(PATH, "utf8");
if (raw.charCodeAt(0) === 0xfeff) raw = raw.slice(1);
const data = JSON.parse(raw);

let patched = 0;
for (const a of data) {
  const p = PATCHES[a.name];
  if (!p) continue;
  // Skip if this exact (year, event) is already there
  const exists = a.events.some(
    (e) => e.year === p.year && e.event === p.event,
  );
  if (exists) continue;
  a.events.push(p);
  // Also bump the cohort medal totals so cluster aggregation picks them up.
  if (p.medal === "Gold") a.medals.gold += 1;
  else if (p.medal === "Silver") a.medals.silver += 1;
  else if (p.medal === "Bronze") a.medals.bronze += 1;
  patched += 1;
  console.log(`Patched ${a.name} ← ${p.year} ${p.medal}`);
}

fs.writeFileSync(PATH, JSON.stringify(data, null, 2));
console.log(`\nDone. ${patched} athlete event records added.`);
