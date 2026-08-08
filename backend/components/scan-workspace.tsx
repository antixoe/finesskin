"use client";

import { buildSkinAnalysis } from "@/lib/analysis";
import {
  scanSourceOptions,
  skinMetricCards,
  sourceLabel,
} from "@/lib/finesskin";
import {
  Camera,
  ChevronRight,
  Sparkles,
  Upload,
  WandSparkles,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

type SerializableScan = {
  id: string;
  source: "UPLOAD" | "CAMERA";
  imageLabel: string | null;
  score: number;
  hydration: number;
  redness: number;
  acne: number;
  barrier: number;
  summary: string;
  recommendations: Array<{
    title: string;
    detail: string;
    priority: "high" | "medium" | "low";
  }>;
  createdAt: string;
};

type ScanWorkspaceProps = {
  latestScan: SerializableScan | null;
  scans: SerializableScan[];
  products: Array<{ id: string; name: string; category: string }>;
};

const initialAnalysis = buildSkinAnalysis({
  hydration: 74,
  redness: 22,
  acne: 28,
  barrier: 81,
});

function MetricSlider({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (next: number) => void;
}) {
  return (
    <label className="grid gap-2 rounded-2xl border border-sky-100 bg-white/85 p-4">
      <div className="flex items-center justify-between text-sm font-medium text-slate-700">
        <span>{label}</span>
        <span className="text-sky-700">{value}</span>
      </div>
      <input
        type="range"
        min="0"
        max="100"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-sky-100 accent-sky-500"
      />
    </label>
  );
}

export default function ScanWorkspace({
  latestScan,
  scans,
  products,
}: ScanWorkspaceProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [source, setSource] = useState<"UPLOAD" | "CAMERA">("UPLOAD");
  const [imageLabel, setImageLabel] = useState("demo-scan.jpg");
  const [hydration, setHydration] = useState(initialAnalysis.hydration);
  const [redness, setRedness] = useState(initialAnalysis.redness);
  const [acne, setAcne] = useState(initialAnalysis.acne);
  const [barrier, setBarrier] = useState(initialAnalysis.barrier);

  const analysis = useMemo(
    () => buildSkinAnalysis({ hydration, redness, acne, barrier }),
    [hydration, redness, acne, barrier],
  );

  const submitAnalysis = () => {
    startTransition(async () => {
      await fetch("/api/scans", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          source,
          imageLabel,
          ...analysis,
        }),
      });
      router.refresh();
    });
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <section className="glass-panel rounded-[2rem] p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-500">
              AI Skin Analysis
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900">
              Upload, capture, or simulate a scan
            </h2>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-100 bg-white px-4 py-2 text-sm font-medium text-slate-600">
            <Sparkles className="h-4 w-4 text-sky-500" />
            Demo analysis engine
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="space-y-4">
            <div className="rounded-[1.5rem] border border-dashed border-sky-200 bg-gradient-to-br from-white to-sky-50 p-5">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Upload className="h-4 w-4 text-sky-600" />
                Upload or webcam capture
              </div>
              <label className="mt-4 block cursor-pointer rounded-2xl border border-sky-100 bg-white px-4 py-5 text-center">
                <input
                  type="file"
                  accept="image/*"
                  capture={source === "CAMERA" ? "environment" : undefined}
                  className="hidden"
                  onChange={(event) =>
                    setImageLabel(event.target.files?.[0]?.name || imageLabel)
                  }
                />
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-50 text-sky-600">
                  <Camera className="h-6 w-6" />
                </div>
                <p className="mt-3 text-sm font-medium text-slate-800">
                  {imageLabel}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Drop a skin photo or use the camera capture mode.
                </p>
              </label>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {scanSourceOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setSource(option)}
                  className={`rounded-2xl border px-4 py-3 text-left transition ${
                    source === option
                      ? "border-sky-300 bg-sky-50 text-sky-700"
                      : "border-slate-200 bg-white text-slate-600 hover:border-sky-200"
                  }`}
                >
                  <div className="text-sm font-semibold">
                    {sourceLabel[option]}
                  </div>
                  <div className="mt-1 text-xs">
                    {option === "UPLOAD"
                      ? "Use an existing skin photo."
                      : "Capture live with the device camera."}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <MetricSlider
                label="Hydration"
                value={hydration}
                onChange={setHydration}
              />
              <MetricSlider
                label="Redness"
                value={redness}
                onChange={setRedness}
              />
              <MetricSlider label="Acne" value={acne} onChange={setAcne} />
              <MetricSlider
                label="Barrier"
                value={barrier}
                onChange={setBarrier}
              />
            </div>

            <div className="rounded-[1.5rem] bg-slate-950 p-5 text-white shadow-xl shadow-slate-900/20">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-sky-300">
                    AI result
                  </p>
                  <h3 className="mt-2 text-4xl font-semibold">
                    {analysis.score}
                    <span className="text-base font-medium text-slate-400">
                      /100
                    </span>
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={submitAnalysis}
                  disabled={pending}
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-sky-500 to-cyan-300 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:opacity-95 disabled:opacity-70"
                >
                  <WandSparkles className="h-4 w-4" />
                  {pending ? "Saving..." : "Run AI Analysis"}
                </button>
              </div>
              <p className="mt-4 text-sm leading-6 text-slate-300">
                {analysis.summary}
              </p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {skinMetricCards.map((metric) => (
                  <div
                    key={metric.key}
                    className="rounded-2xl border border-white/10 bg-white/5 p-3"
                  >
                    <div className="text-xs uppercase tracking-[0.22em] text-slate-400">
                      {metric.label}
                    </div>
                    <div className="mt-2 text-xl font-semibold">
                      {analysis[metric.key]}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <aside className="space-y-6">
        <section className="glass-panel rounded-[2rem] p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-500">
                Recommendations
              </p>
              <h3 className="mt-2 text-xl font-semibold text-slate-900">
                Personalized skincare guidance
              </h3>
            </div>
          </div>
          <div className="mt-5 space-y-3">
            {analysis.recommendations.map((item) => (
              <article
                key={item.title}
                className="rounded-2xl border border-sky-100 bg-white p-4 shadow-sm"
              >
                <div className="flex items-center justify-between gap-3">
                  <h4 className="font-semibold text-slate-900">{item.title}</h4>
                  <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-sky-600">
                    {item.priority}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {item.detail}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="glass-panel rounded-[2rem] p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-500">
                Product match
              </p>
              <h3 className="mt-2 text-xl font-semibold text-slate-900">
                Connected product bank
              </h3>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {products.length ? (
              products.map((product) => (
                <span
                  key={product.id}
                  className="rounded-full border border-sky-100 bg-white px-3 py-2 text-sm text-slate-700"
                >
                  {product.name} · {product.category}
                </span>
              ))
            ) : (
              <p className="text-sm text-slate-500">
                Add products in the routine manager to connect them here.
              </p>
            )}
          </div>
        </section>

        <section className="glass-panel rounded-[2rem] p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-500">
                Scan history
              </p>
              <h3 className="mt-2 text-xl font-semibold text-slate-900">
                Recent analysis runs
              </h3>
            </div>
            <ChevronRight className="h-5 w-5 text-slate-400" />
          </div>
          <div className="mt-5 space-y-3">
            {(scans.length ? scans : latestScan ? [latestScan] : []).map(
              (scan) => (
                <article
                  key={scan.id}
                  className="rounded-2xl border border-slate-200 bg-white p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-slate-900">
                        {scan.imageLabel || "Skin scan"}
                      </div>
                      <div className="text-xs uppercase tracking-[0.2em] text-slate-400">
                        {sourceLabel[scan.source]} · {scan.createdAt}
                      </div>
                    </div>
                    <span className="rounded-full bg-sky-50 px-3 py-1 text-sm font-semibold text-sky-700">
                      {scan.score}/100
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {scan.summary}
                  </p>
                </article>
              ),
            )}
          </div>
        </section>
      </aside>
    </div>
  );
}
