import type {
  AnalysisResult,
  ProductCategory,
  RoutineTiming,
  ScanSource,
} from './finesskin.models';

export const routineTimingLabel: Record<RoutineTiming, string> = {
  AM: 'Morning',
  PM: 'Evening',
};

export const productCategoryLabel: Record<ProductCategory, string> = {
  CLEANSER: 'Cleanser',
  TONER: 'Toner',
  SERUM: 'Serum',
  MOISTURIZER: 'Moisturizer',
  SUNSCREEN: 'Sunscreen',
  TREATMENT: 'Treatment',
  OTHER: 'Other',
};

export const sourceLabel: Record<ScanSource, string> = {
  UPLOAD: 'Upload',
  CAMERA: 'Camera',
};

export const productCategoryOptions: ProductCategory[] = [
  'CLEANSER',
  'TONER',
  'SERUM',
  'MOISTURIZER',
  'SUNSCREEN',
  'TREATMENT',
  'OTHER',
];

export const routineTimingOptions: RoutineTiming[] = ['AM', 'PM'];
export const scanSourceOptions: ScanSource[] = ['UPLOAD', 'CAMERA'];

export const featureCards = [
  {
    eyebrow: 'Step 1',
    title: 'Read Your Skin',
    description:
      'Upload a skin photo and get a clearer reading of hydration, redness, acne, and barrier condition.',
  },
  {
    eyebrow: 'Step 2',
    title: 'Track Your Routine',
    description:
      'Keep AM and PM steps in one place so daily care feels easier to follow and maintain.',
  },
  {
    eyebrow: 'Step 3',
    title: 'Build Better Habits',
    description:
      'Stay consistent with cleanser, toner, serum, moisturizer, and sunscreen through a simpler habit flow.',
  },
  {
    eyebrow: 'Step 4',
    title: 'See Progress',
    description:
      'Review routine history and skin changes over time so progress is easier to understand.',
  },
];

export const skinMetricCards: Array<{
  key: keyof Pick<AnalysisResult, 'hydration' | 'redness' | 'acne' | 'barrier'>;
  label: string;
}> = [
  { key: 'hydration', label: 'Hydration' },
  { key: 'redness', label: 'Redness / Sensitivity' },
  { key: 'acne', label: 'Acne / Blemishes' },
  { key: 'barrier', label: 'Barrier Health' },
];

export const skinGoals = [
  {
    title: 'Hydration',
    note: 'Optimize moisture retention and prevent tight, flaky skin.',
  },
  {
    title: 'Redness',
    note: 'Calm visible irritation and reduce sensitivity triggers.',
  },
  {
    title: 'Barrier',
    note: 'Support lipids and protective barrier recovery.',
  },
  {
    title: 'Acne',
    note: 'Minimize congestion and maintain a consistent routine.',
  },
];
