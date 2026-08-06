import type {
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

export const waterGoalGlasses = 8;

export const habitEmojiOptions = [
  '💧',
  '🌞',
  '😴',
  '🧴',
  '🏃',
  '🥗',
  '📖',
  '🧘',
  '💊',
  '🪞',
] as const;

export const moodOptions = [
  { value: 'great', emoji: '😄', label: 'Great' },
  { value: 'good', emoji: '🙂', label: 'Good' },
  { value: 'okay', emoji: '😐', label: 'Okay' },
  { value: 'low', emoji: '😕', label: 'Low' },
  { value: 'bad', emoji: '😔', label: 'Bad' },
] as const;

export const weekdayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'] as const;

export const weekdayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

export const habitScheduleOptions = [
  { value: 'daily', label: 'Every day', description: 'Shows up in your dashboard every single day.' },
  { value: 'weekly', label: 'Specific weekdays', description: 'Only on the days of the week you pick.' },
  { value: 'dates', label: 'Specific dates', description: 'Only on the exact dates you choose.' },
] as const;

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
