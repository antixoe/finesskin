"use client";

import {
  productCategoryLabel,
  productCategoryOptions,
  routineTimingLabel,
  routineTimingOptions,
} from "@/lib/finesskin";
import {
  CheckCircle2,
  Circle,
  PencilLine,
  Plus,
  Trash2,
  Sparkles,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

type SerializableRoutineItem = {
  id: string;
  title: string;
  hint: string | null;
  order: number;
  isChecked: boolean;
  product: { id: string; name: string; category: string } | null;
};

type SerializableRoutine = {
  id: string;
  name: string;
  timing: "AM" | "PM";
  streak: number;
  completedToday: boolean;
  notes: string | null;
  items: SerializableRoutineItem[];
  completions: Array<{
    id: string;
    note: string | null;
    completedAt: string;
  }>;
};

type SerializableProduct = {
  id: string;
  name: string;
  category: string;
  timing: "AM" | "PM";
  brand: string | null;
  notes: string | null;
  isActive: boolean;
};

type RoutineManagerProps = {
  routines: SerializableRoutine[];
  products: SerializableProduct[];
  completions: number;
};

const emptyProductForm = {
  name: "",
  category: "SERUM",
  timing: "AM",
  brand: "",
  notes: "",
};

function PanelTitle({
  label,
  title,
  subtitle,
}: {
  label: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-500">
        {label}
      </p>
      <h3 className="text-2xl font-semibold text-slate-900">{title}</h3>
      {subtitle ? <p className="text-sm text-slate-600">{subtitle}</p> : null}
    </div>
  );
}

export default function RoutineManager({
  routines,
  products,
  completions,
}: RoutineManagerProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [productForm, setProductForm] = useState(emptyProductForm);

  const selectedProduct = useMemo(
    () => products.find((product) => product.id === editingProductId) ?? null,
    [products, editingProductId],
  );

  const refreshAfter = (task: () => Promise<void>) => {
    startTransition(async () => {
      await task();
      router.refresh();
    });
  };

  const saveProduct = () => {
    refreshAfter(async () => {
      const method = editingProductId ? "PATCH" : "POST";
      const endpoint = editingProductId
        ? `/api/products/${editingProductId}`
        : "/api/products";

            await fetch(endpoint, {
              method,
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(productForm),
            });
      setEditingProductId(null);
      setProductForm(emptyProductForm);
    });
  };

  const deleteProduct = (id: string) => {
    refreshAfter(async () => {
      await fetch(`/api/products/${id}`, {
        method: "DELETE",
      });
    });
  };

  const toggleItem = (routineId: string, itemId: string, isChecked: boolean) => {
    refreshAfter(async () => {
      await fetch(`/api/routines/${routineId}/items/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isChecked: !isChecked }),
      });
    });
  };

  const toggleRoutine = (routineId: string, nextValue: boolean) => {
    refreshAfter(async () => {
      await fetch(`/api/routines/${routineId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completedToday: nextValue }),
      });
    });
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
      <section className="space-y-6">
        <div className="glass-panel rounded-[2rem] p-6">
          <PanelTitle
            label="Routine management"
            title="AM / PM care with streak tracking"
            subtitle="Toggle completion, add products, and keep the routine organized by time of day."
          />

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-white p-4 shadow-sm">
              <div className="text-xs uppercase tracking-[0.24em] text-slate-400">
                Active routines
              </div>
              <div className="mt-2 text-3xl font-semibold text-slate-900">
                {routines.length}
              </div>
            </div>
            <div className="rounded-2xl bg-white p-4 shadow-sm">
              <div className="text-xs uppercase tracking-[0.24em] text-slate-400">
                Completions logged
              </div>
              <div className="mt-2 text-3xl font-semibold text-slate-900">
                {completions}
              </div>
            </div>
            <div className="rounded-2xl bg-white p-4 shadow-sm">
              <div className="text-xs uppercase tracking-[0.24em] text-slate-400">
                Products in bank
              </div>
              <div className="mt-2 text-3xl font-semibold text-slate-900">
                {products.length}
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4">
          {routines.map((routine) => (
            <article
              key={routine.id}
              className="glass-panel rounded-[2rem] p-6"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="inline-flex rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">
                    {routineTimingLabel[routine.timing]}
                  </div>
                  <h4 className="mt-3 text-2xl font-semibold text-slate-900">
                    {routine.name}
                  </h4>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                    {routine.notes}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => toggleRoutine(routine.id, !routine.completedToday)}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
                    routine.completedToday
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-sky-500 text-white shadow-lg shadow-sky-200 hover:-translate-y-0.5"
                  }`}
                >
                  <CheckCircle2 className="h-4 w-4" />
                  {routine.completedToday ? "Completed" : "Mark complete"}
                </button>
              </div>

              <div className="mt-6 grid gap-3">
                {routine.items.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggleItem(routine.id, item.id, item.isChecked)}
                    className="flex w-full items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 text-left transition hover:border-sky-200"
                  >
                    {item.isChecked ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    ) : (
                      <Circle className="h-5 w-5 text-slate-300" />
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-slate-900">
                          {item.title}
                        </span>
                        {item.product ? (
                          <span className="rounded-full bg-sky-50 px-2 py-1 text-xs font-medium text-sky-700">
                            {item.product.name}
                          </span>
                        ) : null}
                      </div>
                      {item.hint ? (
                        <p className="mt-1 text-sm text-slate-500">{item.hint}</p>
                      ) : null}
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-slate-500">
                <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1">
                  <Sparkles className="h-4 w-4 text-sky-500" />
                  Streak {routine.streak} days
                </span>
                <span>{routine.completions.length} completion logs</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <aside className="space-y-6">
        <section className="glass-panel rounded-[2rem] p-6">
          <PanelTitle
            label="Products"
            title="Product compatibility bank"
            subtitle="Add, edit, or remove products and assign them to AM or PM care."
          />

          <div className="mt-6 space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="grid gap-2">
                <span className="text-sm font-medium text-slate-700">Name</span>
                <input
                  value={productForm.name}
                  onChange={(event) =>
                    setProductForm((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none ring-0 focus:border-sky-300"
                  placeholder="Hydra gel cleanser"
                />
              </label>
              <label className="grid gap-2">
                <span className="text-sm font-medium text-slate-700">Brand</span>
                <input
                  value={productForm.brand}
                  onChange={(event) =>
                    setProductForm((current) => ({
                      ...current,
                      brand: event.target.value,
                    }))
                  }
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-sky-300"
                  placeholder="Finesskin Lab"
                />
              </label>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="grid gap-2">
                <span className="text-sm font-medium text-slate-700">
                  Category
                </span>
                <select
                  value={productForm.category}
                  onChange={(event) =>
                    setProductForm((current) => ({
                      ...current,
                      category: event.target.value,
                    }))
                  }
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-sky-300"
                >
                  {productCategoryOptions.map((option) => (
                    <option key={option} value={option}>
                      {productCategoryLabel[option]}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-2">
                <span className="text-sm font-medium text-slate-700">Timing</span>
                <select
                  value={productForm.timing}
                  onChange={(event) =>
                    setProductForm((current) => ({
                      ...current,
                      timing: event.target.value,
                    }))
                  }
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-sky-300"
                >
                  {routineTimingOptions.map((option) => (
                    <option key={option} value={option}>
                      {routineTimingLabel[option]}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className="grid gap-2">
              <span className="text-sm font-medium text-slate-700">Notes</span>
              <textarea
                value={productForm.notes}
                onChange={(event) =>
                  setProductForm((current) => ({
                    ...current,
                    notes: event.target.value,
                  }))
                }
                rows={4}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-sky-300"
                placeholder="Describe how the product fits the routine."
              />
            </label>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={saveProduct}
                disabled={pending || !productForm.name.trim()}
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-sky-600 to-cyan-400 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-200 transition hover:-translate-y-0.5 disabled:opacity-70"
              >
                <Plus className="h-4 w-4" />
                {editingProductId ? "Update product" : "Add product"}
              </button>
              {selectedProduct ? (
                <button
                  type="button"
                  onClick={() => {
                    setEditingProductId(null);
                    setProductForm(emptyProductForm);
                  }}
                  className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white px-5 py-3 text-sm font-semibold text-sky-700"
                >
                  New product
                </button>
              ) : null}
            </div>
          </div>
        </section>

        <section className="glass-panel rounded-[2rem] p-6">
          <PanelTitle
            label="Inventory"
            title="Current product list"
            subtitle="Use the editor above to change a product, then refresh the data."
          />

          <div className="mt-5 space-y-3">
            {products.map((product) => (
              <article
                key={product.id}
                className="rounded-2xl border border-slate-200 bg-white p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="font-semibold text-slate-900">
                      {product.name}
                    </h4>
                    <p className="mt-1 text-sm text-slate-500">
                      {productCategoryLabel[product.category as keyof typeof productCategoryLabel] ||
                        product.category}{" "}
                      · {routineTimingLabel[product.timing]} ·{" "}
                      {product.brand || "No brand"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingProductId(product.id);
                        setProductForm({
                          name: product.name,
                          category: product.category,
                          timing: product.timing,
                          brand: product.brand ?? "",
                          notes: product.notes ?? "",
                        });
                      }}
                      className="rounded-full border border-sky-100 bg-sky-50 px-3 py-2 text-sky-700"
                    >
                      <PencilLine className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteProduct(product.id)}
                      className="rounded-full border border-rose-100 bg-rose-50 px-3 py-2 text-rose-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                {product.notes ? (
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    {product.notes}
                  </p>
                ) : null}
              </article>
            ))}
          </div>
        </section>
      </aside>
    </div>
  );
}
