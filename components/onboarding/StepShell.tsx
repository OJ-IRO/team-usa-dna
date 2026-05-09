"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";

export default function StepShell({
  index,
  total,
  title,
  subtitle,
  children,
  footer,
}: {
  index: number;
  total: number;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <motion.div
      key={index}
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-2xl"
    >
      <div className="text-xs uppercase tracking-[0.18em] text-muted-soft mb-3 font-mono">
        Step {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
      </div>
      <h2 className="display text-3xl sm:text-5xl font-semibold tracking-tight mb-4">
        {title}
      </h2>
      {subtitle && (
        <p className="text-muted text-[15.5px] leading-relaxed mb-9 max-w-xl">{subtitle}</p>
      )}
      <div className="mb-10">{children}</div>
      {footer && <div className="flex items-center gap-3">{footer}</div>}
    </motion.div>
  );
}
