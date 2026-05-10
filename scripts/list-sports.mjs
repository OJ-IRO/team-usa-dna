import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const files = [
  ["olympic-usa.json", "oly"],
  ["modern-usa.json", "oly"],
  ["paralympic-usa.json", "para"],
  ["paralympic-enriched.json", "para"],
  ["paralympic-enriched-historical.json", "para"],
];

const sports = new Map();
for (const [f, g] of files) {
  const p = path.join(ROOT, "data", f);
  if (!fs.existsSync(p)) continue;
  const arr = JSON.parse(fs.readFileSync(p, "utf8"));
  for (const ath of arr) {
    const cur = sports.get(ath.primarySport) || { count: 0, games: g, sample: new Set() };
    cur.count++;
    if (cur.sample.size < 4 && ath.events?.[0]?.event) cur.sample.add(ath.events[0].event);
    sports.set(ath.primarySport, cur);
  }
}
const arr = [...sports.entries()].sort((a, b) => b[1].count - a[1].count);
console.log(`Total unique sports: ${arr.length}\n`);
for (const [s, d] of arr) {
  const samples = [...d.sample].slice(0, 3).join(" / ");
  console.log(`  ${s} [${d.games}] x${d.count}  ${samples ? "— ev: " + samples : ""}`);
}
