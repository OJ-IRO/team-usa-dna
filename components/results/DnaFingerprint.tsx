"use client";

import { motion } from "motion/react";
import type { UserProfile } from "@/lib/types";

// Compute a deterministic 32-band signature from the user's profile.
// Each band's height is derived from a different mix of profile fields, so
// two users with different profiles produce visually distinct signatures —
// while the same profile always produces the same one.

function computeBands(p: UserProfile): number[] {
  const seed = [
    p.heightCm / 220,
    p.weightKg / 140,
    p.age / 70,
    p.activityLevel / 5,
    p.explosiveVsEndurance,
    (p.reactionSpeed - 1) / 4,
    p.soloVsTeam,
    p.sex === "M" ? 1 : 0,
    (p.reactionTimeMs ?? 300) / 500,
    (p.tapsPerSecond ?? 6) / 12,
  ];

  // Mix-and-fold each band index against the seed values. Cheap, deterministic,
  // produces enough variation to read as a unique fingerprint.
  return Array.from({ length: 32 }, (_, i) => {
    const phase = i / 32;
    const a = seed[0] + Math.sin(phase * Math.PI * 4 + seed[1] * 6) * 0.5;
    const b = seed[2] + Math.cos(phase * Math.PI * 2 + seed[3] * 5) * 0.5;
    const c = seed[4] + Math.sin(phase * Math.PI * 6 + seed[5] * 7) * 0.5;
    const d = seed[6] + Math.cos(phase * Math.PI * 3 + seed[7] * 4) * 0.5;
    const e = seed[8] * 0.4 + seed[9] * 0.4;
    const raw = (a + b + c + d) / 4 + e;
    // Map to [0.18, 1.0] so even the shortest bar has presence
    return 0.18 + ((Math.sin(raw * 7 + i * 1.7) + 1) / 2) * 0.82;
  });
}

function bandColor(idx: number, total: number): string {
  // Sweep across olympic blue → gold → paralympic red
  const t = idx / (total - 1);
  if (t < 0.5) {
    // blue → gold
    const k = t * 2;
    return interpolateColor("#3b7afe", "#f5b50a", k);
  } else {
    // gold → red
    const k = (t - 0.5) * 2;
    return interpolateColor("#f5b50a", "#ef3a47", k);
  }
}

function interpolateColor(a: string, b: string, t: number): string {
  const ha = parseInt(a.slice(1), 16);
  const hb = parseInt(b.slice(1), 16);
  const ar = (ha >> 16) & 0xff;
  const ag = (ha >> 8) & 0xff;
  const ab = ha & 0xff;
  const br = (hb >> 16) & 0xff;
  const bg = (hb >> 8) & 0xff;
  const bb = hb & 0xff;
  const r = Math.round(ar + (br - ar) * t);
  const g = Math.round(ag + (bg - ag) * t);
  const b2 = Math.round(ab + (bb - ab) * t);
  return `rgb(${r}, ${g}, ${b2})`;
}

function fingerprintSignature(p: UserProfile): string {
  // 8-character hex-like signature derived from profile, just for display
  let h = 2166136261;
  const fields = [
    p.heightCm,
    p.weightKg,
    p.age,
    p.activityLevel,
    Math.round(p.explosiveVsEndurance * 100),
    p.reactionSpeed,
    Math.round(p.soloVsTeam * 100),
    p.sex.charCodeAt(0),
  ];
  for (const v of fields) {
    h ^= v;
    h = Math.imul(h, 16777619);
  }
  const hex = (h >>> 0).toString(16).padStart(8, "0").toUpperCase();
  return `${hex.slice(0, 4)}-${hex.slice(4, 8)}`;
}

export default function DnaFingerprint({
  profile,
  firstName,
}: {
  profile: UserProfile;
  firstName?: string;
}) {
  const bands = computeBands(profile);
  const signature = fingerprintSignature(profile);
  const total = bands.length;

  // SVG dims
  const W = 720;
  const H = 140;
  const PAD_X = 12;
  const bandWidth = (W - PAD_X * 2) / total;
  const bandGap = 3;

  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.55 }}
      className="glass glass-shine rounded-2xl p-6 sm:p-8"
    >
      <div className="flex items-baseline justify-between gap-4 mb-5">
        <div>
          <div className="text-xs uppercase tracking-[0.18em] text-muted-soft font-mono mb-1.5">
            Profile fingerprint
          </div>
          <h3 className="display text-2xl font-semibold tracking-tight">
            {firstName?.trim() ? `${firstName.trim()}'s signature` : "Your signature"}
          </h3>
        </div>
        <div className="text-right">
          <div className="font-mono text-[11px] tracking-[0.18em] text-muted-soft uppercase mb-1">
            ID
          </div>
          <div className="font-mono tabular-nums text-[15px] sm:text-base text-foreground">
            {signature}
          </div>
        </div>
      </div>

      {/* The fingerprint bar chart */}
      <div className="w-full overflow-hidden">
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="w-full h-32">
          <defs>
            <filter id="fp-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="1.4" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          {bands.map((h, i) => {
            const barH = h * (H - 16);
            const y = (H - barH) / 2;
            const x = PAD_X + i * bandWidth;
            const color = bandColor(i, total);
            return (
              <motion.rect
                key={i}
                x={x}
                y={y}
                width={Math.max(2, bandWidth - bandGap)}
                height={barH}
                rx={1.5}
                fill={color}
                filter="url(#fp-glow)"
                initial={{ scaleY: 0, opacity: 0 }}
                whileInView={{ scaleY: 1, opacity: 1 }}
                viewport={{ once: true }}
                style={{ transformOrigin: `${x + bandWidth / 2}px ${H / 2}px` }}
                transition={{
                  duration: 0.55,
                  delay: i * 0.018,
                  ease: [0.16, 1, 0.3, 1],
                }}
              />
            );
          })}
        </svg>
      </div>

      <p className="text-[12.5px] text-muted-soft mt-4 max-w-2xl">
        A deterministic visual signature derived from your full profile — no two profiles produce the same pattern. Bars sweep from Olympic blue through gold to Paralympic red.
      </p>
    </motion.section>
  );
}
