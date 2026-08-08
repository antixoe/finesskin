import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { AdminApiService } from '../core/admin-api.service';
import { NotificationService } from '../core/notification.service';
import { productCategoryLabel, productCategoryOptions } from '../core/finesskin.constants';
import type {
  AdminProduct,
  AdminUser,
  ProductCategory,
  RoutineTiming,
} from '../core/finesskin.models';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-products.component.html',
  styleUrl: './admin-pages.css',
})
export class AdminProductsComponent implements OnInit {
  private readonly api = inject(AdminApiService);
  private readonly notifications = inject(NotificationService);

  protected readonly products = signal<AdminProduct[]>([]);
  protected readonly users = signal<AdminUser[]>([]);
  protected readonly loading = signal(true);
  protected readonly showForm = signal(false);
  protected readonly editingId = signal<string | null>(null);
  protected readonly saving = signal(false);
  protected readonly formError = signal('');

  protected readonly productCategories = productCategoryOptions;

  protected formName = '';
  protected formUserId = '';
  protected formCategory: ProductCategory = 'SERUM';
  protected formTiming: RoutineTiming = 'AM';
  protected formBrand = '';
  protected formNotes = '';
  protected formActive = true;

  ngOnInit() {
    forkJoin({
      products: this.api.getProducts(),
      users: this.api.getUsers(),
    }).subscribe({
      next: ({ products, users }) => {
        this.products.set(products);
        this.users.set(users);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.notifications.error('Could not load products');
      },
    });
  }

  protected startCreate(): void {
    this.editingId.set(null);
    this.formName = '';
    this.formUserId = this.users()[0]?.id ?? '';
    this.formCategory = 'SERUM';
    this.formTiming = 'AM';
    this.formBrand = '';
    this.formNotes = '';
    this.formActive = true;
    this.formError.set('');
    this.showForm.set(true);
  }

  protected startEdit(product: AdminProduct): void {
    this.editingId.set(product.id);
    this.formName = product.name;
    this.formUserId = product.userId;
    this.formCategory = product.category;
    this.formTiming = product.timing;
    this.formBrand = product.brand ?? '';
    this.formNotes = product.notes ?? '';
    this.formActive = product.isActive;
    this.formError.set('');
    this.showForm.set(true);
  }

  protected cancelForm(): void {
    this.showForm.set(false);
    this.editingId.set(null);
    this.formError.set('');
  }

  protected save(): void {
    const name = this.formName.trim();
    const editing = this.editingId();

    if (!name || !this.formUserId) {
      this.formError.set('Name and owner are required.');
      return;
    }

    this.saving.set(true);
    this.formError.set('');

    const payload = {
      userId: this.formUserId,
      name,
      category: this.formCategory,
      timing: this.formTiming,
      brand: this.formBrand,
      notes: this.formNotes,
      isActive: this.formActive,
    };

    const request = editing
      ? this.api.updateProduct(editing, payload)
      : this.api.createProduct(payload);

    request.subscribe({
      next: () => {
        this.saving.set(false);
        this.showForm.set(false);
        this.editingId.set(null);
        if (editing) {
          this.notifications.success('Product updated', `${name} has been updated.`);
        } else {
          this.notifications.success('Product created', `${name} was added to the library.`);
        }
        this.refresh();
      },
      error: (error) => {
        this.saving.set(false);
        this.formError.set(error?.error?.error ?? 'Unable to save product.');
      },
    });
  }

  protected deleteProduct(product: AdminProduct): void {
    const ok = window.confirm(`Delete "${product.name}"?`);

    if (!ok) {
      return;
    }

    this.api.deleteProduct(product.id).subscribe({
      next: () => {
        this.notifications.success('Product deleted', `${product.name} was removed.`);
        this.refresh();
      },
      error: (error) => {
        this.notifications.error('Delete failed', error?.error?.error ?? 'Unable to delete product.');
      },
    });
  }

  protected refresh(): void {
    this.api.getProducts().subscribe((products) => this.products.set(products));
  }

  protected readonly categoryLabel = (category: ProductCategory): string => productCategoryLabel[category];
}
