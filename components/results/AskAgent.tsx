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
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new turn
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history.length, busy]);

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
      setHistory([...next, { role: "model", text: data.answer }]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      // Roll back the user turn so it doesn't sit dangling.
      setHistory(history);
    } finally {
      setBusy(false);
    }
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
          <h3 className="display text-3xl sm:text-4xl font-semibold tracking-tight">Ask your archetype</h3>
        </div>
      </div>
      <p className="text-muted text-[15px] leading-relaxed max-w-3xl">
        Follow up on anything in the result. The agent stays grounded in your cohort data and won&apos;t name individual athletes — same NIL, conditional-language, and parity rules as the original analysis.
      </p>

      <div className="glass glass-shine rounded-2xl p-5 sm:p-6 space-y-4">
        {/* Conversation */}
        <div
          ref={scrollRef}
          className="space-y-3 max-h-[420px] overflow-y-auto pr-2"
        >
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
          </AnimatePresence>
        </div>

        {/* Suggestion chips (first turn only) */}
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

        {/* Input */}
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
            placeholder="Ask anything about your archetype…"
            className="field-input flex-1"
            maxLength={500}
            disabled={busy}
          />
          <button
            type="submit"
            disabled={busy || !input.trim()}
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
