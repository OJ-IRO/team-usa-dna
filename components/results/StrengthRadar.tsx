"use client";

import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";

export default function StrengthRadar({
  power,
  endurance,
  speed,
  coordination,
}: {
  power: number;
  endurance: number;
  speed: number;
  coordination: number;
}) {
  const data = [
    { axis: "Power", value: power },
    { axis: "Speed", value: speed },
    { axis: "Endurance", value: endurance },
    { axis: "Coordination", value: coordination },
  ];

  return (
    <div className="w-full h-72 sm:h-80">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} outerRadius="78%">
          <PolarGrid stroke="rgba(255,255,255,0.12)" />
          <PolarAngleAxis
            dataKey="axis"
            tick={{ fill: "rgba(244,245,249,0.7)", fontSize: 12, fontFamily: "var(--font-geist-sans)", letterSpacing: 1 }}
          />
          <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
          <Radar
            name="profile"
            dataKey="value"
            stroke="#f5b50a"
            strokeWidth={2}
            fill="url(#radarGradient)"
            fillOpacity={0.55}
          />
          <defs>
            <radialGradient id="radarGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#f5b50a" stopOpacity={0.55} />
              <stop offset="100%" stopColor="#ef3a47" stopOpacity={0.18} />
            </radialGradient>
          </defs>
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
