import type { ProductCategory, RoutineTiming, ScanSource } from "@/generated/prisma/client";
import {
  Activity,
  BellRing,
  ChartNoAxesCombined,
  Droplets,
  Flame,
  ScanFace,
  Sparkles,
  TimerReset,
} from "lucide-react";

export const DEMO_USER_EMAIL = "demo@finesskin.ai";

export const navItems = [
  { href: "/", label: "Home" },
  { href: "/scan", label: "Skin Scan" },
  { href: "/routines", label: "Routines" },
] as const;

export const featureCards = [
  {
    icon: ScanFace,
    title: "AI Skin Analysis",
    description:
      "Capture or upload skin photos and get an actionable assessment with structured metrics.",
  },
  {
    icon: TimerReset,
    title: "Daily Care Tracker",
    description:
      "Track AM and PM routines with streaks, completion toggles, and progress history.",
  },
  {
    icon: BellRing,
    title: "Product Compatibility",
    description:
      "Organize cleanser, toner, serum, moisturizer, and sunscreen routines by category.",
  },
  {
    icon: ChartNoAxesCombined,
    title: "Progress Journal",
    description:
      "Store scan history and routine completion events for long-term skincare insights.",
  },
] as const;

export const skinMetricCards = [
  { key: "hydration", label: "Hydration", icon: Droplets },
  { key: "redness", label: "Redness / Sensitivity", icon: Flame },
  { key: "acne", label: "Acne / Blemishes", icon: Sparkles },
  { key: "barrier", label: "Barrier Health", icon: Activity },
] as const;

export const routineTimingLabel: Record<RoutineTiming, string> = {
  AM: "Morning",
  PM: "Evening",
};

export const productCategoryLabel: Record<ProductCategory, string> = {
  CLEANSER: "Cleanser",
  TONER: "Toner",
  SERUM: "Serum",
  MOISTURIZER: "Moisturizer",
  SUNSCREEN: "Sunscreen",
  TREATMENT: "Treatment",
  OTHER: "Other",
};

export const sourceLabel: Record<ScanSource, string> = {
  UPLOAD: "Upload",
  CAMERA: "Camera",
};

export const productCategoryOptions = [
  "CLEANSER",
  "TONER",
  "SERUM",
  "MOISTURIZER",
  "SUNSCREEN",
  "TREATMENT",
  "OTHER",
] as const satisfies readonly ProductCategory[];

export const routineTimingOptions = ["AM", "PM"] as const satisfies readonly RoutineTiming[];

export const scanSourceOptions = ["UPLOAD", "CAMERA"] as const satisfies readonly ScanSource[];

export const skinGoals = [
  {
    title: "Hydration",
    accent: "from-sky-400 to-cyan-300",
    note: "Optimize moisture retention and prevent tight, flaky skin.",
  },
  {
    title: "Redness",
    accent: "from-blue-400 to-sky-300",
    note: "Calm visible irritation and reduce sensitivity triggers.",
  },
  {
    title: "Barrier",
    accent: "from-indigo-400 to-slate-300",
    note: "Support lipids and protective barrier recovery.",
  },
  {
    title: "Acne",
    accent: "from-cyan-400 to-emerald-300",
    note: "Minimize congestion and maintain a consistent routine.",
  },
] as const;
