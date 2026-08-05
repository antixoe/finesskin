import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../core/auth.service';
import { FinesskinApiService } from '../core/finesskin-api.service';
import { NotificationService } from '../core/notification.service';
import { buildSkinAnalysis } from '../core/finesskin.analysis';
import {
  scanSourceOptions,
  skinMetricCards,
  sourceLabel,
} from '../core/finesskin.constants';
import type { Product, ScanSource, SkinScan } from '../core/finesskin.models';

@Component({
  selector: 'app-scan-page',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  templateUrl: './scan-page.component.html',
})
export class ScanPageComponent implements OnInit {
  protected readonly authService = inject(AuthService);
  private readonly api = inject(FinesskinApiService);
  private readonly notifications = inject(NotificationService);

  protected readonly products = signal<Product[]>([]);
  protected readonly scans = signal<SkinScan[]>([]);
  protected readonly pending = signal(false);

  protected readonly scanSourceOptions = scanSourceOptions;
  protected readonly sourceLabel = sourceLabel;
  protected readonly skinMetricCards = skinMetricCards;

  protected readonly source = signal<ScanSource>('UPLOAD');
  protected readonly imageLabel = signal('demo-scan.jpg');
  protected readonly hydration = signal(74);
  protected readonly redness = signal(22);
  protected readonly acne = signal(28);
  protected readonly barrier = signal(81);

  protected readonly analysis = computed(() =>
    buildSkinAnalysis({
      hydration: this.hydration(),
      redness: this.redness(),
      acne: this.acne(),
      barrier: this.barrier(),
    }),
  );

  ngOnInit() {
    this.refresh();
  }

  protected refresh() {
    this.api.getProducts().subscribe((response) => this.products.set(response.products));
    this.api.getScans().subscribe((response) => this.scans.set(response.scans));
  }

  protected onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    this.imageLabel.set(input.files?.[0]?.name || this.imageLabel());
  }

  protected saveScan() {
    this.pending.set(true);
    this.api
      .createScan({
        source: this.source(),
        imageLabel: this.imageLabel(),
        ...this.analysis(),
      })
      .subscribe({
        next: () => {
          this.pending.set(false);
          this.notifications.success(
            'Scan saved',
            `Skin score ${this.analysis().score}/100 recorded to your history.`,
          );
          this.refresh();
        },
        error: () => {
          this.pending.set(false);
          this.notifications.error('Scan failed', 'Unable to save your analysis.');
        },
      });
  }
}
