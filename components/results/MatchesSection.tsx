"use client";

import { motion } from "motion/react";
import ClusterCard from "./ClusterCard";
import type { ClusterMatch } from "@/lib/types";

export default function MatchesSection({
  variant,
  title,
  subtitle,
  narrative,
  matches,
  onExpand,
}: {
  variant: "olympic" | "paralympic";
  title: string;
  subtitle: string;
  narrative: string;
  matches: ClusterMatch[];
  onExpand?: (m: ClusterMatch) => void;
}) {
  const accent = variant === "olympic" ? "var(--olympic)" : "var(--paralympic)";

  return (
    <section className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="flex items-start gap-3"
      >
        <span className="size-2 rounded-full mt-3 shrink-0" style={{ background: accent }} />
        <div className="flex-1 space-y-3">
          <div className="text-xs uppercase tracking-[0.18em] font-mono" style={{ color: accent }}>
            {subtitle}
          </div>
          <h3 className="display text-3xl sm:text-4xl font-semibold tracking-tight leading-[1.05]">{title}</h3>
        </div>
      </motion.div>

      {narrative && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-muted text-[15.5px] leading-relaxed max-w-3xl"
        >
          {narrative}
        </motion.p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {matches.map((m, i) => (
          <ClusterCard key={m.cluster.id} match={m} variant={variant} index={i} onExpand={onExpand} />
        ))}
      </div>
    </section>
  );
}
