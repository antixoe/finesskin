export type RoutineTiming = 'AM' | 'PM';
export type ProductCategory =
  | 'CLEANSER'
  | 'TONER'
  | 'SERUM'
  | 'MOISTURIZER'
  | 'SUNSCREEN'
  | 'TREATMENT'
  | 'OTHER';
export type ScanSource = 'UPLOAD' | 'CAMERA';
export type RecommendationPriority = 'high' | 'medium' | 'low';

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  timing: RoutineTiming;
  brand: string | null;
  notes: string | null;
  isActive: boolean;
}

export interface RoutineItem {
  id: string;
  title: string;
  hint: string | null;
  order: number;
  isChecked: boolean;
  productId?: string | null;
  product: {
    id: string;
    name: string;
    category: ProductCategory | string;
  } | null;
}

export interface RoutineCompletion {
  id: string;
  note: string | null;
  completedAt: string;
}

export interface Routine {
  id: string;
  name: string;
  timing: RoutineTiming;
  streak: number;
  completedToday: boolean;
  notes: string | null;
  items: RoutineItem[];
  completions: RoutineCompletion[];
}

export interface SkinRecommendation {
  title: string;
  detail: string;
  priority: RecommendationPriority;
}

export interface SkinScan {
  id: string;
  source: ScanSource;
  imageLabel: string | null;
  score: number;
  hydration: number;
  redness: number;
  acne: number;
  barrier: number;
  summary: string;
  recommendations: SkinRecommendation[];
  createdAt: string;
}

export interface ProductResponse {
  products: Product[];
}

export interface RoutineResponse {
  routines: Routine[];
}

export interface ScanResponse {
  scans: SkinScan[];
}

export interface ProductPayload {
  name: string;
  category: ProductCategory;
  timing: RoutineTiming;
  brand: string;
  notes: string;
}

export interface AnalysisInput {
  hydration: number;
  redness: number;
  acne: number;
  barrier: number;
}

export interface AnalysisResult extends AnalysisInput {
  score: number;
  summary: string;
  recommendations: SkinRecommendation[];
}
