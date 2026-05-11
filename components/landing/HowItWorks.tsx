"use client";

import { motion } from "motion/react";

const STEPS = [
  {
    n: "01",
    title: "Tell us about your build",
    body: "Height, weight, age, activity level, hometown, plus a few preferences about how you like to train and compete.",
  },
  {
    n: "02",
    title: "Optionally add a photo",
    body: "Gemini's multimodal vision reads apparent posture and build cues — entirely optional and processed for this analysis only.",
  },
  {
    n: "03",
    title: "We match you to real cohorts",
    body: "Our matcher clusters the full Team USA Olympic + Paralympic pool by sport, era, and sex, then scores your profile against every cohort. Gemini composes an archetype narrative grounded in cohort-level statistics — never naming individuals.",
  },
];

const GEMINI_USES = [
  {
    label: "Build time",
    title: "Grounded data",
    body: "Modern athlete biometrics (Tokyo 2020, Paris 2024, Milano-Cortina 2026 — and the Paralympic catalog back to Rome 1960) are fetched from public sources by Gemini 2.5 Flash with Google Search grounding, only committed when sources agree.",
  },
  {
    label: "Run time, vision",
    title: "Multimodal read",
    body: "Optional user photos are processed by Gemini's vision capability for apparent build cues, contributing one sentence to the archetype.",
  },
  {
    label: "Run time, narrative",
    title: "Archetype narrative",
    body: "Gemini composes the archetype name and cohort-grounded narrative under a strict JSON schema, conditional-language instruction, and a hard NIL rule that forbids naming any individual athlete.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="relative w-full px-6 sm:px-8 py-20">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-end justify-between gap-6 mb-10">
          <div>
            <div className="text-xs uppercase tracking-[0.18em] text-muted-soft mb-3">How it works</div>
            <h2 className="display text-4xl sm:text-5xl font-semibold max-w-2xl">
              Grounded in real cohorts,
              <br />
              not generic predictions.
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.n}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
              className="glass glass-shine rounded-2xl p-7 relative overflow-hidden"
            >
              <div className="font-mono text-[11px] tracking-[0.2em] text-muted-soft mb-6">
                STEP {step.n}
              </div>
              <h3 className="text-xl font-semibold tracking-tight mb-3">{step.title}</h3>
              <p className="text-muted text-[15px] leading-relaxed">{step.body}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-20">
          <div className="flex items-end justify-between gap-6 mb-8">
            <div>
              <div className="text-xs uppercase tracking-[0.18em] text-muted-soft mb-3">Gemini, three ways</div>
              <h2 className="display text-3xl sm:text-4xl font-semibold tracking-tight max-w-2xl">
                Three distinct uses of Gemini —<br />
                build time, vision, narrative.
              </h2>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {GEMINI_USES.map((u, i) => (
              <motion.div
                key={u.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                className="glass glass-shine rounded-2xl p-7 relative overflow-hidden"
              >
                <div className="font-mono text-[11px] tracking-[0.2em] text-accent-gold mb-6">
                  {u.label}
                </div>
                <h3 className="text-lg font-semibold tracking-tight mb-3">{u.title}</h3>
                <p className="text-muted text-[14.5px] leading-relaxed">{u.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
