import RoutineManager from "@/components/routine-manager";
import { getRoutinePageData } from "@/lib/dashboard";
import { productCategoryLabel } from "@/lib/finesskin";

export const dynamic = "force-dynamic";

export default async function RoutinesPage() {
  const data = await getRoutinePageData();

  const routines =
    data.routines?.map((routine) => ({
      id: routine.id,
      name: routine.name,
      timing: routine.timing,
      streak: routine.streak,
      completedToday: routine.completedToday,
      notes: routine.notes,
      items: routine.items.map((item) => ({
        id: item.id,
        title: item.title,
        hint: item.hint,
        order: item.order,
        isChecked: item.isChecked,
        product: item.product
          ? {
              id: item.product.id,
              name: item.product.name,
              category: productCategoryLabel[item.product.category],
            }
          : null,
      })),
      completions: routine.completions.map((completion) => ({
        id: completion.id,
        note: completion.note,
        completedAt: completion.completedAt.toISOString(),
      })),
    })) ?? [];

  const products =
    data.products?.map((product) => ({
      id: product.id,
      name: product.name,
      category: product.category,
      timing: product.timing,
      brand: product.brand,
      notes: product.notes,
      isActive: product.isActive,
    })) ?? [];

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
      <section className="glass-panel rounded-[2rem] px-6 py-8">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-500">
          Routine management
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
          AM and PM care you can track daily
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
          Build skincare rituals, toggle habits, edit product assignments, and
          store progress in the database with every action.
        </p>
      </section>

      <RoutineManager
        routines={routines}
        products={products}
        completions={data.completions}
      />
    </div>
  );
}
