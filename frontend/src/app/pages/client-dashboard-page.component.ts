import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../core/auth.service';
import { FinesskinApiService } from '../core/finesskin-api.service';
import { NotificationService } from '../core/notification.service';
import {
  habitEmojiOptions,
  habitScheduleOptions,
  moodOptions,
  waterGoalGlasses,
  weekdayLabels,
  weekdayNames,
} from '../core/finesskin.constants';
import type {
  DrinkLog,
  Habit,
  HabitPayload,
  HabitScheduleType,
  MoodEntry,
  TodoItem,
} from '../core/finesskin.models';

function toKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function habitDueOn(habit: Habit, dateKey: string, weekday: number): boolean {
  if (habit.scheduleType === 'weekly') {
    return habit.weekdays.includes(weekday);
  }

  if (habit.scheduleType === 'dates') {
    return habit.dates.includes(dateKey);
  }

  return true;
}

interface CalendarDay {
  date: Date;
  key: string;
  inMonth: boolean;
  isToday: boolean;
  mood: string | null;
  glasses: number;
  habitsDone: number;
  habitTotal: number;
}

@Component({
  selector: 'app-client-dashboard-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './client-dashboard-page.component.html',
  styleUrl: './client-dashboard-page.component.css',
})
export class ClientDashboardPageComponent implements OnInit {
  protected readonly authService = inject(AuthService);
  private readonly api = inject(FinesskinApiService);
  private readonly notifications = inject(NotificationService);

  protected readonly habits = signal<Habit[]>([]);
  protected readonly todos = signal<TodoItem[]>([]);
  protected readonly moods = signal<MoodEntry[]>([]);
  protected readonly drinks = signal<DrinkLog[]>([]);
  protected readonly loading = signal(true);

  protected readonly viewYear = signal(new Date().getFullYear());
  protected readonly viewMonth = signal(new Date().getMonth());
  protected readonly selectedDate = signal<Date>(new Date());

  protected readonly todoTitle = signal('');
  protected readonly moodNote = signal('');

  // Habit modal state
  protected readonly habitModalOpen = signal(false);
  protected readonly habitFormTitle = signal('');
  protected readonly habitFormEmoji = signal<string>('💧');
  protected readonly habitFormSchedule = signal<HabitScheduleType>('daily');
  protected readonly habitFormWeekdays = signal<number[]>([]);
  protected readonly habitFormDates = signal<string[]>([]);
  protected readonly habitFormNote = signal('');
  protected readonly habitDateInput = signal('');

  protected readonly habitEmojiOptions = habitEmojiOptions;
  protected readonly habitScheduleOptions = habitScheduleOptions;
  protected readonly moodOptions = moodOptions;
  protected readonly weekdayLabels = weekdayLabels;
  protected readonly weekdayNames = weekdayNames;
  protected readonly waterGoal = waterGoalGlasses;

  protected readonly selectedKey = computed(() => toKey(this.selectedDate()));

  protected readonly selectedMood = computed(() =>
    this.moods().find((entry) => entry.date === this.selectedKey()),
  );

  protected readonly selectedGlasses = computed(
    () => this.drinks().find((entry) => entry.date === this.selectedKey())?.glasses ?? 0,
  );

  protected readonly visibleHabits = computed(() => {
    const key = this.selectedKey();
    const weekday = this.selectedDate().getDay();
    return this.habits().filter((habit) => habitDueOn(habit, key, weekday));
  });

  protected readonly habitsDone = computed(
    () =>
      this.visibleHabits().filter((habit) =>
        habit.logs.some((log) => log.date === this.selectedKey() && log.done),
      ).length,
  );

  protected readonly habitTotal = computed(() => this.visibleHabits().length);
  protected readonly doneTodos = computed(() => this.todos().filter((todo) => todo.done).length);
  protected readonly waterPercent = computed(() =>
    Math.min(100, Math.round((this.selectedGlasses() / this.waterGoal) * 100)),
  );

  protected readonly remainingGlassCount = computed(() =>
    Math.max(0, this.waterGoal - this.selectedGlasses()),
  );

