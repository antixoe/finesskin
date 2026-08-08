import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild, computed, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../core/auth.service';
import { FinesskinApiService } from '../core/finesskin-api.service';
import { NotificationService } from '../core/notification.service';
import { PhotoRollService, PhotoTargetType } from '../core/photo-roll.service';
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
  WaterUnit,
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
export class ClientDashboardPageComponent implements OnInit, OnDestroy {
  protected readonly authService = inject(AuthService);
  private readonly api = inject(FinesskinApiService);
  private readonly notifications = inject(NotificationService);
  private readonly photoRoll = inject(PhotoRollService);

  protected readonly habits = signal<Habit[]>([]);
  protected readonly todos = signal<TodoItem[]>([]);
  protected readonly moods = signal<MoodEntry[]>([]);
  protected readonly drinks = signal<DrinkLog[]>([]);
  protected readonly loading = signal(true);
  protected readonly celebrationVisible = signal(false);
  protected readonly confettiPieces = Array.from({ length: 28 }, (_, index) => index);
  private initialLoads = 0;
  private celebrationInitialized = false;
  private previousCompletion = false;
  protected readonly photoModalOpen = signal(false);
  protected readonly cameraActive = signal(false);
  protected readonly photoTarget = signal<{ type: PhotoTargetType; id: string; title: string } | null>(null);
  @ViewChild('cameraVideo') private cameraVideo?: ElementRef<HTMLVideoElement>;
  private cameraStream?: MediaStream;
  protected readonly musicMode = signal<'youtube' | 'spotify'>('youtube');
  protected readonly musicOpen = signal(false);
  protected readonly dashboardView = signal<'daily' | 'trackers' | 'chilling'>('daily');
  protected readonly hourlyQuotes = [
    'Small steps still count as progress.',
    'Take care of yourself like someone you love.',
    'Your pace is allowed to be gentle today.',
    'A little effort can change the whole mood.',
    'You are doing better than you think.',
    'Make today softer, one choice at a time.',
  ];
  protected readonly dailyQuote = signal('Small steps still count as progress.');
  protected readonly loadingPhrases = ['Making your space cozy', 'Gathering your routines', 'Adding a little sparkle'];
  protected readonly loadingPhrase = signal(this.loadingPhrases[0]);
  private quoteTimer?: number;
  private loadingTimer?: number;
  protected readonly musicRecommendations = [
    {
      title: 'Get ready with me · self-care playlist',
      description: 'Soft pop and feel-good tracks for your routine.',
      url: 'https://www.youtube.com/watch?v=tTvyucjygF0',
      accent: 'rose',
    },
    {
      title: 'Calm focus · girl therapy mix',
      description: 'A gentle background mix for study or work.',
      url: 'https://www.youtube.com/watch?v=zFJAI0e4GMA',
      accent: 'sky',
    },
    {
      title: 'Night routine · chill music',
      description: 'Slow down with a cozy evening soundtrack.',
      url: 'https://www.youtube.com/watch?v=BYTxPFj44uo',
      accent: 'violet',
    },
  ];

  protected readonly viewYear = signal(new Date().getFullYear());
  protected readonly viewMonth = signal(new Date().getMonth());
  protected readonly selectedDate = signal<Date>(new Date());
  protected readonly habitPage = signal(1);
  protected readonly todoPage = signal(1);
  protected readonly pageSize = 5;

  protected readonly todoTitle = signal('');
  protected readonly todoDate = signal(toKey(new Date()));
  protected readonly todoTime = signal('');
  protected readonly todoEditorOpen = signal(false);
  protected readonly todoEditorTarget = signal<TodoItem | null>(null);
  protected readonly rescheduleModalOpen = signal(false);
  protected readonly rescheduleTarget = signal<TodoItem | null>(null);
  protected readonly rescheduleDate = signal(toKey(new Date()));
  protected readonly rescheduleTime = signal('');
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
  protected waterGoal = waterGoalGlasses;
  protected readonly waterUnit = signal<WaterUnit>('glasses');
  protected readonly waterGoalEditorOpen = signal(false);
  protected readonly waterGoalDraft = signal(String(waterGoalGlasses));
  protected readonly waterUnitDraft = signal<WaterUnit>('glasses');
  protected readonly waterAdjustModalOpen = signal(false);
  protected readonly waterAdjustAmount = signal(1);

  protected readonly selectedKey = computed(() => toKey(this.selectedDate()));

