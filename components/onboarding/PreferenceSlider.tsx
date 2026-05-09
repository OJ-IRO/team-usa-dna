"use client";

export default function PreferenceSlider({
  value,
  onChange,
  leftLabel,
  rightLabel,
  leftHint,
  rightHint,
}: {
  value: number; // 0..1
  onChange: (v: number) => void;
  leftLabel: string;
  rightLabel: string;
  leftHint?: string;
  rightHint?: string;
}) {
  return (
    <div className="space-y-5">
      <input
        type="range"
        min={0}
        max={100}
        value={Math.round(value * 100)}
        onChange={(e) => onChange(parseInt(e.target.value, 10) / 100)}
      />
      <div className="flex justify-between gap-6 text-sm">
        <div className={`transition-opacity ${value < 0.5 ? "opacity-100" : "opacity-50"}`}>
          <div className="font-semibold tracking-tight text-foreground">{leftLabel}</div>
          {leftHint && <div className="text-xs text-muted-soft mt-0.5">{leftHint}</div>}
        </div>
        <div className={`text-right transition-opacity ${value > 0.5 ? "opacity-100" : "opacity-50"}`}>
          <div className="font-semibold tracking-tight text-foreground">{rightLabel}</div>
          {rightHint && <div className="text-xs text-muted-soft mt-0.5">{rightHint}</div>}
        </div>
      </div>
    </div>
  );
}
