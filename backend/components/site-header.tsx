import Link from "next/link";
import { ChevronDown, Sparkles } from "lucide-react";
import { navItems } from "@/lib/finesskin";

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/60 bg-white/70 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="group flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-cyan-300 text-white shadow-lg shadow-sky-200">
            <Sparkles className="h-5 w-5" />
          </span>
          <span>
            <span className="block text-sm font-semibold uppercase tracking-[0.28em] text-slate-400">
              Finesskin
            </span>
            <span className="block text-sm text-slate-500">
              AI skincare platform
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 rounded-full border border-sky-100 bg-sky-50/80 p-1 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-white hover:text-sky-700"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <button className="inline-flex items-center gap-2 rounded-full border border-sky-100 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-sky-100 to-cyan-50 text-sky-700">
            FK
          </span>
          <span className="hidden sm:inline">Profile</span>
          <ChevronDown className="h-4 w-4 text-slate-400" />
        </button>
      </div>
    </header>
  );
}
