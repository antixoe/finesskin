import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { AdminApiService } from '../core/admin-api.service';
import { NotificationService } from '../core/notification.service';
import { sourceLabel } from '../core/finesskin.constants';
import type { AdminScan } from '../core/finesskin.models';

@Component({
  selector: 'app-admin-scans',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-scans.component.html',
  styleUrl: './admin-pages.css',
})
export class AdminScansComponent implements OnInit {
  private readonly api = inject(AdminApiService);
  private readonly notifications = inject(NotificationService);

  protected readonly scans = signal<AdminScan[]>([]);
  protected readonly loading = signal(true);

  ngOnInit() {
    this.refresh();
  }

  protected refresh(): void {
    this.loading.set(true);
    this.api.getScans().subscribe({
      next: (scans) => {
        this.scans.set(scans);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.notifications.error('Could not load scans');
      },
    });
  }

  protected deleteScan(scan: AdminScan): void {
    const ok = window.confirm(
      `Delete this scan (score ${scan.score}/100) by ${scan.user.name}?`,
    );

    if (!ok) {
      return;
    }

    this.api.deleteScan(scan.id).subscribe({
      next: () => {
        this.notifications.success('Scan deleted', `Scan by ${scan.user.name} was removed.`);
        this.refresh();
      },
      error: (error) => {
        this.notifications.error('Delete failed', error?.error?.error ?? 'Unable to delete scan.');
      },
    });
  }

  protected readonly sourceLabel = sourceLabel;
}
