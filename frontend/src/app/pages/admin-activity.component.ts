import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { AdminApiService } from '../core/admin-api.service';
import type { ActivityLog } from '../core/finesskin.models';

@Component({
  selector: 'app-admin-activity',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-activity.component.html',
  styleUrl: './admin-pages.css',
})
export class AdminActivityComponent implements OnInit {
  private readonly api = inject(AdminApiService);
  protected readonly logs = signal<ActivityLog[]>([]);
  protected readonly loading = signal(true);

  ngOnInit(): void {
    this.api.getActivityLogs().subscribe({
      next: (logs) => { this.logs.set(logs); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }
}
