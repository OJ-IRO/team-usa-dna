import Link from "next/link";

export default function Nav() {
  return (
    <header className="fixed top-0 inset-x-0 z-40">
      <div className="mx-auto max-w-6xl px-6 sm:px-8 pt-5">
        <div className="glass rounded-2xl px-4 py-2.5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="size-6 rounded-lg bg-gradient-to-br from-[var(--olympic)] via-[var(--accent-gold)] to-[var(--paralympic)]" />
            <span className="font-semibold tracking-tight text-[15px]">Team USA DNA</span>
          </Link>
          <nav className="hidden sm:flex items-center gap-1 text-[13.5px] text-muted">
            <Link href="/#how-it-works" className="px-3 py-1.5 rounded-lg hover:text-foreground hover:bg-white/[0.06] transition">
              How it works
            </Link>
            <Link href="/onboarding" className="px-3 py-1.5 rounded-lg hover:text-foreground hover:bg-white/[0.06] transition">
              Try it
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
