import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FinesskinApiService } from '../core/finesskin-api.service';
import type { Habit, MoodEntry, TodoItem, DrinkLog } from '../core/finesskin.models';

type ReportPeriod = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';
type ChartType = 'bars' | 'trend' | 'donut';

function dateKey(date: Date): string { return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`; }
function daysBetween(start: string, end: string): string[] {
  const result: string[] = [];
  const cursor = new Date(`${start}T12:00:00`);
  const finish = new Date(`${end}T12:00:00`);
  while (cursor <= finish && result.length < 366) { result.push(dateKey(cursor)); cursor.setDate(cursor.getDate() + 1); }
  return result;
}
function habitDueOn(habit: Habit, key: string): boolean {
  const weekday = new Date(`${key}T12:00:00`).getDay();
  if (habit.scheduleType === 'weekly') return habit.weekdays.includes(weekday);
  if (habit.scheduleType === 'dates') return habit.dates.includes(key);
  return true;
}

@Component({ selector: 'app-reports-page', standalone: true, imports: [CommonModule, FormsModule], templateUrl: './reports-page.component.html', styleUrl: './reports-page.component.css' })
export class ReportsPageComponent implements OnInit {
  private readonly api = inject(FinesskinApiService);
  protected readonly period = signal<ReportPeriod>('weekly');
  protected readonly chartType = signal<ChartType>('bars');
  protected readonly endDate = signal(dateKey(new Date()));
  protected readonly startDate = signal(dateKey(new Date(Date.now() - 6 * 86400000)));
  protected readonly habits = signal<Habit[]>([]);
  protected readonly todos = signal<TodoItem[]>([]);
  protected readonly moods = signal<MoodEntry[]>([]);
  protected readonly drinks = signal<DrinkLog[]>([]);

  protected readonly selectedRange = computed(() => {
    if (this.period() !== 'custom') {
      const end = new Date();
      const days = ({ daily: 1, weekly: 7, monthly: 30, yearly: 365 } as Record<string, number>)[this.period()] ?? 7;
      const start = new Date(end); start.setDate(start.getDate() - days + 1);
      return { start: dateKey(start), end: dateKey(end) };
    }
    return { start: this.startDate(), end: this.endDate() };
  });
  protected readonly rangeKeys = computed(() => daysBetween(this.selectedRange().start, this.selectedRange().end));
  protected readonly rangeDays = computed(() => this.rangeKeys().length);
  protected readonly habitTotal = computed(() => this.rangeKeys().reduce((total, key) => total + this.habits().filter((habit) => habitDueOn(habit, key)).length, 0));
  protected readonly habitDone = computed(() => this.habits().reduce((total, habit) => total + habit.logs.filter((log) => log.done && this.rangeKeys().includes(log.date)).length, 0));
  protected readonly todoInRange = computed(() => this.todos().filter((todo) => !!todo.dueDate && this.rangeKeys().includes(todo.dueDate)));
  protected readonly todoDone = computed(() => this.todoInRange().filter((todo) => todo.done).length);
  protected readonly waterTotal = computed(() => this.drinks().filter((drink) => this.rangeKeys().includes(drink.date)).reduce((total, drink) => total + drink.glasses, 0));
  protected readonly moodTotal = computed(() => this.moods().filter((mood) => this.rangeKeys().includes(mood.date)).length);
  protected readonly completionRate = computed(() => this.habitTotal() ? Math.round((this.habitDone() / this.habitTotal()) * 100) : 0);
  protected readonly chartBars = computed(() => {
    const values = [this.habitDone(), this.todoDone(), this.waterTotal(), this.moodTotal()];
    const max = Math.max(...values, 1);
    return values.map((value, index) => ({ label: ['Habits', 'To-dos', 'Water', 'Mood'][index], value, height: Math.max(5, Math.round((value / max) * 100)) }));
  });
  protected readonly donutGradient = computed(() => {
    const values = this.chartBars().map((bar) => bar.value);
    const total = Math.max(values.reduce((sum, value) => sum + value, 0), 1);
    let cursor = 0;
    const colors = ['#139ce7', '#f59e0b', '#38bdf8', '#8b72d6'];
    return this.chartBars().map((bar, index) => { const end = cursor + (bar.value / total) * 100; const part = `${colors[index]} ${cursor}% ${end}%`; cursor = end; return part; }).join(', ');
  });

  ngOnInit(): void {
    this.api.getHabits().subscribe((response) => this.habits.set(response.habits));
    this.api.getTodos().subscribe((response) => this.todos.set(response.todos));
    this.api.getMoods().subscribe((response) => this.moods.set(response.moods));
    this.api.getDrinks().subscribe((response) => this.drinks.set(response.drinks));
  }

  protected setPeriod(period: ReportPeriod): void { this.period.set(period); }
  protected setChartType(type: ChartType): void { this.chartType.set(type); }
  protected applyCustomRange(): void { if (this.startDate() > this.endDate()) { const start = this.startDate(); this.startDate.set(this.endDate()); this.endDate.set(start); } this.period.set('custom'); }
}
