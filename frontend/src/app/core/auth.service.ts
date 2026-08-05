import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of, tap } from 'rxjs';
import type { AdminPermission, AdminStats, AuthResponse, AuthUser } from './finesskin.models';

const SESSION_KEY = 'finesskin-session';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);

  private readonly tokenSignal = signal<string | null>(null);
  private readonly userSignal = signal<AuthUser | null>(null);

  readonly token = this.tokenSignal.asReadonly();
  readonly user = this.userSignal.asReadonly();
  readonly isAuthenticated = computed(() => this.userSignal() !== null);
  readonly isAdmin = computed(() => {
    const role = this.userSignal()?.role;
    return role === 'ADMIN' || role === 'SUPER_ADMIN';
  });
  readonly isSuperAdmin = computed(() => this.userSignal()?.role === 'SUPER_ADMIN');

  hasPermission(permission: AdminPermission): boolean {
    const user = this.userSignal();

    if (!user) {
      return false;
    }

    if (user.role === 'SUPER_ADMIN') {
      return true;
    }

    return user.role === 'ADMIN' && user.permissions.includes(permission);
  }

  constructor() {
    this.restoreSession();

    if (this.tokenSignal()) {
      void this.validateSession();
    }
  }

  signIn(email: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>('/api/auth/signin', { email, password })
      .pipe(tap((response) => this.persistSession(response)));
  }

  signUp(name: string, email: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>('/api/auth/signup', { name, email, password })
      .pipe(tap((response) => this.persistSession(response)));
  }

  signOut(): void {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(SESSION_KEY);
    }

    this.tokenSignal.set(null);
    this.userSignal.set(null);
  }

  getAdminStats(): Observable<AdminStats | null> {
    const token = this.tokenSignal();

    if (!token) {
      return of(null);
    }

    return this.http
      .get<{ stats: AdminStats }>('/api/admin/stats', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .pipe(map((response) => response.stats));
  }

  private validateSession(): void {
    const token = this.tokenSignal();

    if (!token) {
      return;
    }

    this.http
      .get<{ user: AuthUser }>('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .pipe(catchError(() => of(null)))
      .subscribe((response) => {
        if (!response) {
          this.signOut();
          return;
        }

        this.userSignal.set(response.user);
      });
  }

  private persistSession(response: AuthResponse): void {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(SESSION_KEY, JSON.stringify(response));
    }

    this.tokenSignal.set(response.token);
    this.userSignal.set(response.user);
  }

  private restoreSession(): void {
    if (typeof window === 'undefined') {
      return;
    }

    const saved = window.localStorage.getItem(SESSION_KEY);

    if (!saved) {
      return;
    }

    try {
      const session = JSON.parse(saved) as AuthResponse;
      this.tokenSignal.set(session.token);
      this.userSignal.set(session.user);
    } catch {
      window.localStorage.removeItem(SESSION_KEY);
    }
  }
}
