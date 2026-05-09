import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export const runtime = "nodejs";
export const maxDuration = 60;

const MODEL = "imagen-4.0-generate-001";

// Hard guardrails — generate ONLY abstract art-deco athletic emblems.
// Strictly avoid any Olympic / IOC / USOPC / Team USA copyrighted marks,
// real flags, photoreal faces, and branded equipment. The emblem must be
// unique to the user — derived from their archetype name + matched sport.
function buildPositivePrompt(_archetypeName: string, sport: string, _sex: "M" | "F" | undefined) {
  const sportMotif = motifFor(sport);
  // The archetype name is intentionally NOT passed to the image model — passing
  // a quoted string ("titled X") prompts Imagen to literally render that text
  // inside the image, which violates our no-text rule and looks awful.
  // Variation between users still comes from the per-sport motif + model noise.
  return [
    `An abstract symmetrical art-deco athletic emblem.`,
    `A clean shield-or-medallion silhouette centered on a deep navy starfield background.`,
    `Sport-themed motif of ${sportMotif} composed of clean geometric forms.`,
    `Color palette: deep navy, burnished gold, crimson red, ivory accents.`,
    `Premium cinematic emblem, trophy-like, minimalist 2D illustration, high contrast, sharp lines.`,
    `Subtle radial glow behind the shield.`,
    `Style references: classic medal engravings, art-deco architecture, abstract heraldry.`,
    ``,
    `STRICTLY EXCLUDE — under no circumstances generate any of the following:`,
    `- ANY text, letters, numerals, words, captions, labels, watermarks, or written language of any kind. The image must contain ZERO writing.`,
    `- The Olympic rings (five interlocking rings) or any IOC / USOPC / Team USA emblems or logos`,
    `- The Olympic torch or flame illustration`,
    `- Any real flags, including the American flag or stars-and-stripes pattern`,
    `- Any human figures, faces, silhouettes, or athlete portraits`,
    `- Any photoreal people or photorealistic athletes`,
    `- Any branded sport equipment, team logos, or trademarks`,
    `Output: pure abstract heraldic emblem, geometric and wordless.`,
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
        // prohibitions into the positive prompt above.
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
