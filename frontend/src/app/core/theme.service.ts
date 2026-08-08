import { Injectable, signal } from '@angular/core';

export type AppTheme = 'blue' | 'pink' | 'purple' | 'green';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly theme = signal<AppTheme>(this.readTheme());

  constructor() {
    this.apply(this.theme());
    document.body.removeAttribute('data-mode');
    localStorage.removeItem('finesskin-mode');
  }


  setTheme(theme: AppTheme): void {
    this.theme.set(theme);
    localStorage.setItem('finesskin-theme', theme);
    this.apply(theme);
  }

  private readTheme(): AppTheme {
    const value = localStorage.getItem('finesskin-theme');
    return value === 'pink' || value === 'purple' || value === 'green' ? value : 'blue';
  }

  private apply(theme: AppTheme): void {
    document.body.dataset['theme'] = theme;
  }

}
