import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';
import { AuthService } from './auth.service';
import type {
  AdminProduct,
  AdminProductPayload,
  AdminProductsResponse,
  AdminRoutine,
  AdminRoutinePayload,
  AdminRoutinesResponse,
  AdminScan,
  AdminScansResponse,
  AdminSettingsResponse,
  AdminUser,
  AdminUserPayload,
  AdminUserUpdatePayload,
  AdminUsersResponse,
  ActivityLog,
  PlatformSettings,
} from './finesskin.models';

@Injectable({ providedIn: 'root' })
export class AdminApiService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);

  private headers(): { Authorization: string } {
    return { Authorization: `Bearer ${this.auth.token() ?? ''}` };
  }

  // ---- Users ----

  getUsers() {
    return this.http
      .get<AdminUsersResponse>('/api/admin/users', { headers: this.headers() })
      .pipe(map((response) => response.users));
  }

  createUser(payload: AdminUserPayload) {
    return this.http
      .post<{ user: AdminUser }>('/api/admin/users', payload, {
        headers: this.headers(),
      })
      .pipe(map((response) => response.user));
  }

  updateUser(id: string, payload: AdminUserUpdatePayload) {
    return this.http
      .patch<{ user: AdminUser }>(`/api/admin/users/${id}`, payload, {
        headers: this.headers(),
      })
      .pipe(map((response) => response.user));
  }

  deleteUser(id: string) {
    return this.http.delete<{ ok: boolean }>(`/api/admin/users/${id}`, {
      headers: this.headers(),
    });
  }

  // ---- Products ----

  getProducts() {
    return this.http
      .get<AdminProductsResponse>('/api/admin/products', {
        headers: this.headers(),
      })
      .pipe(map((response) => response.products));
  }

  createProduct(payload: AdminProductPayload) {
    return this.http
      .post<{ product: AdminProduct }>('/api/admin/products', payload, {
        headers: this.headers(),
      })
      .pipe(map((response) => response.product));
  }

  updateProduct(id: string, payload: Partial<AdminProductPayload>) {
    return this.http
      .patch<{ product: AdminProduct }>(`/api/admin/products/${id}`, payload, {
        headers: this.headers(),
      })
      .pipe(map((response) => response.product));
  }

  deleteProduct(id: string) {
    return this.http.delete<{ ok: boolean }>(`/api/admin/products/${id}`, {
      headers: this.headers(),
    });
  }

  // ---- Routines ----

  getRoutines() {
    return this.http
      .get<AdminRoutinesResponse>('/api/admin/routines', {
        headers: this.headers(),
      })
      .pipe(map((response) => response.routines));
  }

  createRoutine(payload: AdminRoutinePayload) {
    return this.http
      .post<{ routine: AdminRoutine }>('/api/admin/routines', payload, {
        headers: this.headers(),
      })
      .pipe(map((response) => response.routine));
  }

  updateRoutine(id: string, payload: Partial<AdminRoutinePayload>) {
    return this.http
      .patch<{ routine: AdminRoutine }>(`/api/admin/routines/${id}`, payload, {
        headers: this.headers(),
      })
      .pipe(map((response) => response.routine));
  }

  deleteRoutine(id: string) {
    return this.http.delete<{ ok: boolean }>(`/api/admin/routines/${id}`, {
      headers: this.headers(),
    });
  }

  // ---- Scans ----

  getScans() {
    return this.http
      .get<AdminScansResponse>('/api/admin/scans', { headers: this.headers() })
      .pipe(map((response) => response.scans));
  }

  deleteScan(id: string) {
    return this.http.delete<{ ok: boolean }>(`/api/admin/scans/${id}`, {
      headers: this.headers(),
    });
  }

  // ---- Settings ----

  getSettings() {
    return this.http
      .get<AdminSettingsResponse>('/api/admin/settings', {
        headers: this.headers(),
      })
      .pipe(map((response) => response.settings));
  }

  updateSettings(payload: Partial<PlatformSettings>) {
    return this.http
      .put<AdminSettingsResponse>('/api/admin/settings', payload, {
        headers: this.headers(),
      })
      .pipe(map((response) => response.settings));
  }

  getActivityLogs() {
    return this.http
      .get<{ activityLogs: ActivityLog[] }>('/api/admin/activity', {
        headers: this.headers(),
      })
      .pipe(map((response) => response.activityLogs ?? []));
  }
}
