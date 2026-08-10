import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { catchError, map, of } from 'rxjs';
import type {
  DrinkLog,
  DrinksResponse,
  Habit,
  HabitPayload,
  HabitsResponse,
  MoodEntry,
  MoodsResponse,
  ProductPayload,
  Product,
  ProductResponse,
  Routine,
  RoutineResponse,
  TodoItem,
  TodosResponse,
  WaterGoalResponse,
  WaterUnit,
} from './finesskin.models';

type DemoStore = {
  products: Product[];
  routines: Routine[];
  habits: Habit[];
  todos: TodoItem[];
  moods: MoodEntry[];
  drinks: DrinkLog[];
  waterGoal: number;
  waterUnit: WaterUnit;
};

@Injectable({ providedIn: 'root' })
export class FinesskinApiService {
  private readonly http = inject(HttpClient);
  private readonly storageKey = 'finesskin-demo-store';

  getProducts() {
    return this.http
      .get<ProductResponse>('/api/products')
      .pipe(catchError(() => of({ products: this.readStore().products })));
  }

  getRoutines() {
    return this.http
      .get<RoutineResponse>('/api/routines')
      .pipe(catchError(() => of({ routines: this.readStore().routines })));
  }

  createProduct(payload: ProductPayload) {
    return this.http.post('/api/products', payload).pipe(
      catchError(() => {
        const store = this.readStore();
        const product: Product = {
          id: this.makeId('product'),
          name: payload.name,
          category: payload.category,
          timing: payload.timing,
          brand: payload.brand || null,
          notes: payload.notes || null,
          isActive: true,
        };

        store.products = [product, ...store.products];
        this.writeStore(store);
        return of(product);
      }),
    );
  }

  updateProduct(id: string, payload: ProductPayload) {
    return this.http.patch(`/api/products/${id}`, payload).pipe(
      catchError(() => {
        const store = this.readStore();
        const current = store.products.find((product) => product.id === id);

        if (!current) {
          return of(null);
        }

        const nextProduct: Product = {
          ...current,
          name: payload.name,
          category: payload.category,
          timing: payload.timing,
          brand: payload.brand || null,
          notes: payload.notes || null,
        };

        store.products = store.products.map((product) =>
          product.id === id ? nextProduct : product,
        );
        store.routines = store.routines.map((routine) => ({
          ...routine,
          items: routine.items.map((item) =>
            item.product?.id === id
              ? {
                  ...item,
                  product: {
                    id: nextProduct.id,
                    name: nextProduct.name,
                    category: nextProduct.category,
                  },
                }
              : item,
          ),
        }));
        this.writeStore(store);
        return of(nextProduct);
      }),
    );
  }

  deleteProduct(id: string) {
    return this.http.delete(`/api/products/${id}`).pipe(
      catchError(() => {
        const store = this.readStore();
        store.products = store.products.filter((product) => product.id !== id);
        store.routines = store.routines.map((routine) => ({
          ...routine,
          items: routine.items.map((item) =>
            item.product?.id === id
              ? {
                  ...item,
                  productId: null,
                  product: null,
                }
              : item,
          ),
        }));
        this.writeStore(store);
        return of({ success: true });
      }),
    );
  }

  toggleRoutineCompletion(routine: Routine, nextValue: boolean) {
    return this.http
      .patch(`/api/routines/${routine.id}`, {
        completedToday: nextValue,
      })
      .pipe(
        catchError(() => {
          const store = this.readStore();
          store.routines = store.routines.map((currentRoutine) => {
            if (currentRoutine.id !== routine.id) {
              return currentRoutine;
            }

            return {
              ...currentRoutine,
              completedToday: nextValue,
              streak: nextValue
                ? Math.max(currentRoutine.streak, currentRoutine.streak + 1)
                : Math.max(currentRoutine.streak - 1, 0),
              completions: nextValue
                ? [
                    {
                      id: this.makeId('completion'),
                      note: 'Saved in local preview mode',
                      completedAt: new Date().toISOString(),
                    },
                    ...currentRoutine.completions,
                  ]
                : currentRoutine.completions.slice(1),
            };
          });
          this.writeStore(store);
          return of({ success: true });
        }),
      );
  }

