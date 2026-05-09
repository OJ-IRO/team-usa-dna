# Team USA DNA

**An AI-powered athletic archetype agent built for the Team USA x Google Cloud Hackathon (Challenge 4: The Athlete Archetype Agent).**

Team USA DNA analyzes ~7,600 Team USA Olympic athletes (1896–2024) and a curated set of Team USA Paralympic medalists, **clusters them into ~600 cohorts** by sport / decade / sex, then matches a fan's biometrics, preferences, and (optionally) a photo to the closest cohorts. **Gemini 2.5 Flash** composes the archetype narrative grounded in cohort statistics — never naming individual athletes, in compliance with the hackathon's NIL rules.

Olympic and Paralympic cohorts are weighted equally in the matcher, equally prominent in the UI, and equally substantive in the Gemini-generated narrative. This is a structural commitment, not a UI decoration.

## NIL compliance (hackathon rule §x)

> *"There is a strict prohibition on the use of any athlete's Name, Image, or Likeness (NIL) in your submission. Your project can analyze data that is associated with an athlete by name, but the output should not be at the individual level."*

We comply structurally:
- **Inputs may be named:** the dataset is analyzed by name internally for matching math.
- **Outputs are cohort-level only:** the UI surfaces clusters like *"Swimming · 2000s · Men, 39 athletes"* — never an individual.
- **Gemini system instruction has a hard NIL guardrail:** the model is forbidden from emitting any individual's name; the schema describes outputs in terms of cohorts, types, and eras.
- **No athlete photos** are used anywhere in the app.

## What it does

1. **Onboarding (7 steps):** sex, height, weight, age, activity level, explosive-vs-endurance preference, reaction speed, solo-vs-team preference, hometown, optional photo.
2. **Clustering (`lib/data.ts`):** at module load, athletes are bucketed by `{games, sport, decade, sex}`. Sparse buckets (<5 Olympic, <2 Paralympic) are dropped. Each cluster carries cohort size, average biometrics, medal totals, and representative event labels.
3. **Matching (`lib/matching.ts`):** scores the user against every cluster — biometric similarity (height/weight/age, sex match) + sport-alignment similarity + medal-density and cohort-size bonuses. Returns top-3 Olympic and top-3 Paralympic clusters.
4. **Gemini call (`lib/gemini.ts`):** strict JSON schema, system instruction enforces NIL compliance, conditional language, and equal Olympic/Paralympic narrative weight. Multimodal — if a photo is provided, it's sent inline for Gemini Vision to read apparent build cues.
5. **Results page:** **3D archetype constellation (three.js)** showing the user as a luminous orb at center, surrounded by the matched cohorts as colored nodes in 3D space (X = layout angle, Y = avg cohort height, Z = era depth). Below it: archetype hero card, strength radar, three Olympic + three Paralympic cohort cards, hometown insight, sport recommendations, optional vision insight, shareable Athlete DNA card.

## Stack

- **Next.js 16.2** (App Router, Turbopack, standalone output)
- **TypeScript** strict
- **Tailwind CSS v4**
- **Motion** (Framer Motion successor) for 2D transitions
- **three.js + @react-three/fiber + @react-three/drei** for the 3D archetype constellation
- **Zustand v5** for onboarding state
- **Recharts** for the strength radar
- **`@google/genai`** for the Gemini SDK (Gemini 2.5 Flash)
- **Cloud Run** as the deploy target with **Secret Manager** for the API key

## Data sources

The Olympic pool is built from two layers, both bundled as JSON in the production build:

