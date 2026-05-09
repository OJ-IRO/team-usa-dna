import { ImageResponse } from "next/og";

export const alt = "Team USA DNA — Find the archetype inside your build";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px",
          color: "#f4f5f9",
          background:
            "radial-gradient(circle at 20% 0%, rgba(73,131,255,0.55), transparent 55%), radial-gradient(circle at 100% 100%, rgba(239,58,71,0.55), transparent 55%), radial-gradient(circle at 50% 110%, rgba(245,181,10,0.30), transparent 55%), #03040a",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Brand wordmark */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background:
                "linear-gradient(135deg, #4983ff, #f5b50a, #ef3a47)",
            }}
          />
          <span style={{ fontSize: 28, fontWeight: 600, letterSpacing: -0.4 }}>
            Team USA DNA
          </span>
        </div>

        {/* Headline + tagline */}
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <div
            style={{
              fontSize: 16,
              letterSpacing: 4,
              textTransform: "uppercase",
              color: "rgba(244,245,249,0.55)",
              fontFamily: "monospace",
            }}
          >
            Athlete Archetype Agent · Powered by Gemini
          </div>
          <div
            style={{
              fontSize: 110,
              fontWeight: 600,
              letterSpacing: -3,
              lineHeight: 0.95,
              maxWidth: 1000,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <span>Find the archetype</span>
            <span
              style={{
                background:
                  "linear-gradient(90deg, #4983ff, #f5b50a, #ef3a47)",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              inside your build.
            </span>
          </div>
          <div
            style={{
              fontSize: 26,
              color: "rgba(244,245,249,0.75)",
              maxWidth: 920,
              lineHeight: 1.4,
            }}
          >
            128 years of Team USA Olympic + Paralympic data, clustered into cohort archetypes by Gemini.
          </div>
        </div>

        {/* Footer stats */}
        <div
          style={{
            display: "flex",
            gap: 56,
            fontSize: 18,
            color: "rgba(244,245,249,0.6)",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={{ color: "#f4f5f9", fontSize: 30, fontWeight: 600 }}>
              7,700+
            </span>
            <span style={{ letterSpacing: 2, fontSize: 13, textTransform: "uppercase" }}>
              Team USA athletes
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={{ color: "#f4f5f9", fontSize: 30, fontWeight: 600 }}>
              1896–2024
            </span>
            <span style={{ letterSpacing: 2, fontSize: 13, textTransform: "uppercase" }}>
              Olympic + Paralympic
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={{ color: "#f4f5f9", fontSize: 30, fontWeight: 600 }}>
              Cohort-level
            </span>
            <span style={{ letterSpacing: 2, fontSize: 13, textTransform: "uppercase" }}>
              NIL-compliant
            </span>
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
