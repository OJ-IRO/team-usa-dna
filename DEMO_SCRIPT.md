# Demo video script — 3 minutes, unlisted YouTube

**Hard requirement: ≤ 3:00.** Record at 1080p, mic close, screen capture at 60 fps if your tool supports it.

The script targets the three judging buckets:
- **Impact (40%)** — fan-centric, Paralympic parity is structural, NIL-compliant cohort framing
- **Technical Depth (30%)** — three distinct uses of Gemini, three.js 3D visualization, real clustering analytics
- **Presentation (30%)** — clean UX, real grounded matches

---

## 0:00 – 0:15 · Hook
**[Screen: landing page hero, slowly pan]**

> "What if you could see yourself in the collective journey of Team USA — across 128 years of Olympic and Paralympic data? Meet Team USA DNA."

## 0:15 – 0:55 · Onboarding speed-run
**[Click "Find my archetype". Move through the 8 steps. Slow down on the games.]**

> "Sex, body, age, activity, training style — fast pass."

**[Linger on Step 4: ReactionGame. Hit it 5 times. Show real ms appearing.]**

> "Step four: a real reaction-time game. Wait for green, tap. Five trials, drop the slowest. Average feeds the matcher — no self-rating, actual measurement."

**[Step 5: Twitch. Tap rapidly for 5 seconds. Show counter climbing.]**

> "Step five: 5-second twitch test. Sustained taps-per-second adds to your reaction score."

**[Continue through hometown, photo. At final step, click "Reveal my archetype".]**

## 0:50 – 1:15 · The reveal
**[Analyzing screen with the three concentric rings spinning, then results page loads with the 3D constellation as the hero.]**

> "Behind the scenes, we cluster ~7,600 Team USA Olympic athletes and a curated set of Paralympic medalists by sport, era, and sex — about 600 cohorts total. The matcher scores your profile against every one. Gemini 2.5 Flash then composes a narrative grounded in cohort statistics."

## 1:15 – 1:50 · The constellation (Tech Depth wow moment)
**[Pause on the 3D scene. Let it auto-orbit. Drag it to show interactivity.]**

> "This is your archetype constellation, rendered in three.js. You're the gold orb at center. Each sphere is a Team USA cohort — Olympic in blue, Paralympic in red. Vertical position is rank order, depth is era. Drag to explore in 3D. Your closest cohorts get glowing rings."

## 1:50 – 2:20 · Real cohorts, equal weight
**[Scroll past the archetype hero to the Olympic cohort cards.]**

> "These cohorts are real — drawn from the Kaggle 120-year Olympic dataset and a Gemini-grounded modern era supplement covering Tokyo, Beijing, and Paris. Per the hackathon's NIL rules, no individual athlete is named anywhere — every output is at the cohort level."

**[Scroll to Paralympic cohorts.]**

> "Paralympic gets equal narrative weight, equal UI prominence, equal matching algorithm. This isn't a sidebar — it's structural."

## 2:20 – 2:45 · Three uses of Gemini
**[Scroll to the "Gemini, three ways" section on the landing or call out from results.]**

> "We use Gemini three distinct ways. Build time: modern athlete biometrics fetched with Google Search grounding — only committed when sources agree. Run time, vision: optional photos read by multimodal vision. Run time, narrative: the archetype composed under a strict JSON schema, conditional language, and a hard NIL guardrail that forbids naming any individual."

## 2:45 – 3:00 · Close
**[Cut to share card or landing.]**

> "Built for Team USA x Google Cloud Hackathon, Challenge 4 — The Athlete Archetype Agent. Deployed on Cloud Run. Code is Apache 2.0. Try it at [URL]."

---

## Recording tips

- **Use a real, completed flow** — fill the form once for a clean cut, don't re-record per step.
- **Pre-load the dev server / live URL** before recording so you don't capture an initial compile or cold start.
- **Use a profile that produces a strong cohort match.** Three verified-good demo profiles:
  - **191 cm / 88 kg / age 24 / male / explosive 0.45 / reaction 4 / solo 0.3 / Green Cove Springs, FL** → archetype "Sprint-Relay Power Swimmer", top cohort: Swimming 2000s Men (39 athletes), 90% match.
  - **175 cm / 61 kg / age 25 / female / explosive 0.4 / reaction 5 / solo 0.3 / Dunellen, NJ** → strong Athletics 2010s/2020s women cohort match.
  - **142 cm / 47 kg / age 24 / female / explosive 0.2 / reaction 5 / solo 0.3 / Spring, TX** → Gymnastics cohort match.
- **Capture cursor.** It tells the eye where to look.
- **Mute system sounds.** YouTube auto-detects copyrighted music; record narration only or use license-free background audio.
- **Let the 3D constellation finish one full rotation** before scrolling — it's the wow shot.
- **Export under 50 MB if possible** — keeps upload fast.

## YouTube setup

1. Upload as **Unlisted**.
2. Title: "Team USA DNA — Team USA x Google Cloud Hackathon submission"
3. Description: paste the deployed URL + GitHub repo URL.
4. Submit the video URL on Devpost along with the deployed URL and repo.
