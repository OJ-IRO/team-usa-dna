"use client";

export default function StepDots({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2 justify-center">
      {Array.from({ length: total }).map((_, i) => {
        const active = i === current;
        const done = i < current;
        return (
          <div
            key={i}
            className={`h-1.5 rounded-full transition-all duration-500 ${
              active ? "w-8 bg-foreground" : done ? "w-1.5 bg-foreground/70" : "w-1.5 bg-white/10"
            }`}
          />
        );
      })}
    </div>
  );
}
