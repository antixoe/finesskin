import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { AdminApiService } from '../core/admin-api.service';
import { NotificationService } from '../core/notification.service';
import { routineTimingLabel } from '../core/finesskin.constants';
import type {
  AdminRoutine,
  AdminUser,
  RoutineTiming,
} from '../core/finesskin.models';

@Component({
  selector: 'app-admin-routines',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-routines.component.html',
  styleUrl: './admin-pages.css',
})
export class AdminRoutinesComponent implements OnInit {
  private readonly api = inject(AdminApiService);
  private readonly notifications = inject(NotificationService);

  protected readonly routines = signal<AdminRoutine[]>([]);
  protected readonly users = signal<AdminUser[]>([]);
  protected readonly loading = signal(true);
  protected readonly showForm = signal(false);
  protected readonly editingId = signal<string | null>(null);
  protected readonly saving = signal(false);
  protected readonly formError = signal('');

  protected formName = '';
  protected formUserId = '';
  protected formTiming: RoutineTiming = 'AM';
  protected formNotes = '';

  ngOnInit() {
    forkJoin({
      routines: this.api.getRoutines(),
      users: this.api.getUsers(),
    }).subscribe({
      next: ({ routines, users }) => {
        this.routines.set(routines);
        this.users.set(users);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.notifications.error('Could not load routines');
      },
    });
  }

  protected startCreate(): void {
    this.editingId.set(null);
    this.formName = '';
    this.formUserId = this.users()[0]?.id ?? '';
    this.formTiming = 'AM';
    this.formNotes = '';
    this.formError.set('');
    this.showForm.set(true);
  }

  protected startEdit(routine: AdminRoutine): void {
    this.editingId.set(routine.id);
    this.formName = routine.name;
    this.formUserId = routine.userId;
    this.formTiming = routine.timing;
    this.formNotes = routine.notes ?? '';
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
      timing: this.formTiming,
      notes: this.formNotes,
    };

    const request = editing
      ? this.api.updateRoutine(editing, payload)
      : this.api.createRoutine(payload);

    request.subscribe({
      next: () => {
        this.saving.set(false);
        this.showForm.set(false);
        this.editingId.set(null);
        if (editing) {
          this.notifications.success('Routine updated', `${name} has been updated.`);
        } else {
          this.notifications.success('Routine created', `${name} was added.`);
        }
        this.refresh();
      },
      error: (error) => {
        this.saving.set(false);
        this.formError.set(error?.error?.error ?? 'Unable to save routine.');
      },
    });
  }

  protected deleteRoutine(routine: AdminRoutine): void {
    const ok = window.confirm(
      `Delete routine "${routine.name}" for ${routine.user.name}?`,
    );

    if (!ok) {
      return;
    }

    this.api.deleteRoutine(routine.id).subscribe({
      next: () => {
        this.notifications.success('Routine deleted', `${routine.name} was removed.`);
        this.refresh();
      },
      error: (error) => {
        this.notifications.error('Delete failed', error?.error?.error ?? 'Unable to delete routine.');
      },
    });
  }

  protected refresh(): void {
    this.api.getRoutines().subscribe((routines) => this.routines.set(routines));
  }

  protected readonly timingLabel = routineTimingLabel;
}
