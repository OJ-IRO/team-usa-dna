"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";

export default function InsightCard({
  label,
  title,
  body,
  children,
  delay = 0,
}: {
  label: string;
  title: string;
  body?: string;
  children?: ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.55, delay, ease: [0.16, 1, 0.3, 1] }}
      className="glass glass-shine rounded-2xl p-7"
    >
      <div className="text-xs uppercase tracking-[0.18em] text-muted-soft mb-3 font-mono">
        {label}
      </div>
      <h3 className="text-xl font-semibold tracking-tight mb-3">{title}</h3>
      {body && <p className="text-muted text-[15px] leading-relaxed">{body}</p>}
      {children}
    </motion.div>
  );
}