- **Historical (1896–2016):** [120 Years of Olympic History: Athletes and Results](https://www.kaggle.com/datasets/heesoo37/120-years-of-olympic-history-athletes-and-results) (Kaggle, by rgriffin / heesoo37). 271,116 rows → filtered to 9,653 unique Team USA athletes → 7,579 with at least one biometric → `data/olympic-usa.json`. Run `node scripts/ingest-olympic.mjs` to regenerate.
- **Modern (2018–2024):** A curated seed list of ~55 Team USA athletes from PyeongChang 2018, Tokyo 2020, Beijing 2022, and Paris 2024, drawn from the Olympic disciplines best-known to fans of those Games. Biometrics are fetched at build time by **`scripts/enrich-modern-athletes.mjs`**, which calls Gemini 2.5 Flash with **Google Search grounding** to consult Olympic.com / Wikipedia / Team USA / NBC profiles for each athlete. The script commits a height/weight only when sources agree within 3 cm / 3 kg — otherwise null. Output lands in `data/modern-usa.json` (committed). Rerun: `node scripts/enrich-modern-athletes.mjs --force`.

**Why this matters:** the historical Kaggle set ends at Rio 2016, so the modern supplement closes a 2018–2024 gap. *Names appear only inside the dataset for analysis; nothing about an individual is rendered in the UI.* The grounded enrichment also doubles as a second distinctive use of Gemini in the build pipeline (alongside the runtime narrative call).

- **Paralympic:** Curated set of 24 Team USA Paralympians across 10+ disciplines. Bio data null where not publicly verifiable; matcher uses sport alignment + sex + competition age in those cases. Future work: extend the grounding script to enrich Paralympic biometrics from IPC profiles.

## Local development

### Prerequisites

- Node.js 20+
- A Gemini API key from https://aistudio.google.com/apikey

### Free tier limits (important for demo)

The free tier of `gemini-2.5-flash` caps at **20 requests per day per project**. The runtime archetype call uses ~1 request per user. Building/refreshing the modern athlete supplement uses one request per athlete (~50). If you plan to demo or rebuild that dataset, **add a payment method to your Google AI Studio project to upgrade to Tier 1** — billing only kicks in past Tier 1's much larger free quotas, which a hackathon demo will not exceed. https://aistudio.google.com/billing

### Setup

```bash
cd team-usa-dna
npm install

# Place the Kaggle CSV (login required to download from Kaggle).
# Expected at: data/raw/athlete_events.csv
# Then ingest:
node scripts/ingest-olympic.mjs

# Configure your API key
cp .env.example .env.local
# edit .env.local to set GEMINI_API_KEY=...

npm run dev
```

Open http://localhost:3000.

### Production build

```bash
npm run build
npm start
```

## Deploy to Cloud Run

The Dockerfile uses Next.js standalone output for a small final image (~200 MB).

```bash
# 1. Auth + project
gcloud auth login
gcloud config set project YOUR_PROJECT_ID
gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com

# 2. Deploy directly from source (Cloud Build will use the Dockerfile)
gcloud run deploy team-usa-dna \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars GEMINI_API_KEY=YOUR_KEY \
  --memory 1Gi \
  --cpu 1 \
  --concurrency 40 \
  --max-instances 5 \
  --timeout 300
```

Output is a public URL (e.g. `https://team-usa-dna-xxxxx-uc.a.run.app`).

For better security, store the key in Secret Manager and pass via `--set-secrets`:

```bash
echo -n "YOUR_KEY" | gcloud secrets create gemini-api-key --data-file=-
gcloud run deploy team-usa-dna \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --set-secrets GEMINI_API_KEY=gemini-api-key:latest
```

## Architecture

```
app/
├── page.tsx                       Landing
├── onboarding/page.tsx            Multi-step form (Zustand)
├── results/page.tsx               3D constellation + cohort cards + insights
└── api/analyze/route.ts           POST: cluster matcher → Gemini → JSON

lib/
├── types.ts                       Shared types (Cluster, ClusterMatch)
├── data.ts                        Loads JSON pools, builds clusters at module load
├── matching.ts                    Scores user against every cluster
├── sport-taxonomy.ts              Sport profile vectors (~50 Olympic + Paralympic + Winter)
├── store.ts                       Zustand onboarding state
├── gemini.ts                      Gemini wrapper with NIL-compliant system instruction
└── fallback.ts                    Algorithmic narrative when Gemini unavailable

components/
├── landing/                       Hero, ParityNote, HowItWorks, Footer, Nav
├── onboarding/                    Step shells, dial, slider, photo upload
├── results/
│   ├── ArchetypeConstellation     three.js + r3f + drei 3D scene
│   ├── ArchetypeHero              Archetype name + summary + radar
│   ├── ClusterCard                Per-cohort card (no athlete names)
│   ├── MatchesSection             Olympic / Paralympic cohort grid
│   ├── InsightCard                Hometown + sport recommendations
│   ├── ShareCard / ShareCardSection  PNG export of cohort archetype
│   └── AnalyzingOverlay           Loading state with concentric animated rings
└── ui/                            PrimaryButton

data/
├── olympic-usa.json               Generated by scripts/ingest-olympic.mjs
├── modern-usa.json                Generated by scripts/enrich-modern-athletes.mjs
└── paralympic-usa.json            Curated

scripts/
├── ingest-olympic.mjs             CSV → JSON (Team USA filter, dedupe, aggregate)
└── enrich-modern-athletes.mjs     Gemini grounding for 2018–2024 biometrics
```

## Design principles

- **Cohort-level outputs only.** Every visible result references a *type* — a sport / decade / sex bucket of N athletes — never a person. Compliant with the hackathon NIL rule by construction.
- **Grounded over generated.** Every cohort surfaced is a real cluster computed from the dataset. Gemini provides narrative, not facts.
- **Conditional language only.** "Could suggest", "historically associated with", "may align". Never "you will be." Enforced by the system instruction *and* the schema descriptions.
- **Olympic/Paralympic parity is structural.** Same matcher. Same top-K. Same UI weight. Same narrative depth required.
- **Multimodal is optional.** Users who skip the photo step still get a complete archetype.
- **Three.js as the headline visual.** The 3D constellation is a fan-facing visualization that fits the "see yourself in the collective journey" framing better than a static chart.

## Submission notes

- Built solo for the Team USA x Google Cloud Hackathon, May 2026.
- Challenge 4: The Athlete Archetype Agent.
- Apache License 2.0.
- Not affiliated with the IOC, IPC, or USOPC. Athlete data drawn from public datasets and analyzed at the cohort level only — no individual NIL is rendered in the UI.