  toggleRoutineItem(routineId: string, itemId: string, isChecked: boolean) {
    return this.http
      .patch(`/api/routines/${routineId}/items/${itemId}`, {
        isChecked: !isChecked,
      })
      .pipe(
        catchError(() => {
          const store = this.readStore();
          store.routines = store.routines.map((routine) =>
            routine.id === routineId
              ? {
                  ...routine,
                  items: routine.items.map((item) =>
                    item.id === itemId ? { ...item, isChecked: !isChecked } : item,
                  ),
                }
              : routine,
          );
          this.writeStore(store);
          return of({ success: true });
        }),
      );
  }

  // ---- Client dashboard: habits ----

  getHabits() {
    return this.http
      .get<HabitsResponse>('/api/habits')
      .pipe(
        map((response) => ({
          habits: response.habits.map((habit) => this.normalizeHabit(habit)),
        })),
        catchError(() => of({ habits: this.readStore().habits.map((habit) => this.normalizeHabit(habit)) })),
      );
  }

  createHabit(payload: HabitPayload) {
    return this.http
      .post<{ habit: Habit }>('/api/habits', payload)
      .pipe(
        map((response) => ({ habit: this.normalizeHabit(response.habit) })),
        catchError(() => {
          const store = this.readStore();
          const habit: Habit = {
            id: this.makeId('habit'),
            title: payload.title,
            category: payload.category,
            emoji: payload.emoji,
            scheduleType: payload.scheduleType,
            weekdays: payload.weekdays,
            dates: payload.dates,
            note: payload.note,
            createdAt: new Date().toISOString(),
            logs: [],
          };
          store.habits = [...store.habits, habit];
          this.writeStore(store);
          return of({ habit });
        }),
      );
  }

  deleteHabit(id: string) {
    return this.http.delete(`/api/habits/${id}`).pipe(
      catchError(() => {
        const store = this.readStore();
        store.habits = store.habits.filter((habit) => habit.id !== id);
        this.writeStore(store);
        return of({ ok: true });
      }),
    );
  }

  updateHabit(id: string, patch: Partial<Pick<Habit, 'category'>>) {
    return this.http.patch<{ habit: Habit }>(`/api/habits/${id}`, patch).pipe(
      map((response) => ({ habit: this.normalizeHabit(response.habit) })),
    );
  }

  setHabitLog(habitId: string, date: string, done: boolean) {
    return this.http
      .patch<{ log: { id: string; date: string; done: boolean } | null }>(
        `/api/habits/${habitId}`,
        { date, done },
      )
      .pipe(
        catchError(() => {
          const store = this.readStore();
          store.habits = store.habits.map((habit) => {
            if (habit.id !== habitId) {
              return habit;
            }

            const logs = done
              ? [
                  ...habit.logs.filter((log) => log.date !== date),
                  { id: this.makeId('habit-log'), date, done: true },
                ]
              : habit.logs.filter((log) => log.date !== date);

            return { ...habit, logs };
          });
          this.writeStore(store);
          return of({ log: null });
        }),
      );
  }

  // ---- Client dashboard: to-dos ----

  getTodos() {
    return this.http
      .get<TodosResponse>('/api/todos')
      .pipe(catchError(() => of({ todos: this.readStore().todos })));
  }

  createTodo(title: string, dueDate?: string, dueTime?: string, category = 'General') {
    return this.http
      .post<{ todo: TodoItem }>('/api/todos', { title, dueDate, dueTime, category })
      .pipe(
        catchError(() => {
          const store = this.readStore();
          const todo: TodoItem = {
            id: this.makeId('todo'),
            title,
            category,
            done: false,
            dueDate: dueDate ?? null,
            dueTime: dueTime ?? null,
            createdAt: new Date().toISOString(),
          };
          store.todos = [todo, ...store.todos];
          this.writeStore(store);
          return of({ todo });
        }),
      );
  }

