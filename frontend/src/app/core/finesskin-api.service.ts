import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { catchError, forkJoin, of } from 'rxjs';
import type {
  ProductPayload,
  Product,
  ProductResponse,
  Routine,
  RoutineResponse,
  ScanResponse,
  SkinScan,
} from './finesskin.models';

type DemoStore = {
  products: Product[];
  routines: Routine[];
  scans: SkinScan[];
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

  getScans() {
    return this.http
      .get<ScanResponse>('/api/scans')
      .pipe(catchError(() => of({ scans: this.readStore().scans })));
  }

  getDashboardData() {
    return forkJoin({
      products: this.getProducts(),
      routines: this.getRoutines(),
      scans: this.getScans(),
    });
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

  createScan(payload: Omit<SkinScan, 'id' | 'createdAt'>) {
    return this.http.post('/api/scans', payload).pipe(
      catchError(() => {
        const store = this.readStore();
        const scan: SkinScan = {
          id: this.makeId('scan'),
          createdAt: new Date().toISOString(),
          ...payload,
        };
        store.scans = [scan, ...store.scans];
        this.writeStore(store);
        return of(scan);
      }),
    );
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
      scans: [
        {
          id: 'scan-demo-1',
          source: 'UPLOAD',
          imageLabel: 'demo-scan.jpg',
          score: 78,
          hydration: 74,
          redness: 22,
          acne: 28,
          barrier: 81,
          summary: 'Skin looks fairly balanced with mild redness and a strong barrier trend.',
          recommendations: [
            {
              title: 'Keep barrier support consistent',
              detail: 'Use a moisturizer that reinforces lipids after cleansing.',
              priority: 'high',
            },
            {
              title: 'Watch congestion zones',
              detail: 'Use lighter layers on acne-prone areas to avoid buildup.',
              priority: 'medium',
            },
          ],
          createdAt: now,
        },
      ],
    };
  }

  private makeId(prefix: string): string {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  }
}
