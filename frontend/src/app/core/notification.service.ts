import { Injectable, signal } from '@angular/core';

export type NotificationType = 'success' | 'error' | 'info';

export interface AppNotification {
  id: number;
  type: NotificationType;
  title: string;
  message?: string;
}

const DEFAULT_DURATION_MS = 4200;
const MAX_STACK = 4;

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly notificationsSignal = signal<AppNotification[]>([]);
  private nextId = 1;

  readonly notifications = this.notificationsSignal.asReadonly();

  show(type: NotificationType, title: string, message?: string): void {
    const id = this.nextId++;

    this.notificationsSignal.update((current) => {
      const next = [...current, { id, type, title, message }];
      return next.slice(-MAX_STACK);
    });

    window.setTimeout(() => this.dismiss(id), DEFAULT_DURATION_MS);
  }

  success(title: string, message?: string): void {
    this.show('success', title, message);
  }

  error(title: string, message?: string): void {
    this.show('error', title, message);
  }

  info(title: string, message?: string): void {
    this.show('info', title, message);
  }

  dismiss(id: number): void {
    this.notificationsSignal.update((current) =>
      current.filter((notification) => notification.id !== id),
    );
  }
}
