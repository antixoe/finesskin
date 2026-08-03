import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { forkJoin } from 'rxjs';
import type {
  ProductPayload,
  ProductResponse,
  Routine,
  RoutineResponse,
  ScanResponse,
  SkinScan,
} from './finesskin.models';

@Injectable({ providedIn: 'root' })
export class FinesskinApiService {
  private readonly http = inject(HttpClient);

  getProducts() {
    return this.http.get<ProductResponse>('/api/products');
  }

  getRoutines() {
    return this.http.get<RoutineResponse>('/api/routines');
  }

  getScans() {
    return this.http.get<ScanResponse>('/api/scans');
  }

  getDashboardData() {
    return forkJoin({
      products: this.getProducts(),
      routines: this.getRoutines(),
      scans: this.getScans(),
    });
  }

  createProduct(payload: ProductPayload) {
    return this.http.post('/api/products', payload);
  }

  updateProduct(id: string, payload: ProductPayload) {
    return this.http.patch(`/api/products/${id}`, payload);
  }

  deleteProduct(id: string) {
    return this.http.delete(`/api/products/${id}`);
  }

  toggleRoutineCompletion(routine: Routine, nextValue: boolean) {
    return this.http.patch(`/api/routines/${routine.id}`, {
      completedToday: nextValue,
    });
  }

  toggleRoutineItem(routineId: string, itemId: string, isChecked: boolean) {
    return this.http.patch(`/api/routines/${routineId}/items/${itemId}`, {
      isChecked: !isChecked,
    });
  }

  createScan(payload: Omit<SkinScan, 'id' | 'createdAt'>) {
    return this.http.post('/api/scans', payload);
  }
}
