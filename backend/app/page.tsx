import FeatureGrid from "@/components/feature-grid";
import HeroSection from "@/components/hero-section";
import { getHomeData } from "@/lib/dashboard";
import {
  productCategoryLabel,
  routineTimingLabel,
  skinMetricCards,
  skinGoals,
  sourceLabel,
} from "@/lib/finesskin";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const data = await getHomeData();
  const latestScan = data?.scans[0]
    ? {
        ...data.scans[0],
        createdAt: data.scans[0].createdAt.toLocaleString(),
      }
    : null;
  const activeRoutines = data?.routines ?? [];

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
      <HeroSection
        title="Finesskin - Smart AI Skincare & Routine Management"
        subtitle="A modern skincare platform that combines AI-style skin analysis, daily care tracking, product compatibility, and a progress journal in one calm, clinical interface."
      />

      <FeatureGrid />

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <article className="glass-panel rounded-[2rem] p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-500">
                Latest analysis
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900">
                AI skin score dashboard
              </h2>
            </div>
            <Link
              href="/scan"
              className="rounded-full border border-sky-100 bg-white px-4 py-2 text-sm font-semibold text-sky-700"
            >
              Open scan studio
            </Link>
          </div>

          {latestScan ? (
            <div className="mt-6 grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
              <div className="rounded-[1.5rem] bg-slate-950 p-6 text-white">
                <p className="text-xs uppercase tracking-[0.3em] text-sky-300">
                  Overall score
                </p>
                <div className="mt-4 text-5xl font-semibold">
                  {latestScan.score}
                  <span className="text-lg font-medium text-slate-400">
                    /100
                  </span>
                </div>
                <p className="mt-4 text-sm leading-6 text-slate-300">
                  {latestScan.summary}
                </p>
                <p className="mt-5 text-xs uppercase tracking-[0.2em] text-slate-500">
                  {sourceLabel[latestScan.source]} · {latestScan.createdAt}
                </p>
              </div>

              <div className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  {skinMetricCards.map((metric) => (
                    <div
                      key={metric.key}
                      className="rounded-2xl border border-sky-100 bg-white p-4"
                    >
                      <div className="text-xs uppercase tracking-[0.2em] text-slate-400">
                        {metric.label}
                      </div>
                      <div className="mt-2 text-2xl font-semibold text-slate-900">
                        {latestScan[metric.key]}%
                      </div>
                    </div>
                  ))}
                </div>

                <div className="rounded-2xl border border-sky-100 bg-white p-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-slate-400">
                    Recommendations
                  </div>
                  <div className="mt-3 grid gap-3">
                    {Array.isArray(latestScan.recommendations)
                      ? (latestScan.recommendations as Array<{
                          title: string;
                          detail: string;
                          priority: string;
                        }>).map((recommendation) => (
                          <div
                            key={recommendation.title}
                            className="rounded-2xl bg-sky-50 p-3"
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div className="font-semibold text-slate-900">
                                {recommendation.title}
                              </div>
                              <span className="text-xs uppercase tracking-[0.2em] text-sky-600">
                                {recommendation.priority}
                              </span>
                            </div>
                            <p className="mt-1 text-sm leading-6 text-slate-600">
                              {recommendation.detail}
                            </p>
                          </div>
                        ))
                      : null}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-6 rounded-2xl border border-dashed border-sky-200 bg-white/80 p-6 text-sm text-slate-500">
              No scans yet. Go to the scan studio to create the first analysis.
            </div>
          )}
        </article>

        <aside className="space-y-6">
          <article className="glass-panel rounded-[2rem] p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-500">
              Routine snapshot
            </p>
            <div className="mt-3 flex items-end justify-between gap-4">
              <div>
                <div className="text-4xl font-semibold text-slate-900">
                  {activeRoutines.length}
                </div>
                <div className="text-sm text-slate-500">
                  AM / PM routines in your stack
                </div>
              </div>
              <Link
                href="/routines"
                className="rounded-full bg-gradient-to-r from-sky-600 to-cyan-400 px-4 py-2 text-sm font-semibold text-white"
              >
                Manage routines
              </Link>
            </div>
            <div className="mt-5 grid gap-3">
              {activeRoutines.map((routine) => (
                <div
                  key={routine.id}
                  className="rounded-2xl border border-sky-100 bg-white p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="font-semibold text-slate-900">
                        {routine.name}
                      </div>
                      <div className="text-sm text-slate-500">
                        {routineTimingLabel[routine.timing]}
                      </div>
                    </div>
                    <span className="rounded-full bg-sky-50 px-3 py-1 text-sm font-semibold text-sky-700">
                      {routine.streak} day streak
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="glass-panel rounded-[2rem] p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-500">
              Skin goals
            </p>
            <div className="mt-4 grid gap-3">
              {skinGoals.map((goal) => (
                <div
                  key={goal.title}
                  className={`rounded-2xl bg-gradient-to-r ${goal.accent} p-[1px]`}
                >
                  <div className="rounded-2xl bg-white p-4">
                    <div className="font-semibold text-slate-900">
                      {goal.title}
                    </div>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      {goal.note}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </article>
        </aside>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <article className="glass-panel rounded-[2rem] p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-500">
            Product library
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {(data?.products ?? []).map((product) => (
              <div
                key={product.id}
                className="rounded-2xl border border-sky-100 bg-white p-4"
              >
                <div className="text-xs uppercase tracking-[0.2em] text-slate-400">
                  {productCategoryLabel[product.category]}
                </div>
                <div className="mt-2 font-semibold text-slate-900">
                  {product.name}
                </div>
                <p className="mt-1 text-sm text-slate-500">
                  {product.brand || "No brand"} · {routineTimingLabel[product.timing]}
                </p>
              </div>
            ))}
          </div>
        </article>

        <article className="glass-panel rounded-[2rem] p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-500">
            Progress journal
          </p>
          <div className="mt-4 space-y-3">
            {(data?.routines ?? []).flatMap((routine) =>
              routine.completions.map((completion) => (
                <div
                  key={completion.id}
                  className="rounded-2xl border border-sky-100 bg-white p-4"
                >
                  <div className="font-semibold text-slate-900">
                    {routine.name}
                  </div>
                  <p className="mt-1 text-sm text-slate-500">
                    {completion.note || "Routine completed"} ·{" "}
                    {new Date(completion.completedAt).toLocaleString()}
                  </p>
                </div>
              )),
            )}
          </div>
        </article>
      </section>
    </div>
  );
}
