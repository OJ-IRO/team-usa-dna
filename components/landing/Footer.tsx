export default function Footer() {
  return (
    <footer className="border-t border-white/5 mt-12">
      <div className="max-w-6xl mx-auto px-6 sm:px-8 py-10 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center text-sm text-muted-soft">
        <div className="flex items-center gap-3">
          <div className="size-7 rounded-lg bg-gradient-to-br from-[var(--olympic)] via-[var(--accent-gold)] to-[var(--paralympic)]" />
          <span className="text-foreground">Team USA DNA</span>
          <span>·</span>
          <span>A fan-facing AI tool</span>
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-1">
          <span>Built for Team USA x Google Cloud Hackathon</span>
          <span>·</span>
          <span>Powered by Gemini</span>
          <span>·</span>
          <span>Cloud Run</span>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-6 sm:px-8 pb-10 text-xs text-muted-soft leading-relaxed">
        Conditional language only. Sport recommendations describe historical patterns and are not predictions
        of athletic outcomes. Olympic data sourced from a public 120-year compilation; Paralympic data is a
        curated set. This tool is not affiliated with the IOC, IPC, or USOPC.
      </div>
    </footer>
  );
}
