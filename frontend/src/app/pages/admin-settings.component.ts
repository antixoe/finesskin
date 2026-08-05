import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminApiService } from '../core/admin-api.service';
import { AuthService } from '../core/auth.service';
import { NotificationService } from '../core/notification.service';
import type { ActivityLog, PlatformSettings } from '../core/finesskin.models';

@Component({
  selector: 'app-admin-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-settings.component.html',
  styleUrl: './admin-pages.css',
})
export class AdminSettingsComponent implements OnInit {
  private readonly api = inject(AdminApiService);
  protected readonly authService = inject(AuthService);
  private readonly notifications = inject(NotificationService);

  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly formError = signal('');
  protected readonly activityLogs = signal<ActivityLog[]>([]);

  protected settings: PlatformSettings = {
    platformName: '',
    platformTagline: '',
    supportEmail: '',
    allowSignups: true,
    maintenanceMode: false,
  };

  ngOnInit() {
    this.api.getSettings().subscribe({
      next: (settings) => {
        this.settings = settings;
        this.loading.set(false);
        this.loadActivityLogs();
      },
      error: () => {
        this.loading.set(false);
        this.notifications.error('Could not load settings');
      },
    });
  }

  protected save(): void {
    if (!this.settings.platformName.trim() || !this.settings.supportEmail.trim()) {
      this.formError.set('Platform name and support email are required.');
      return;
    }

    this.saving.set(true);
    this.formError.set('');

    this.api
      .updateSettings({
        platformName: this.settings.platformName.trim(),
        platformTagline: this.settings.platformTagline.trim(),
        supportEmail: this.settings.supportEmail.trim(),
        allowSignups: this.settings.allowSignups,
        maintenanceMode: this.settings.maintenanceMode,
      })
      .subscribe({
        next: (settings) => {
          this.settings = settings;
          this.saving.set(false);
          this.loadActivityLogs();
          this.notifications.success('Settings saved', 'Platform configuration updated.');
        },
        error: (error) => {
          this.saving.set(false);
          this.formError.set(error?.error?.error ?? 'Unable to save settings.');
        },
      });
  }

  private loadActivityLogs(): void {
    if (!this.authService.isSuperAdmin()) {
      return;
    }

    this.api.getActivityLogs().subscribe({
      next: (logs) => this.activityLogs.set(logs),
      error: () => this.notifications.error('Could not load activity logs'),
    });
  }
}