  protected readonly selectedLabel = computed(() =>
    this.selectedDate().toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    }),
  );

  protected readonly monthLabel = computed(() =>
    new Date(this.viewYear(), this.viewMonth(), 1).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    }),
  );

  protected readonly calendarDays = computed<CalendarDay[]>(() => {
    const year = this.viewYear();
    const month = this.viewMonth();
    const first = new Date(year, month, 1);
    const startWeekday = first.getDay();
    const todayKey = toKey(new Date());
    const selectedKey = this.selectedKey();

    const moodByDate = new Map(this.moods().map((entry) => [entry.date, entry.mood]));
    const drinksByDate = new Map(this.drinks().map((entry) => [entry.date, entry.glasses]));
    const habitLogsByDate = new Map<string, number>();

    for (const habit of this.habits()) {
      for (const log of habit.logs) {
        if (!log.done) {
          continue;
        }
        habitLogsByDate.set(log.date, (habitLogsByDate.get(log.date) ?? 0) + 1);
      }
    }

    const days: CalendarDay[] = [];

    for (let i = 0; i < 42; i++) {
      const date = new Date(year, month, i - startWeekday + 1);
      const key = toKey(date);
      const weekday = date.getDay();
      const due = this.habits().filter((habit) => habitDueOn(habit, key, weekday)).length;

      days.push({
        date,
        key,
        inMonth: date.getMonth() === month,
        isToday: key === todayKey,
        mood: moodByDate.get(key) ?? null,
        glasses: drinksByDate.get(key) ?? 0,
        habitsDone: habitLogsByDate.get(key) ?? 0,
        habitTotal: due,
      });
    }

    return days;
  });

  ngOnInit() {
    this.refresh();
  }

  protected refresh() {
    this.api.getHabits().subscribe((response) => this.habits.set(response.habits));
    this.api.getTodos().subscribe((response) => this.todos.set(response.todos));
    this.api.getMoods().subscribe((response) => this.moods.set(response.moods));
    this.api.getDrinks().subscribe((response) => this.drinks.set(response.drinks));
    this.loading.set(false);
  }

  // ---- Calendar ----

  protected changeMonth(delta: number) {
    const next = new Date(this.viewYear(), this.viewMonth() + delta, 1);
    this.viewYear.set(next.getFullYear());
    this.viewMonth.set(next.getMonth());
  }

  protected goToToday() {
    const today = new Date();
    this.viewYear.set(today.getFullYear());
    this.viewMonth.set(today.getMonth());
    this.selectDate(today);
  }

  protected selectDate(date: Date) {
    this.selectedDate.set(date);
    const key = toKey(date);
    this.moodNote.set(this.moods().find((entry) => entry.date === key)?.note ?? '');
    if (date.getMonth() !== this.viewMonth() || date.getFullYear() !== this.viewYear()) {
      this.viewYear.set(date.getFullYear());
      this.viewMonth.set(date.getMonth());
    }
  }

  // ---- Habits ----

  protected isHabitDone(habit: Habit): boolean {
    return habit.logs.some((log) => log.date === this.selectedKey() && log.done);
  }

  protected toggleHabit(habit: Habit) {
    const next = !this.isHabitDone(habit);
    const key = this.selectedKey();

    this.habits.set(
      this.habits().map((current) =>
        current.id === habit.id
          ? {
              ...current,
              logs: next
                ? [
                    ...current.logs.filter((log) => log.date !== key),
                    { id: `local-${Date.now()}`, date: key, done: true },
                  ]
                : current.logs.filter((log) => log.date !== key),
            }
          : current,
      ),
    );

    this.api.setHabitLog(habit.id, key, next).subscribe();
  }

  protected openHabitModal() {
    this.habitFormTitle.set('');
    this.habitFormEmoji.set('💧');
    this.habitFormSchedule.set('daily');
    this.habitFormWeekdays.set([]);
    this.habitFormDates.set([]);
    this.habitFormNote.set('');
    this.habitDateInput.set('');
    this.habitModalOpen.set(true);
  }

  protected closeHabitModal() {
    this.habitModalOpen.set(false);
  }

  protected setSchedule(type: HabitScheduleType) {
    this.habitFormSchedule.set(type);
  }

  protected toggleWeekday(day: number) {
    const current = this.habitFormWeekdays();
    this.habitFormWeekdays.set(
      current.includes(day)
        ? current.filter((selected) => selected !== day)
        : [...current, day].sort(),
    );
  }

  protected addHabitDate() {
    const value = this.habitDateInput().trim();
    if (!value || this.habitFormDates().includes(value)) {
      return;
    }
    this.habitFormDates.set([...this.habitFormDates(), value].sort());
    this.habitDateInput.set('');
  }

  protected removeHabitDate(date: string) {
    this.habitFormDates.set(this.habitFormDates().filter((current) => current !== date));
  }

  protected saveHabit() {
    const title = this.habitFormTitle().trim();
    const schedule = this.habitFormSchedule();

    if (!title) {
      return;
    }

    if (schedule === 'weekly' && this.habitFormWeekdays().length === 0) {
      this.notifications.error('Pick a day', 'Choose at least one weekday for this habit.');
      return;
    }

    if (schedule === 'dates' && this.habitFormDates().length === 0) {
      this.notifications.error('Pick a date', 'Add at least one date for this habit.');
      return;
    }

    const payload: HabitPayload = {
      title,
      emoji: this.habitFormEmoji(),
      scheduleType: schedule,
      weekdays: schedule === 'weekly' ? this.habitFormWeekdays() : [],
      dates: schedule === 'dates' ? this.habitFormDates() : [],
      note: this.habitFormNote().trim() || null,
    };

    this.api.createHabit(payload).subscribe({
      next: ({ habit }) => {
        this.habits.set([...this.habits(), habit]);
        this.habitModalOpen.set(false);
        this.notifications.success('Habit added', `"${habit.title}" is on your schedule.`);
      },
    });
  }

  protected scheduleLabel(habit: Habit): string {
    if (habit.scheduleType === 'weekly') {
      const names = habit.weekdays.map((day) => this.weekdayNames[day] ?? '');
      return names.length ? names.join(' · ') : 'No days yet';
    }

    if (habit.scheduleType === 'dates') {
      return habit.dates.length
        ? `${habit.dates.length} date${habit.dates.length === 1 ? '' : 's'}`
        : 'No dates yet';
    }

    return 'Every day';
  }

  protected removeHabit(habit: Habit) {
    this.habits.set(this.habits().filter((current) => current.id !== habit.id));
    this.api.deleteHabit(habit.id).subscribe();
  }

  // ---- To-dos ----

  protected addTodo() {
    const title = this.todoTitle().trim();
    if (!title) {
      return;
    }

    this.api.createTodo(title).subscribe({
      next: ({ todo }) => {
        this.todos.set([...this.todos(), todo]);
        this.todoTitle.set('');
      },
    });
  }

  protected toggleTodo(todo: TodoItem) {
    this.todos.set(
      this.todos().map((current) => (current.id === todo.id ? { ...current, done: !current.done } : current)),
    );
    this.api.updateTodo(todo.id, { done: !todo.done }).subscribe();
  }

  protected removeTodo(todo: TodoItem) {
    this.todos.set(this.todos().filter((current) => current.id !== todo.id));
    this.api.deleteTodo(todo.id).subscribe();
  }

  // ---- Mood ----

  protected moodEmoji(value: string): string {
    return this.moodOptions.find((option) => option.value === value)?.emoji ?? '';
  }

  protected moodLabel(value: string): string {
    return this.moodOptions.find((option) => option.value === value)?.label ?? value;
  }

  protected selectMood(value: string) {
    const key = this.selectedKey();
    const note = this.moodNote().trim() || null;

    this.moods.set([
      ...this.moods().filter((entry) => entry.date !== key),
      { id: `local-${Date.now()}`, date: key, mood: value, note },
    ]);

    this.api.setMood(key, value, note).subscribe();
    this.notifications.success('Mood saved', 'Your mood for this day is saved.');
  }

  // ---- Water ----

  protected adjustGlasses(delta: number) {
    const next = Math.max(0, Math.min(24, this.selectedGlasses() + delta));
    const key = this.selectedKey();

    this.drinks.set([
      ...this.drinks().filter((entry) => entry.date !== key),
      { id: `local-${Date.now()}`, date: key, glasses: next },
    ]);

    this.api.setDrinks(key, next).subscribe();
  }

  protected glassArray(count: number): number[] {
    return Array.from({ length: Math.min(count, this.waterGoal) }, (_, index) => index);
  }
}
