import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FinesskinApiService } from '../core/finesskin-api.service';
import {
  productCategoryLabel,
  productCategoryOptions,
  routineTimingLabel,
  routineTimingOptions,
} from '../core/finesskin.constants';
import type {
  Product,
  ProductCategory,
  ProductPayload,
  Routine,
  RoutineTiming,
} from '../core/finesskin.models';

type ProductForm = {
  name: string;
  category: ProductCategory;
  timing: RoutineTiming;
  brand: string;
  notes: string;
};

const emptyProductForm: ProductForm = {
  name: '',
  category: 'SERUM',
  timing: 'AM',
  brand: '',
  notes: '',
};

@Component({
  selector: 'app-routines-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './routines-page.component.html',
})
export class RoutinesPageComponent implements OnInit {
  private readonly api = inject(FinesskinApiService);

  protected readonly routines = signal<Routine[]>([]);
  protected readonly products = signal<Product[]>([]);
  protected readonly saving = signal(false);
  protected readonly editingProductId = signal<string | null>(null);

  protected readonly productCategoryOptions = productCategoryOptions;
  protected readonly routineTimingOptions = routineTimingOptions;
  protected readonly productCategoryLabel = productCategoryLabel;
  protected readonly routineTimingLabel = routineTimingLabel;
  protected readonly productForm = signal<ProductForm>({ ...emptyProductForm });

  protected readonly totalCompletions = computed(() =>
    this.routines().reduce((total, routine) => total + routine.completions.length, 0),
  );

  ngOnInit() {
    this.refresh();
  }

  protected refresh() {
    this.api.getRoutines().subscribe((response) => this.routines.set(response.routines));
    this.api.getProducts().subscribe((response) => this.products.set(response.products));
  }

  protected updateProductForm<K extends keyof ProductForm>(key: K, value: ProductForm[K]) {
    this.productForm.set({
      ...this.productForm(),
      [key]: value,
    });
  }

  protected saveProduct() {
    if (!this.productForm().name.trim()) {
      return;
    }

    this.saving.set(true);

    const payload: ProductPayload = { ...this.productForm() };
    const request = this.editingProductId()
      ? this.api.updateProduct(this.editingProductId()!, payload)
      : this.api.createProduct(payload);

    request.subscribe({
      next: () => {
        this.saving.set(false);
        this.resetProductForm();
        this.refresh();
      },
      error: () => {
        this.saving.set(false);
      },
    });
  }

  protected editProduct(product: Product) {
    this.editingProductId.set(product.id);
    this.productForm.set({
      name: product.name,
      category: product.category,
      timing: product.timing,
      brand: product.brand ?? '',
      notes: product.notes ?? '',
    });
  }

  protected deleteProduct(id: string) {
    this.api.deleteProduct(id).subscribe(() => this.refresh());
  }

  protected resetProductForm() {
    this.editingProductId.set(null);
    this.productForm.set({ ...emptyProductForm });
  }

  protected toggleRoutine(routine: Routine) {
    this.api
      .toggleRoutineCompletion(routine, !routine.completedToday)
      .subscribe(() => this.refresh());
  }

  protected toggleItem(routineId: string, itemId: string, isChecked: boolean) {
    this.api.toggleRoutineItem(routineId, itemId, isChecked).subscribe(() => this.refresh());
  }
}
