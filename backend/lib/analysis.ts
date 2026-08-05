import type { Prisma } from "@/generated/prisma/client";

export type AnalysisInput = {
  hydration: number;
  redness: number;
  acne: number;
  barrier: number;
};

export type SkinRecommendation = {
  title: string;
  detail: string;
  priority: "high" | "medium" | "low";
};

export type SkinAnalysis = AnalysisInput & {
  score: number;
  summary: string;
  recommendations: SkinRecommendation[];
};

function clampMetric(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function buildSkinAnalysis(input: AnalysisInput): SkinAnalysis {
  const hydration = clampMetric(input.hydration);
  const redness = clampMetric(input.redness);
  const acne = clampMetric(input.acne);
  const barrier = clampMetric(input.barrier);

  const score = clampMetric(
    Math.round(
      (hydration + barrier + (100 - redness) + (100 - acne)) / 4,
    ),
  );

  const recommendations: SkinRecommendation[] = [
    hydration < 60 && {
      title: "Layer a humectant serum",
      detail:
        "Use hyaluronic acid or glycerin before moisturizer to boost water retention.",
      priority: "high",
    },
    redness > 45 && {
      title: "Reduce active exfoliation",
      detail:
        "Pause strong acids for a few days and lean into barrier-first ingredients.",
      priority: "high",
    },
    acne > 50 && {
      title: "Use a lightweight treatment",
      detail:
        "Consider a salicylic acid or niacinamide step to help control congestion.",
      priority: "medium",
    },
    barrier < 65 && {
      title: "Prioritize ceramides",
      detail:
        "Choose a moisturizer rich in ceramides, cholesterol, and fatty acids.",
      priority: "medium",
    },
    score >= 80 && {
      title: "Maintain your routine",
      detail:
        "The skin profile is stable. Keep the AM/PM cadence and avoid unnecessary changes.",
      priority: "low",
    },
  ].filter(Boolean) as SkinRecommendation[];

  const summary =
    score >= 80
      ? "Skin is balanced with a strong barrier and low irritation signals."
      : score >= 60
        ? "Skin is showing moderate concern signals. Focus on hydration and consistency."
        : "Skin needs a calmer routine with more hydration, barrier support, and lower irritation.";

  return {
    hydration,
    redness,
    acne,
    barrier,
    score,
    summary,
    recommendations,
  };
}

export function recommendationsToJson(
  recommendations: SkinRecommendation[],
): Prisma.InputJsonValue {
  return recommendations;
}