  updateTodo(id: string, patch: Partial<Pick<TodoItem, 'title' | 'done' | 'dueDate' | 'dueTime' | 'category'>>) {
    return this.http
      .patch<{ todo: TodoItem }>(`/api/todos/${id}`, patch)
      .pipe(
        catchError(() => {
          const store = this.readStore();
          store.todos = store.todos.map((todo) =>
            todo.id === id ? { ...todo, ...patch } : todo,
          );
          this.writeStore(store);
          return of({ todo: store.todos.find((todo) => todo.id === id) ?? ({} as TodoItem) });
        }),
      );
  }

  deleteTodo(id: string) {
    return this.http.delete(`/api/todos/${id}`).pipe(
      catchError(() => {
        const store = this.readStore();
        store.todos = store.todos.filter((todo) => todo.id !== id);
        this.writeStore(store);
        return of({ ok: true });
      }),
    );
  }

  // ---- Client dashboard: moods ----

  getMoods() {
    return this.http
      .get<MoodsResponse>('/api/moods')
      .pipe(catchError(() => of({ moods: this.readStore().moods })));
  }

  setMood(date: string, mood: string, note: string | null) {
    return this.http
      .put<{ mood: MoodEntry }>('/api/moods', { date, mood, note })
      .pipe(
        catchError(() => {
          const store = this.readStore();
          store.moods = [
            ...store.moods.filter((entry) => entry.date !== date),
            { id: this.makeId('mood'), date, mood, note },
          ];
          this.writeStore(store);
          return of({ mood: store.moods.find((entry) => entry.date === date) ?? ({} as MoodEntry) });
        }),
      );
  }

  // ---- Client dashboard: drinks ----

  getDrinks() {
    return this.http
      .get<DrinksResponse>('/api/drinks')
      .pipe(catchError(() => of({ drinks: this.readStore().drinks })));
  }

  setDrinks(date: string, glasses: number) {
    return this.http
      .put<{ drink: DrinkLog }>('/api/drinks', { date, glasses })
      .pipe(
        catchError(() => {
          const store = this.readStore();
          store.drinks = [
            ...store.drinks.filter((entry) => entry.date !== date),
            { id: this.makeId('drink'), date, glasses },
          ];
          this.writeStore(store);
          return of({ drink: store.drinks.find((entry) => entry.date === date) ?? ({} as DrinkLog) });
        }),
      );
  }

  getWaterGoal() {
    return this.http
      .get<WaterGoalResponse>('/api/water-goal')
      .pipe(catchError(() => {
        const store = this.readStore();
        return of({ goal: store.waterGoal ?? 8, unit: store.waterUnit ?? 'glasses' } as WaterGoalResponse);
      }));
  }

  updateWaterGoal(goal: number, unit: WaterUnit) {
    return this.http
      .put<WaterGoalResponse>('/api/water-goal', { goal, unit })
      .pipe(catchError(() => {
        const store = this.readStore();
        store.waterGoal = goal;
        store.waterUnit = unit;
        this.writeStore(store);
        return of({ goal, unit });
      }));
  }

  resetWaterGoal() {
    return this.http
      .delete<WaterGoalResponse>('/api/water-goal')
      .pipe(catchError(() => {
        const store = this.readStore();
        store.waterGoal = 8;
        store.waterUnit = 'glasses';
        this.writeStore(store);
        return of({ goal: 8, unit: 'glasses' as WaterUnit });
      }));
  }

  private normalizeHabit(habit: Habit): Habit {
    const scheduleType =
      habit.scheduleType === 'weekly' || habit.scheduleType === 'dates'
        ? habit.scheduleType
        : 'daily';

    return {
      ...habit,
      category: habit.category?.trim() || 'General',
      scheduleType,
      weekdays: Array.isArray(habit.weekdays)
        ? habit.weekdays.map(Number).filter((day) => Number.isInteger(day))
        : [],
      dates: Array.isArray(habit.dates) ? habit.dates.map(String) : [],
      note: habit.note ?? null,
    };
  }