  protected readonly selectedMood = computed(() =>
    this.moods().find((entry) => entry.date === this.selectedKey()),
  );

  protected readonly selectedGlasses = computed(
    () => this.drinks().find((entry) => entry.date === this.selectedKey())?.glasses ?? 0,
  );

  protected readonly waterGoalDisplay = computed(() =>
    this.waterUnit() === 'liters' ? this.waterGoal * 0.25 : this.waterGoal,
  );

  protected readonly selectedWaterDisplay = computed(() =>
    this.waterUnit() === 'liters' ? this.selectedGlasses() * 0.25 : this.selectedGlasses(),
  );

  protected readonly waterDisplayUnit = computed(() =>
    this.waterUnit() === 'liters' ? 'L' : 'glasses',
  );

  protected readonly visibleHabits = computed(() => {
    const key = this.selectedKey();
    const weekday = this.selectedDate().getDay();
    return this.habits().filter((habit) => habitDueOn(habit, key, weekday));
  });

  protected readonly pagedHabits = computed(() => {
    const start = (Math.min(this.habitPage(), this.habitPages()) - 1) * this.pageSize;
    return this.visibleHabits().slice(start, start + this.pageSize);
  });
  protected readonly habitPages = computed(() => Math.max(1, Math.ceil(this.visibleHabits().length / this.pageSize)));
  protected readonly pagedTodos = computed(() => {
    const start = (Math.min(this.todoPage(), this.todoPages()) - 1) * this.pageSize;
    return this.todos().slice(start, start + this.pageSize);
  });
  protected readonly todoPages = computed(() => Math.max(1, Math.ceil(this.todos().length / this.pageSize)));

  protected readonly habitsDone = computed(
    () =>
      this.visibleHabits().filter((habit) =>
        habit.logs.some((log) => log.date === this.selectedKey() && log.done),
      ).length,
  );

