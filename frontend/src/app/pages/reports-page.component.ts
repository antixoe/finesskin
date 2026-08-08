import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FinesskinApiService } from '../core/finesskin-api.service';
import type { Habit, MoodEntry, TodoItem, DrinkLog } from '../core/finesskin.models';

type ReportPeriod = 'daily' | 'weekly' | 'monthly' | 'yearly';

@Component({ selector: 'app-reports-page', standalone: true, imports: [CommonModule], templateUrl: './reports-page.component.html', styleUrl: './reports-page.component.css' })
export class ReportsPageComponent implements OnInit {
  private readonly api = inject(FinesskinApiService);
  protected readonly period = signal<ReportPeriod>('weekly');
  protected readonly habits = signal<Habit[]>([]);
  protected readonly todos = signal<TodoItem[]>([]);
  protected readonly moods = signal<MoodEntry[]>([]);
  protected readonly drinks = signal<DrinkLog[]>([]);

  protected readonly rangeDays = computed(() => ({ daily: 1, weekly: 7, monthly: 30, yearly: 365 }[this.period()]));
  protected readonly habitTotal = computed(() => this.habits().reduce((total, habit) => total + habit.logs.length, 0));
  protected readonly habitDone = computed(() => this.habits().reduce((total, habit) => total + habit.logs.filter((log) => log.done).length, 0));
  protected readonly todoDone = computed(() => this.todos().filter((todo) => todo.done).length);
  protected readonly waterTotal = computed(() => this.drinks().reduce((total, drink) => total + drink.glasses, 0));
  protected readonly chartBars = computed(() => {
    const values = this.period() === 'daily' ? [this.habitDone(), this.todoDone(), this.waterTotal()] : [this.habitDone(), this.todoDone(), this.waterTotal(), this.moods().length];
    const max = Math.max(...values, 1);
    return values.map((value, index) => ({ label: ['Habits', 'To-dos', 'Water', 'Mood'][index], value, height: Math.round((value / max) * 100) }));
  });

  ngOnInit(): void {
    this.api.getHabits().subscribe((response) => this.habits.set(response.habits));
    this.api.getTodos().subscribe((response) => this.todos.set(response.todos));
    this.api.getMoods().subscribe((response) => this.moods.set(response.moods));
    this.api.getDrinks().subscribe((response) => this.drinks.set(response.drinks));
  }

  protected setPeriod(period: ReportPeriod): void { this.period.set(period); }
}