  private readStore(): DemoStore {
    if (typeof window === 'undefined') {
      return this.createDemoStore();
    }

    const saved = window.localStorage.getItem(this.storageKey);

    if (!saved) {
      const initialStore = this.createDemoStore();
      this.writeStore(initialStore);
      return initialStore;
    }

    try {
      return JSON.parse(saved) as DemoStore;
    } catch {
      const resetStore = this.createDemoStore();
      this.writeStore(resetStore);
      return resetStore;
    }
  }

  private writeStore(store: DemoStore): void {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(this.storageKey, JSON.stringify(store));
  }

  private createDemoStore(): DemoStore {
    const cleanserId = 'product-cleanser';
    const serumId = 'product-serum';
    const sunscreenId = 'product-sunscreen';
    const moisturizerId = 'product-moisturizer';
    const now = new Date().toISOString();

    return {
      products: [
        {
          id: cleanserId,
          name: 'Gentle Gel Cleanser',
          category: 'CLEANSER',
          timing: 'AM',
          brand: 'Finesskin Lab',
          notes: 'Use with lukewarm water for daily cleansing.',
          isActive: true,
        },
        {
          id: serumId,
          name: 'Niacinamide Balance Serum',
          category: 'SERUM',
          timing: 'PM',
          brand: 'Finesskin Lab',
          notes: 'Helps with oil balance and visible pores.',
          isActive: true,
        },
        {
          id: moisturizerId,
          name: 'Barrier Repair Cream',
          category: 'MOISTURIZER',
          timing: 'PM',
          brand: 'Finesskin Lab',
          notes: 'Support overnight moisture recovery.',
          isActive: true,
        },
        {
          id: sunscreenId,
          name: 'Daily UV Shield SPF 50',
          category: 'SUNSCREEN',
          timing: 'AM',
          brand: 'Finesskin Lab',
          notes: 'Reapply during the day when needed.',
          isActive: true,
        },
      ],
      routines: [
        {
          id: 'routine-am',
          name: 'Morning Reset',
          timing: 'AM',
          streak: 6,
          completedToday: false,
          notes: 'Keep the AM routine lightweight and protective.',
          items: [
            {
              id: 'routine-item-am-1',
              title: 'Cleanse gently',
              hint: 'Avoid over-washing to protect the barrier.',
              order: 1,
              isChecked: false,
              productId: cleanserId,
              product: {
                id: cleanserId,
                name: 'Gentle Gel Cleanser',
                category: 'CLEANSER',
              },
            },
            {
              id: 'routine-item-am-2',
              title: 'Apply sunscreen',
              hint: 'Finish with broad-spectrum protection.',
              order: 2,
              isChecked: false,
              productId: sunscreenId,
              product: {
                id: sunscreenId,
                name: 'Daily UV Shield SPF 50',
                category: 'SUNSCREEN',
              },
            },
          ],
          completions: [
            {
              id: 'completion-am-1',
              note: 'Strong consistency this week.',
              completedAt: now,
            },
          ],
        },
        {
          id: 'routine-pm',
          name: 'Evening Recovery',
          timing: 'PM',
          streak: 4,
          completedToday: true,
          notes: 'Focus on hydration and barrier repair at night.',
          items: [
            {
              id: 'routine-item-pm-1',
              title: 'Apply treatment serum',
              hint: 'Use after cleansing on dry skin.',
              order: 1,
              isChecked: true,
              productId: serumId,
              product: {
                id: serumId,
                name: 'Niacinamide Balance Serum',
                category: 'SERUM',
              },
            },
            {
              id: 'routine-item-pm-2',
              title: 'Seal with moisturizer',
              hint: 'Use a richer cream if skin feels tight.',
              order: 2,
              isChecked: true,
              productId: moisturizerId,
              product: {
                id: moisturizerId,
                name: 'Barrier Repair Cream',
                category: 'MOISTURIZER',
              },
            },
          ],
          completions: [
            {
              id: 'completion-pm-1',
              note: 'Barrier looked calmer after evening care.',
              completedAt: now,
            },
          ],
        },
      ],
      habits: [],
      todos: [],
      moods: [],
      drinks: [],
      waterGoal: 8,
      waterUnit: 'glasses',
    };
  }

  private makeId(prefix: string): string {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  }
}
