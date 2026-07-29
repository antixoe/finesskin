import ScanWorkspace from "@/components/scan-workspace";
import { getScanPageData } from "@/lib/dashboard";
import { productCategoryLabel } from "@/lib/finesskin";

export const dynamic = "force-dynamic";

export default async function ScanPage() {
  const data = await getScanPageData();

  const serializableScans =
    data.scans?.map((scan) => ({
      id: scan.id,
      source: scan.source,
      imageLabel: scan.imageLabel,
      score: scan.score,
      hydration: scan.hydration,
      redness: scan.redness,
      acne: scan.acne,
      barrier: scan.barrier,
      summary: scan.summary,
      recommendations: Array.isArray(scan.recommendations)
        ? (scan.recommendations as Array<{
            title: string;
            detail: string;
            priority: "high" | "medium" | "low";
          }>)
        : [],
      createdAt: scan.createdAt.toISOString(),
    })) ?? [];

  const products =
    data.products?.map((product) => ({
      id: product.id,
      name: product.name,
      category: productCategoryLabel[product.category],
    })) ?? [];

  const latestScan = serializableScans[0] ?? null;

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
      <section className="glass-panel rounded-[2rem] px-6 py-8">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-500">
          AI scan studio
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
          Upload a photo or use webcam capture
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
          Simulate a scan, review structured hydration and sensitivity metrics,
          and save the result into the PostgreSQL scan history table.
        </p>
      </section>

      <ScanWorkspace
        latestScan={latestScan}
        scans={serializableScans}
        products={products}
      />
    </div>
  );
}
