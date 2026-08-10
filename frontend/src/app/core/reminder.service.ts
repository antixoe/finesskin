import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { forkJoin } from 'rxjs';
import { AuthService } from './auth.service';
import { FinesskinApiService } from './finesskin-api.service';
import type { Habit, TodoItem } from './finesskin.models';

export interface Reminder {
  id: string;
  kind: 'habit' | 'todo' | 'routine';
  title: string;
  message: string;
  icon: string;
  priority: 'high' | 'gentle';
  read: boolean;
}

function dateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function habitIsDueToday(habit: Habit, key: string, weekday: number): boolean {
  if (habit.scheduleType === 'weekly') return habit.weekdays.includes(weekday);
  if (habit.scheduleType === 'dates') return habit.dates.includes(key);
  return true;
}

@Injectable({ providedIn: 'root' })
export class ReminderService {
  private readonly auth = inject(AuthService);
  private readonly api = inject(FinesskinApiService);
  private readonly remindersSignal = signal<Reminder[]>([]);
  private loadedFor: string | null = null;

  readonly reminders = this.remindersSignal.asReadonly();
  readonly unreadCount = computed(() => this.reminders().filter((reminder) => !reminder.read).length);

  constructor() {
    effect(() => {
      const user = this.auth.user();
      if (!user || user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
        this.loadedFor = null;
        this.remindersSignal.set([]);
        return;
      }
      if (this.loadedFor !== user.id) this.refresh();
    });
  }

  refresh(): void {
    const userId = this.auth.user()?.id;
    if (!userId || this.loadedFor === userId) return;
    this.loadedFor = userId;

    forkJoin({ habits: this.api.getHabits(), todos: this.api.getTodos() }).subscribe(({ habits, todos }) => {
      const today = new Date();
      const key = dateKey(today);
      const weekday = today.getDay();
      const seen = this.readSeen(userId);
      const next: Reminder[] = [];

      habits.habits
        .filter((habit) => habitIsDueToday(habit, key, weekday) && !habit.logs.some((log) => log.date === key && log.done))
        .forEach((habit) => next.push({
          id: `habit-${habit.id}-${key}`,
          kind: 'habit',
          title: `${habit.emoji} ${habit.title}`,
          message: 'This habit is waiting for your gentle attention today.',
          icon: '✓',
          priority: 'gentle',
          read: seen.includes(`habit-${habit.id}-${key}`),
        }));

      todos.todos
        .filter((todo) => !todo.done && !!todo.dueDate && todo.dueDate <= key)
        .forEach((todo) => {
          const overdue = todo.dueDate! < key;
          next.push({
            id: `todo-${todo.id}-${todo.dueDate}`,
            kind: 'todo',
            title: todo.title,
            message: overdue ? 'This to-do is overdue.' : `Due today${todo.dueTime ? ` at ${todo.dueTime}` : ''}.`,
            icon: '!',
            priority: overdue ? 'high' : 'gentle',
            read: seen.includes(`todo-${todo.id}-${todo.dueDate}`),
          });
        });

      this.remindersSignal.set(next);
    });
  }

  markRead(id: string): void {
    const userId = this.auth.user()?.id;
    if (!userId) return;
    this.remindersSignal.update((items) => items.map((item) => item.id === id ? { ...item, read: true } : item));
    const seen = this.readSeen(userId);
    if (!seen.includes(id)) this.writeSeen(userId, [...seen, id]);
  }

  markAllRead(): void {
    const userId = this.auth.user()?.id;
    if (!userId) return;
    const ids = this.reminders().map((item) => item.id);
    this.remindersSignal.update((items) => items.map((item) => ({ ...item, read: true })));
    this.writeSeen(userId, [...new Set([...this.readSeen(userId), ...ids])]);
  }

  private readSeen(userId: string): string[] {
    if (typeof window === 'undefined') return [];
    try { return JSON.parse(window.localStorage.getItem(`finesskin-reminders-${userId}`) ?? '[]') as string[]; } catch { return []; }
  }

  private writeSeen(userId: string, ids: string[]): void {
    if (typeof window !== 'undefined') window.localStorage.setItem(`finesskin-reminders-${userId}`, JSON.stringify(ids.slice(-100)));
  }
}
