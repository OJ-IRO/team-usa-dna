import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export const runtime = "nodejs";
export const maxDuration = 60;

const MODEL = "imagen-4.0-generate-001";

// Hard guardrails — generate ONLY abstract art-deco athletic emblems.
// Strictly avoid any Olympic / IOC / USOPC / Team USA copyrighted marks,
// real flags, photoreal faces, and branded equipment. The emblem must be
// unique to the user — derived from their archetype name + matched sport.
//
// HACKATHON RULES: AI-generated emblems must NOT contain the Olympic rings,
// the Olympic torch/flame, the IOC/USOPC marks, or unauthorized national
// flags. The Gemini Developer API does not support `negativePrompt` (that's
// Vertex-only), so the prohibitions are inlined into the positive prompt
// AND we lead with them before the descriptive section, since image models
// weight the earlier portion of the prompt more strongly. We also avoid
// trigger words ("Olympic", "trophy", "medal", "torch") in the *positive*
// section — those names tend to coax the model toward the very imagery
// we're trying to exclude even when explicitly told not to use them.
function buildPositivePrompt(_archetypeName: string, sport: string, _sex: "M" | "F" | undefined) {
  const sportMotif = motifFor(sport);
  return [
    // HARD PROHIBITIONS — first so the model anchors on them.
    `ABSOLUTE EXCLUSIONS (the image must contain ZERO of the following, no exceptions):`,
    `1. NO five interlocking circles or rings of any kind. NO ring shapes. NO chain of circles.`,
    `2. NO torch. NO flame. NO fire. NO burning object. NO holders or hands holding anything aflame.`,
    `3. NO IOC, USOPC, Team USA, or Olympic Movement marks, logos, or symbols of any kind.`,
    `4. NO national flags. NO American flag. NO stars-and-stripes pattern. NO flag-like rectangles with stripes.`,
    `5. NO text, letters, numerals, words, captions, labels, or watermarks. The image must contain ZERO writing of any kind.`,
    `6. NO human figures, faces, silhouettes, athlete portraits, or photorealistic people.`,
    `7. NO branded sport equipment, team logos, or registered trademarks.`,
    ``,
    // POSITIVE DESCRIPTION — wordless, geometric, art-deco only.
    `Generate: an abstract symmetrical art-deco athletic shield-emblem.`,
    `Centered shield silhouette over a deep navy starfield background with a subtle radial glow.`,
    `Inside the shield: a sport-themed abstract motif of ${sportMotif}, composed of clean geometric forms only.`,
    `Color palette: deep navy, burnished gold, crimson red, ivory accents.`,
    `Style: minimalist 2D heraldic illustration, high contrast, sharp lines, clean geometry.`,
    `Style references: art-deco architecture, abstract heraldry, geometric medallions.`,
    `The emblem is purely abstract and wordless — it MUST NOT depict any of the prohibited items above.`,
  ].join(" ");
}

function motifFor(sport: string): string {
  const s = sport.toLowerCase();
  if (s.includes("swim")) return "stylized water waves and parallel current lines";
  if (s.includes("athletics") || s.includes("track")) return "concentric track curves and starburst rays";
  if (s.includes("basketball")) return "geometric arcs forming an abstract court";
  if (s.includes("baseball") || s.includes("softball")) return "abstract diamond shape with radiating lines";
  if (s.includes("ski") || s.includes("snowboard")) return "stylized mountain peaks and angular slopes";
  if (s.includes("cycl")) return "abstract concentric circles like spinning wheels";
  if (s.includes("row") || s.includes("canoe") || s.includes("sail")) return "stylized rippling water and parallel oar-like strokes";
  if (s.includes("wrestl") || s.includes("box")) return "two interlocking abstract triangular forms";
  if (s.includes("gymnast")) return "spiraling ribbons and rotating geometric shapes";
  if (s.includes("shoot") || s.includes("arch")) return "concentric target rings and crossed line accents";
  if (s.includes("skat") || s.includes("figure")) return "elegant curved arcs and crystalline facets";
  if (s.includes("hockey")) return "crossed angular forms and radial speed lines";
  if (s.includes("volleyball") || s.includes("court")) return "angular net-like geometric grid";
  if (s.includes("climb")) return "stacked angular peaks and crystalline vertical forms";
  if (s.includes("surf")) return "stylized rolling waves and curved horizon lines";
  if (s.includes("para") || s.includes("wheelchair")) return "radiating spokes and bold concentric circles";
  return "radiant geometric starburst with elegant symmetry";
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      archetypeName?: string;
      sport?: string;
      sex?: "M" | "F";
    };
    const archetypeName = (body.archetypeName ?? "").trim();
    const sport = (body.sport ?? "").trim();
    if (!archetypeName || archetypeName.length > 80) {
      return NextResponse.json({ error: "Invalid archetype" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY is not set");
    const ai = new GoogleGenAI({ apiKey });

    const prompt = buildPositivePrompt(archetypeName, sport || "athletics", body.sex);

    const response = await ai.models.generateImages({
      model: MODEL,
      prompt,
      config: {
        numberOfImages: 1,
        aspectRatio: "1:1",
        // negativePrompt is Vertex-only; for Gemini Developer API we fold the
        // prohibitions into the positive prompt above (lead-in section).
        personGeneration: "dont_allow" as never,
      },
    });

    const imageBytes = response.generatedImages?.[0]?.image?.imageBytes;
    if (!imageBytes) {
      return NextResponse.json({ error: "Generation failed" }, { status: 502 });
    }

    return NextResponse.json({
      dataUrl: `data:image/png;base64,${imageBytes}`,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "unknown";
    console.error("[/api/crest]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
