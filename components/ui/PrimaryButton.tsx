"use client";

import Link from "next/link";
import { motion } from "motion/react";
import type { ReactNode } from "react";

type Props = {
  href?: string;
  onClick?: () => void;
  children: ReactNode;
  variant?: "primary" | "ghost";
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit";
};

export default function PrimaryButton({
  href,
  onClick,
  children,
  variant = "primary",
  className = "",
  disabled,
  type = "button",
}: Props) {
  const base =
    "inline-flex items-center justify-center gap-2 px-6 h-12 rounded-full text-[15px] font-medium transition-all duration-200 select-none";
  const styles =
    variant === "primary"
      ? "bg-foreground text-background hover:bg-white hover:scale-[1.015] active:scale-[0.99] shadow-[0_8px_30px_rgba(255,255,255,0.18)]"
      : "bg-white/[0.06] text-foreground border border-white/10 hover:bg-white/[0.1]";

  const cls = `${base} ${styles} ${disabled ? "opacity-40 pointer-events-none" : ""} ${className}`;

  const inner = (
    <motion.span
      whileTap={{ scale: 0.97 }}
      className="inline-flex items-center gap-2"
    >
      {children}
    </motion.span>
  );

  if (href) {
    return (
      <Link href={href} className={cls}>
        {inner}
      </Link>
    );
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={cls}>
      {inner}
    </button>
  );
}
