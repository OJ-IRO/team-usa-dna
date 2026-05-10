"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import type { ArchetypeResult, UserProfile } from "@/lib/types";

type Turn = { role: "user" | "model"; text: string };

const SUGGESTIONS = [
  "Why these cohorts and not others?",
  "What if I were 10 cm taller?",
  "Compare my Olympic and Paralympic matches.",
  "Which strength is most underdeveloped for this archetype?",
  "What does this archetype look like at peak training?",
  "Why no [favorite sport] in my matches?",
];

// Speech APIs are vendor-prefixed in some browsers; feature-detect lazily.
type AnySpeechRecognition = typeof window extends { SpeechRecognition: infer T }
  ? T
  : unknown;

function getSpeechRecognition(): AnySpeechRecognition | undefined {
  if (typeof window === "undefined") return undefined;
  const w = window as unknown as Record<string, unknown>;
  return (w.SpeechRecognition || w.webkitSpeechRecognition) as AnySpeechRecognition | undefined;
}

export default function AskAgent({
  result,
  profile,
}: {
  result: ArchetypeResult;
  profile: UserProfile;
}) {
  const [history, setHistory] = useState<Turn[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [listening, setListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  // Track whether the most recent question came in via voice — if so we'll speak the response.
  const lastWasVoiceRef = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const historyRef = useRef<Turn[]>([]);
  historyRef.current = history;

  // Detect speech support once
  useEffect(() => {
    const SR = getSpeechRecognition();
    setVoiceSupported(
      !!SR && typeof window !== "undefined" && "speechSynthesis" in window,
    );
  }, []);

  // Auto-scroll on new turn
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history.length, busy]);

  function speak(text: string) {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 1.05;
    u.pitch = 1.0;
    u.volume = 1.0;
    // Prefer a higher-quality voice if available
    const voices = window.speechSynthesis.getVoices();
    const pref =
      voices.find((v) => /Samantha|Google US English|Microsoft Aria|Microsoft Jenny/i.test(v.name)) ||
      voices.find((v) => v.lang === "en-US");
    if (pref) u.voice = pref;
    window.speechSynthesis.speak(u);
  }

  async function ask(rawQuestion: string) {
    const question = rawQuestion.trim();
    if (!question || busy) return;
    setError(null);
    setBusy(true);
    const newUserTurn: Turn = { role: "user", text: question };
    const next = [...history, newUserTurn];
    setHistory(next);
    setInput("");
    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question,
          result,
          profile,
          history,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Request failed (${res.status})`);
      }
      const data = await res.json();
      const answer: string = data.answer;
      setHistory([...next, { role: "model", text: answer }]);
      if (lastWasVoiceRef.current) {
        speak(answer);
        lastWasVoiceRef.current = false;
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setHistory(history);
    } finally {
      setBusy(false);
    }
  }

  function startListening() {
    const SR = getSpeechRecognition();
    if (!SR) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rec: any = new (SR as any)();
    rec.continuous = false;
    rec.interimResults = true;
    rec.lang = "en-US";
    let finalTranscript = "";

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rec.onresult = (event: any) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) finalTranscript += t;
        else interim += t;
      }
      setInput((finalTranscript + interim).trim());
    };
    rec.onerror = () => {
      setListening(false);
    };
    rec.onend = () => {
      setListening(false);
      const q = finalTranscript.trim();
      if (q) {
        // Voice always auto-submits when speech ends; flag so we speak the response.
        lastWasVoiceRef.current = true;
        ask(q);
      }
    };

    recognitionRef.current = rec;
    setListening(true);
    setInput("");
    rec.start();
  }

  function stopListening() {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
    setListening(false);
  }

  const showSuggestions = history.length === 0;

  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.55 }}
      className="space-y-5"
    >
      <div className="flex items-baseline gap-3">
        <span className="size-2 rounded-full mt-1.5 bg-[var(--accent-gold)]" />
        <div className="flex-1">
          <div className="text-xs uppercase tracking-[0.18em] text-[var(--accent-gold)] font-mono">
            Conversational agent · Powered by Gemini
          </div>
          <h3 className="display text-3xl sm:text-4xl font-semibold tracking-tight">
            Ask your archetype
          </h3>
        </div>
      </div>
      <p className="text-muted text-[15px] leading-relaxed max-w-3xl">
        Follow up on anything in the result. The agent stays grounded in your cohort data and won&apos;t name individual athletes — same NIL, conditional-language, and parity rules as the original analysis.{voiceSupported ? " Tap the mic to speak instead of type — the agent will answer back out loud." : ""}
      </p>

      <div className="glass glass-shine rounded-2xl p-5 sm:p-6 space-y-4">
        <div ref={scrollRef} className="space-y-3 max-h-[420px] overflow-y-auto pr-2">
          <AnimatePresence initial={false}>
            {history.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className={t.role === "user" ? "flex justify-end" : "flex justify-start"}
              >
                <div
                  className={
                    t.role === "user"
                      ? "rounded-2xl rounded-tr-sm bg-foreground text-background px-4 py-2.5 max-w-[85%] text-[15px] leading-relaxed"
                      : "rounded-2xl rounded-tl-sm bg-white/[0.04] border border-white/5 text-foreground px-4 py-2.5 max-w-[85%] text-[15px] leading-relaxed"
                  }
                >
                  {t.text}
                </div>
              </motion.div>
            ))}
            {busy && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex justify-start"
              >
                <div className="rounded-2xl rounded-tl-sm bg-white/[0.04] border border-white/5 px-4 py-3 text-sm text-muted-soft">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="size-1.5 rounded-full bg-foreground/70 animate-pulse" />
                    <span className="size-1.5 rounded-full bg-foreground/50 animate-pulse [animation-delay:160ms]" />
                    <span className="size-1.5 rounded-full bg-foreground/30 animate-pulse [animation-delay:320ms]" />
                  </span>
                </div>
              </motion.div>
            )}
            {listening && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-end"
              >
                <div className="rounded-2xl bg-[var(--accent-gold)]/15 border border-[var(--accent-gold)]/30 px-4 py-2.5 text-sm text-[var(--accent-gold)] flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-[var(--accent-gold)] animate-pulse" />
                  Listening…
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {showSuggestions && (
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => ask(s)}
                disabled={busy}
                className="px-3.5 py-1.5 rounded-full text-[12.5px] glass text-muted hover:text-foreground transition-all"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            ask(input);
          }}
          className="flex gap-2 items-end"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={listening ? "Listening…" : "Ask anything about your archetype…"}
            className="field-input flex-1"
            maxLength={500}
            disabled={busy || listening}
          />
          {voiceSupported && (
            <button
              type="button"
              onClick={listening ? stopListening : startListening}
              disabled={busy}
              aria-label={listening ? "Stop listening" : "Tap and speak"}
              title={listening ? "Stop listening" : "Tap and speak"}
              className={`h-12 w-12 shrink-0 rounded-full flex items-center justify-center transition-all ${
                listening
                  ? "bg-[var(--accent-red)] text-white animate-pulse"
                  : "bg-[var(--accent-gold)] text-black hover:scale-105"
              }`}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M12 2a3 3 0 00-3 3v7a3 3 0 006 0V5a3 3 0 00-3-3z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M19 10v2a7 7 0 01-14 0v-2M12 19v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}
          <button
            type="submit"
            disabled={busy || !input.trim() || listening}
            className="h-12 px-5 rounded-full bg-foreground text-background text-[14px] font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            {busy ? "Thinking…" : "Ask"}
          </button>
        </form>

        {error && <div className="text-sm text-accent-red">{error}</div>}
        {history.length > 0 && (
          <button
            type="button"
            onClick={() => {
              setHistory([]);
              setError(null);
              if (typeof window !== "undefined" && "speechSynthesis" in window) {
                window.speechSynthesis.cancel();
              }
            }}
            className="text-[11px] uppercase tracking-[0.18em] text-muted-soft hover:text-foreground transition"
          >
            ← Reset conversation
          </button>
        )}
      </div>
    </motion.section>
  );
}
