import Link from "next/link";
import { ArrowRight, ScanFace, Sparkles } from "lucide-react";

type HeroSectionProps = {
  title: string;
  subtitle: string;
};

export default function HeroSection({ title, subtitle }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-sky-100 bg-gradient-to-br from-white via-sky-50 to-cyan-100 px-6 py-10 shadow-[0_25px_70px_rgba(14,165,233,0.15)] sm:px-10 sm:py-14">
      <div className="absolute right-6 top-6 flex h-20 w-20 items-center justify-center rounded-full bg-white/70 shadow-lg shadow-sky-200/50">
        <Sparkles className="h-8 w-8 text-sky-500" />
      </div>
      <div className="absolute -left-10 bottom-0 h-40 w-40 rounded-full bg-sky-200/50 blur-3xl" />

      <div className="relative grid gap-8 lg:grid-cols-[1.4fr_0.9fr] lg:items-center">
        <div className="space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-sky-700">
            <ScanFace className="h-4 w-4" />
            Smart AI skincare
          </span>
          <div className="space-y-4">
            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              {title}
            </h1>
            <p className="max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
              {subtitle}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/scan"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-sky-600 to-cyan-400 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-200 transition hover:-translate-y-0.5 hover:shadow-xl"
            >
              Start AI Skin Scan
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/routines"
              className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white/80 px-6 py-3 text-sm font-semibold text-sky-700 transition hover:bg-white"
            >
              Create Routine
            </Link>
          </div>
        </div>

        <div className="glass-panel rounded-[1.75rem] p-5">
          <div className="rounded-[1.5rem] border border-white/70 bg-white/85 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-500">
              Live Snapshot
            </p>
            <div className="mt-5 grid gap-4">
              <div className="rounded-2xl bg-sky-50 p-4">
                <div className="text-sm text-slate-500">Skin score</div>
                <div className="mt-2 text-4xl font-semibold text-slate-900">
                  88
                  <span className="text-lg font-medium text-slate-400">/100</span>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  ["Hydration", "High"],
                  ["Barrier", "Strong"],
                  ["Redness", "Low"],
                  ["Acne", "Controlled"],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-2xl border border-sky-100 bg-white p-3">
                    <div className="text-xs uppercase tracking-[0.2em] text-slate-400">
                      {label}
                    </div>
                    <div className="mt-2 text-sm font-semibold text-slate-900">
                      {value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
