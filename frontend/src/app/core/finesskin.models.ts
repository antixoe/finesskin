export type UserRole = 'ADMIN' | 'CUSTOMER';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl: string | null;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export interface AdminStats {
  users: number;
  products: number;
  routines: number;
  scans: number;
  completions: number;
}

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

// ---- Admin panel models ----

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
  _count: {
    products: number;
    routines: number;
    scans: number;
  };
}

export interface AdminProduct extends Product {
  userId: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export interface AdminRoutine {
  id: string;
  userId: string;
  name: string;
  timing: RoutineTiming;
  streak: number;
  completedToday: boolean;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  _count: {
    items: number;
    completions: number;
  };
}

export interface AdminScan extends SkinScan {
  userId: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export interface PlatformSettings {
  platformName: string;
  platformTagline: string;
  supportEmail: string;
  allowSignups: boolean;
  maintenanceMode: boolean;
}

export interface AdminUsersResponse {
  users: AdminUser[];
}

export interface AdminProductsResponse {
  products: AdminProduct[];
}

export interface AdminRoutinesResponse {
  routines: AdminRoutine[];
}

export interface AdminScansResponse {
  scans: AdminScan[];
}

export interface AdminSettingsResponse {
  settings: PlatformSettings;
}

export interface AdminUserPayload {
  name: string;
  email: string;
  password?: string;
  role: UserRole;
}

export interface AdminProductPayload {
  userId: string;
  name: string;
  category: ProductCategory;
  timing: RoutineTiming;
  brand: string;
  notes: string;
  isActive: boolean;
}

export interface AdminRoutinePayload {
  userId: string;
  name: string;
  timing: RoutineTiming;
  notes: string;
  streak?: number;
}

export interface AdminUserUpdatePayload {
  name?: string;
  email?: string;
  password?: string;
  role?: UserRole;
}
