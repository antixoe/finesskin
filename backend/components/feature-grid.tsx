import { featureCards } from "@/lib/finesskin";

export default function FeatureGrid() {
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {featureCards.map((feature) => {
        const Icon = feature.icon;

        return (
          <article
            key={feature.title}
            className="glass-panel rounded-2xl p-5 transition duration-300 hover:-translate-y-1 hover:shadow-[0_28px_80px_rgba(14,165,233,0.12)]"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-cyan-300 text-white shadow-lg shadow-sky-100">
              <Icon className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-slate-900">
              {feature.title}
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {feature.description}
            </p>
          </article>
        );
      })}
    </section>
  );
}
