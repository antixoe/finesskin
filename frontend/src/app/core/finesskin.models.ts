export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'CUSTOMER';
export type AdminPermission = 'DASHBOARD' | 'USERS' | 'ROLES' | 'ACTIVITY';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  permissions: AdminPermission[];
  avatarUrl: string | null;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export interface AdminStats {
  users: number;
  admins: number;
  customers: number;
  activityLogs: number;
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

// ---- Client dashboard models ----

export interface HabitLog {
  id: string;
  date: string;
  done: boolean;
}

export type HabitScheduleType = 'daily' | 'weekly' | 'dates';

export interface Habit {
  id: string;
  title: string;
  category: string;
  emoji: string;
  scheduleType: HabitScheduleType;
  weekdays: number[];
  dates: string[];
  note: string | null;
  createdAt: string;
  logs: HabitLog[];
}

export interface HabitPayload {
  title: string;
  category: string;
  emoji: string;
  scheduleType: HabitScheduleType;
  weekdays: number[];
  dates: string[];
  note: string | null;
}

export interface TodoItem {
  id: string;
  title: string;
  category?: string;
  done: boolean;
  dueDate?: string | null;
  dueTime?: string | null;
  createdAt: string;
}

export interface MoodEntry {
  id: string;
  date: string;
  mood: string;
  cause?: string | null;
  note: string | null;
}

export interface DrinkLog {
  id: string;
  date: string;
  glasses: number;
}

export interface HabitsResponse {
  habits: Habit[];
}

export interface TodosResponse {
  todos: TodoItem[];
}

export interface MoodsResponse {
  moods: MoodEntry[];
}

export interface DrinksResponse {
  drinks: DrinkLog[];
}

export type WaterUnit = 'glasses' | 'liters';

export interface WaterGoalResponse {
  goal: number;
  unit: WaterUnit;
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
  permissions: AdminPermission[];
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
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

export interface ActivityLog {
  id: string;
  actorId: string | null;
  action: string;
  target: string;
  detail: string | null;
  createdAt: string;
  actor: {
    name: string;
    email: string;
  } | null;
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
  activityLogs: ActivityLog[];
}

export interface AdminUserPayload {
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  permissions?: AdminPermission[];
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
  permissions?: AdminPermission[];
}