  protected readonly habitTotal = computed(() => this.visibleHabits().length);
  protected readonly doneTodos = computed(() => this.todos().filter((todo) => todo.done).length);
  protected readonly allGoalsComplete = computed(() =>
    this.visibleHabits().length > 0 && this.habitsDone() === this.habitTotal() &&
    this.todos().length > 0 && this.doneTodos() === this.todos().length &&
    !!this.selectedMood() &&
    this.selectedGlasses() >= this.waterGoal,
  );
  protected readonly waterPercent = computed(() =>
    Math.min(100, Math.round((this.selectedGlasses() / Math.max(1, this.waterGoal)) * 100)),
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

  constructor() {
    this.refreshHourlyQuote();
    this.quoteTimer = window.setInterval(() => this.refreshHourlyQuote(), 60 * 60 * 1000);
    let loadingIndex = 0;
    this.loadingTimer = window.setInterval(() => {
      loadingIndex = (loadingIndex + 1) % this.loadingPhrases.length;
      this.loadingPhrase.set(this.loadingPhrases[loadingIndex]);
    }, 1400);
    effect(() => {
      const complete = this.allGoalsComplete();
      if (this.loading()) return;
      if (!this.celebrationInitialized) {
        this.celebrationInitialized = true;
        this.previousCompletion = complete;
        return;
      }
      if (!complete || this.previousCompletion) {
        this.previousCompletion = complete;
        return;
      }
      this.previousCompletion = true;
      this.celebrationVisible.set(true);
      window.setTimeout(() => this.celebrationVisible.set(false), 6500);
    });
  }

  protected dismissCelebration(): void { this.celebrationVisible.set(false); }

  protected refresh() {
    this.initialLoads = 0;
    this.loading.set(true);
    this.api.getHabits().subscribe((response) => { this.habits.set(response.habits); this.finishInitialLoad(); });
    this.api.getTodos().subscribe((response) => { this.todos.set(response.todos); this.finishInitialLoad(); });
    this.api.getMoods().subscribe((response) => { this.moods.set(response.moods); this.finishInitialLoad(); });
    this.api.getDrinks().subscribe((response) => { this.drinks.set(response.drinks); this.finishInitialLoad(); });
    this.api.getWaterGoal().subscribe((response) => {
      this.waterGoal = Math.max(1, Math.min(24, Number(response.goal) || waterGoalGlasses));
      this.waterUnit.set(response.unit);
      this.waterUnitDraft.set(response.unit);
      this.waterGoalDraft.set(String(response.unit === 'liters' ? response.goal * 0.25 : response.goal));
      this.finishInitialLoad();
    });
  }

  private finishInitialLoad(): void {
    this.initialLoads += 1;
    if (this.initialLoads >= 5) this.loading.set(false);
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

    this.api.createTodo(title, this.todoDate(), this.todoTime() || undefined).subscribe({
      next: ({ todo }) => {
        this.todos.set([...this.todos(), todo]);
        this.todoTitle.set('');
        this.todoDate.set(toKey(new Date()));
        this.todoTime.set('');
      },
    });
  }

  protected openTodoEditor(todo?: TodoItem): void {
    this.todoEditorTarget.set(todo ?? null);
    this.todoTitle.set(todo?.title ?? '');
    this.todoDate.set(todo?.dueDate || toKey(new Date()));
    this.todoTime.set(todo?.dueTime || '');
    this.todoEditorOpen.set(true);
  }

  protected closeTodoEditor(): void { this.todoEditorOpen.set(false); this.todoEditorTarget.set(null); }

  protected saveTodoEditor(): void {
    const title = this.todoTitle().trim();
    if (!title) return;
    const target = this.todoEditorTarget();
    const patch = { title, dueDate: this.todoDate() || null, dueTime: this.todoTime() || null };
    if (target) {
      this.todos.set(this.todos().map((todo) => todo.id === target.id ? { ...todo, ...patch } : todo));
      this.api.updateTodo(target.id, patch).subscribe();
    } else {
      this.api.createTodo(title, this.todoDate(), this.todoTime() || undefined).subscribe(({ todo }) => this.todos.set([todo, ...this.todos()]));
    }
    this.closeTodoEditor();
  }

  protected deleteTodoFromEditor(): void {
    const target = this.todoEditorTarget();
    if (!target) return;
    this.removeTodo(target);
    this.closeTodoEditor();
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

  protected todoIsOverdue(todo: TodoItem): boolean {
    if (todo.done || !todo.dueDate) return false;
    const due = new Date(`${todo.dueDate}T${todo.dueTime || '23:59'}`);
    return due.getTime() < Date.now();
  }

  protected openReschedule(todo: TodoItem): void {
    this.rescheduleTarget.set(todo);
    this.rescheduleDate.set(todo.dueDate || toKey(new Date()));
    this.rescheduleTime.set(todo.dueTime || '');
    this.rescheduleModalOpen.set(true);
  }

  protected closeReschedule(): void {
    this.rescheduleModalOpen.set(false);
    this.rescheduleTarget.set(null);
  }

  protected moveTodoTomorrow(): void {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    this.rescheduleDate.set(toKey(tomorrow));
    this.saveReschedule();
  }

  protected saveReschedule(): void {
    const todo = this.rescheduleTarget();
    if (!todo) return;
    const patch = { dueDate: this.rescheduleDate(), dueTime: this.rescheduleTime() || null };
    this.todos.set(this.todos().map((current) => current.id === todo.id ? { ...current, ...patch } : current));
    this.api.updateTodo(todo.id, patch).subscribe();
    this.closeReschedule();
    this.notifications.success('To-do rescheduled', 'The new time has been saved.');
  }

  protected openPhotoModal(type: PhotoTargetType, id: string, title: string): void {
    this.photoTarget.set({ type, id, title });
    this.photoModalOpen.set(true);
  }

  protected closePhotoModal(): void {
    this.stopCamera();
    this.photoModalOpen.set(false);
    this.photoTarget.set(null);
  }

  protected async startCamera(): Promise<void> {
    if (!navigator.mediaDevices?.getUserMedia) {
      this.notifications.error('Camera unavailable', 'Your browser does not support camera access.');
      return;
    }

    try {
      this.cameraStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
      this.cameraActive.set(true);
      setTimeout(() => {
        if (this.cameraVideo?.nativeElement && this.cameraStream) {
          this.cameraVideo.nativeElement.srcObject = this.cameraStream;
        }
      });
    } catch {
      this.notifications.error('Camera permission needed', 'Allow camera access or choose an existing photo instead.');
    }
  }

  protected stopCamera(): void {
    this.cameraStream?.getTracks().forEach((track) => track.stop());
    this.cameraStream = undefined;
    this.cameraActive.set(false);
  }

  protected captureCameraPhoto(): void {
    const video = this.cameraVideo?.nativeElement;
    if (!video || !video.videoWidth || !video.videoHeight) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')?.drawImage(video, 0, 0);
    this.savePhotoData(canvas.toDataURL('image/jpeg', 0.88));
    this.closePhotoModal();
  }

  protected saveProgressPhoto(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    const target = this.photoTarget();
    if (!file || !target) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string') return;
      this.savePhotoData(reader.result);
      this.closePhotoModal();
    };
    reader.readAsDataURL(file);
  }

  private savePhotoData(dataUrl: string): void {
    const target = this.photoTarget();
    if (!target) return;
    this.photoRoll.add({ targetType: target.type, targetId: target.id, targetTitle: target.title, dataUrl });
    this.notifications.success('Photo saved', 'Your progress photo is in Camera Roll.');
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

  protected openWaterAdjustModal(): void {
    this.waterAdjustAmount.set(1);
    this.waterAdjustModalOpen.set(true);
  }

  protected closeWaterAdjustModal(): void {
    this.waterAdjustModalOpen.set(false);
  }

  protected applyWaterAdjustment(): void {
    const amount = Math.max(1, Math.min(24, Math.round(Number(this.waterAdjustAmount()) || 1)));
    this.adjustGlasses(amount);
    this.closeWaterAdjustModal();
    this.notifications.success('Water logged', `${amount} ${amount === 1 ? 'glass' : 'glasses'} added.`);
  }

  protected openWaterGoalEditor(): void {
    this.waterGoalDraft.set(String(this.waterUnit() === 'liters' ? this.waterGoal * 0.25 : this.waterGoal));
    this.waterUnitDraft.set(this.waterUnit());
    this.waterGoalEditorOpen.set(true);
  }

  protected closeWaterGoalEditor(): void {
    this.waterGoalEditorOpen.set(false);
  }

  protected saveWaterGoal(): void {
    const entered = Number(this.waterGoalDraft());
    if (!Number.isFinite(entered) || entered <= 0) {
      this.notifications.error('Invalid goal', 'Enter a water goal greater than zero.');
      return;
    }

    const unit = this.waterUnitDraft();
    const goal = unit === 'liters' ? Math.round(entered / 0.25) : Math.round(entered);
    const normalizedGoal = Math.max(1, Math.min(24, goal));

    this.waterGoal = normalizedGoal;
    this.waterUnit.set(unit);
    this.waterGoalEditorOpen.set(false);
    this.api.updateWaterGoal(normalizedGoal, unit).subscribe();
    this.notifications.success('Water goal saved', `Your daily goal is ${unit === 'liters' ? `${(normalizedGoal * 0.25).toFixed(2)} L` : `${normalizedGoal} glasses`}.`);
  }

  protected resetWaterGoal(): void {
    this.waterGoal = waterGoalGlasses;
    this.waterUnit.set('glasses');
    this.waterGoalDraft.set(String(waterGoalGlasses));
    this.waterUnitDraft.set('glasses');
    this.waterGoalEditorOpen.set(false);
    this.api.resetWaterGoal().subscribe();
    this.notifications.success('Water goal reset', 'Your goal is back to 8 glasses.');
  }

  protected glassArray(count: number): number[] {
    return Array.from({ length: Math.min(count, this.waterGoal) }, (_, index) => index);
  }

  protected setMusicMode(mode: 'youtube' | 'spotify'): void {
    this.musicMode.set(mode);
    this.musicOpen.set(true);
  }

  protected get dashboardMiniMessage(): string {
    return this.musicOpen() ? `Now playing · ${this.musicMode() === 'youtube' ? 'YouTube picks' : 'Spotify playlist'}` : this.dailyQuote();
  }

  private refreshHourlyQuote(): void {
    const hour = new Date().getHours();
    this.dailyQuote.set(this.hourlyQuotes[hour % this.hourlyQuotes.length]);
  }

  protected selectDashboardView(view: 'daily' | 'trackers' | 'chilling'): void {
    this.dashboardView.set(view);
  }

  protected setHabitPage(page: number): void { this.habitPage.set(Math.max(1, Math.min(page, this.habitPages()))); }
  protected setTodoPage(page: number): void { this.todoPage.set(Math.max(1, Math.min(page, this.todoPages()))); }

  ngOnDestroy(): void {
    if (this.quoteTimer) window.clearInterval(this.quoteTimer);
    if (this.loadingTimer) window.clearInterval(this.loadingTimer);
  }
}
