import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../core/auth.service';
import type { AdminStats } from '../core/finesskin.models';

@Component({
  selector: 'app-admin-dashboard-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-dashboard-page.component.html',
  styleUrl: './admin-pages.css',
})
export class AdminDashboardPageComponent implements OnInit {
  protected readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly stats = signal<AdminStats | null>(null);
  protected readonly loading = signal(true);
  protected readonly error = signal('');

  ngOnInit() {
    if (!this.authService.isAdmin()) {
      void this.router.navigateByUrl('/');
      return;
    }

    this.authService.getAdminStats().subscribe({
      next: (stats) => {
        this.stats.set(stats);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Unable to load platform stats. Please try again.');
        this.loading.set(false);
      },
    });
  }
}
