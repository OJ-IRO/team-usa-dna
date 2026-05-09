"use client";

import { motion } from "motion/react";
import { parseUSState, regionInfo, type StateCode } from "@/lib/us-regions";

export default function HometownEcosystem({
  hometown,
  geminiInsight,
}: {
  hometown: string | undefined;
  geminiInsight: string;
}) {
  const code = parseUSState(hometown);
  const info = code ? regionInfo(code) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.55 }}
      className="glass glass-shine rounded-2xl p-7 space-y-5"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1.5 min-w-0">
          <div className="text-xs uppercase tracking-[0.18em] text-muted-soft font-mono">Regional ecosystem</div>
          <h3 className="text-xl font-semibold tracking-tight truncate">
            {hometown ? hometown : "Hometown ecosystem"}
          </h3>
        </div>
        {info && (
          <StateBadge code={code as StateCode} name={info.name} />
        )}
      </div>

      {info && (
        <div className="space-y-3">
          <div className="text-xs uppercase tracking-[0.16em] text-muted-soft font-mono">
            {info.region} · sports historically prominent here
          </div>
          <div className="flex flex-wrap gap-2">
            {info.sports.map((sport) => (
              <span
                key={sport}
                className="px-3 py-1.5 rounded-full text-[12.5px] tracking-tight bg-white/[0.06] border border-white/10 text-foreground"
              >
                {sport}
              </span>
            ))}
          </div>
          <div className="text-[13px] text-muted-soft italic">{info.flavor}</div>
        </div>
      )}

      {geminiInsight && (
        <div className="pt-3 border-t border-white/5">
          <div className="text-[11px] uppercase tracking-[0.18em] text-muted-soft font-mono mb-2">
            Gemini&apos;s read on your hometown
          </div>
          <p className="text-muted text-[15px] leading-relaxed">{geminiInsight}</p>
        </div>
      )}
    </motion.div>
  );
}

function StateBadge({ code, name }: { code: StateCode; name: string }) {
  return (
    <div
      className="shrink-0 size-16 rounded-2xl flex flex-col items-center justify-center text-center"
      style={{
        background:
          "linear-gradient(135deg, rgba(73,131,255,0.18), rgba(245,181,10,0.12), rgba(239,58,71,0.16))",
        border: "1px solid rgba(255,255,255,0.12)",
      }}
      title={name}
    >
      <div className="display text-2xl font-semibold tracking-tight leading-none">{code}</div>
      <div className="text-[8px] uppercase tracking-[0.2em] text-muted-soft mt-0.5">State</div>
    </div>
  );
}
