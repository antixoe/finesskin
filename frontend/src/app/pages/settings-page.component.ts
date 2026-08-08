import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppTheme, ThemeService } from '../core/theme.service';

@Component({
  selector: 'app-settings-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings-page.component.html',
  styleUrl: './settings-page.component.css',
})
export class SettingsPageComponent {
  protected readonly themeService = inject(ThemeService);
  protected reminders = this.readBoolean('finesskin-reminders', true);
  protected soundEffects = this.readBoolean('finesskin-sounds', true);
  protected emailUpdates = this.readBoolean('finesskin-email-updates', false);
  protected reduceMotion = this.readBoolean('finesskin-reduce-motion', false);
  protected compactLayout = this.readBoolean('finesskin-compact-layout', false);
  protected privateMode = this.readBoolean('finesskin-private-mode', true);
  protected displayName = localStorage.getItem('finesskin-display-name') ?? '';
  protected accountEmail = localStorage.getItem('finesskin-account-email') ?? '';
  protected language = localStorage.getItem('finesskin-language') ?? 'en';
  protected readonly languages = [
    { value: 'en', label: 'English' }, { value: 'th', label: 'ไทย (Thai)' },
    { value: 'es', label: 'Español (Spanish)' }, { value: 'fr', label: 'Français (French)' },
    { value: 'ja', label: '日本語 (Japanese)' }, { value: 'ko', label: '한국어 (Korean)' },
  ];
  protected savedMessage = '';
  protected readonly themes: { value: AppTheme; label: string; description: string }[] = [
    { value: 'blue', label: 'Ocean blue', description: 'The current Finesskin look.' },
    { value: 'pink', label: 'Soft pink', description: 'Warm, playful, and gentle.' },
    { value: 'purple', label: 'Lavender purple', description: 'Calm and dreamy.' },
    { value: 'green', label: 'Fresh green', description: 'Natural and refreshing.' },
  ];

  protected chooseTheme(theme: AppTheme): void {
    this.themeService.setTheme(theme);
    this.savedMessage = 'Appearance updated across Finesskin.';
  }

  protected savePersonalInfo(): void {
    localStorage.setItem('finesskin-display-name', this.displayName.trim());
    localStorage.setItem('finesskin-account-email', this.accountEmail.trim());
    localStorage.setItem('finesskin-language', this.language);
    document.documentElement.lang = this.language;
    this.savedMessage = 'Personal information saved on this device.';
  }


  protected savePreferences(): void {
    const values: Record<string, boolean> = {
      'finesskin-reminders': this.reminders,
      'finesskin-sounds': this.soundEffects,
      'finesskin-email-updates': this.emailUpdates,
      'finesskin-reduce-motion': this.reduceMotion,
      'finesskin-compact-layout': this.compactLayout,
      'finesskin-private-mode': this.privateMode,
    };
    Object.entries(values).forEach(([key, value]) => localStorage.setItem(key, String(value)));
    document.body.classList.toggle('reduce-motion', this.reduceMotion);
    document.body.classList.toggle('compact-layout', this.compactLayout);
    this.savedMessage = 'Your preferences are saved on this device.';
  }

  protected resetPreferences(): void {
    this.reminders = true;
    this.soundEffects = true;
    this.emailUpdates = false;
    this.reduceMotion = false;
    this.compactLayout = false;
    this.privateMode = true;
    this.savePreferences();
  }

  protected clearLocalPreferences(): void {
    ['finesskin-reminders','finesskin-sounds','finesskin-email-updates','finesskin-reduce-motion','finesskin-compact-layout','finesskin-private-mode'].forEach((key) => localStorage.removeItem(key));
    this.savedMessage = 'Local preferences cleared.';
  }

  private readBoolean(key: string, fallback: boolean): boolean {
    const value = localStorage.getItem(key);
    return value === null ? fallback : value === 'true';
  }
}
