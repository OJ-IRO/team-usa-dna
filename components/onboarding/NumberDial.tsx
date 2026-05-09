"use client";

import { cmToFeetInches, kgToLb } from "@/lib/units";

export default function NumberDial({
  value,
  onChange,
  min,
  max,
  step = 1,
  unit,
  label,
}: {
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step?: number;
  unit: string;
  label: string;
}) {
  // For US fans, show imperial alongside metric on height/weight dials.
  let imperial: string | null = null;
  if (unit === "cm") imperial = cmToFeetInches(value).label;
  else if (unit === "kg") imperial = `${kgToLb(value)} lb`;

  return (
    <div className="space-y-4">
      <div className="text-xs uppercase tracking-[0.16em] text-muted-soft">{label}</div>
      <div className="flex items-baseline gap-3 flex-wrap">
        <span className="display text-7xl font-semibold tracking-tight tabular-nums">
          {value}
        </span>
        <span className="text-2xl text-muted-soft font-mono">{unit}</span>
        {imperial && (
          <span className="text-base text-muted-soft font-mono ml-1">· {imperial}</span>
        )}
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
      />
      <div className="flex justify-between text-xs text-muted-soft font-mono">
        <span>
          {min} {unit}
          {unit === "cm" && ` · ${cmToFeetInches(min).label}`}
          {unit === "kg" && ` · ${kgToLb(min)} lb`}
        </span>
        <span>
          {max} {unit}
          {unit === "cm" && ` · ${cmToFeetInches(max).label}`}
          {unit === "kg" && ` · ${kgToLb(max)} lb`}
        </span>
      </div>
    </div>
  );
}
