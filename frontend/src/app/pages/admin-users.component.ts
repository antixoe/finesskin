import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminApiService } from '../core/admin-api.service';
import { NotificationService } from '../core/notification.service';
import type { AdminUser, UserRole } from '../core/finesskin.models';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-users.component.html',
  styleUrl: './admin-pages.css',
})
export class AdminUsersComponent implements OnInit {
  private readonly api = inject(AdminApiService);
  private readonly notifications = inject(NotificationService);

  protected readonly users = signal<AdminUser[]>([]);
  protected readonly loading = signal(true);
  protected readonly showForm = signal(false);
  protected readonly editingId = signal<string | null>(null);
  protected readonly saving = signal(false);
  protected readonly formError = signal('');

  protected formName = '';
  protected formEmail = '';
  protected formPassword = '';
  protected formRole: UserRole = 'CUSTOMER';

  ngOnInit() {
    this.refresh();
  }

  protected refresh() {
    this.loading.set(true);
    this.api.getUsers().subscribe({
      next: (users) => {
        this.users.set(users);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.notifications.error('Could not load users');
      },
    });
  }

  protected startCreate(): void {
    this.editingId.set(null);
    this.formName = '';
    this.formEmail = '';
    this.formPassword = '';
    this.formRole = 'CUSTOMER';
    this.formError.set('');
    this.showForm.set(true);
  }

  protected startEdit(user: AdminUser): void {
    this.editingId.set(user.id);
    this.formName = user.name;
    this.formEmail = user.email;
    this.formPassword = '';
    this.formRole = user.role;
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
    const email = this.formEmail.trim();
    const editing = this.editingId();

    if (!name || !email) {
      this.formError.set('Name and email are required.');
      return;
    }

    if (!editing && this.formPassword.length < 6) {
      this.formError.set('Password must be at least 6 characters.');
      return;
    }

    this.saving.set(true);
    this.formError.set('');

    const request = editing
      ? this.api.updateUser(editing, {
          name,
          email,
          role: this.formRole,
          ...(this.formPassword ? { password: this.formPassword } : {}),
        })
      : this.api.createUser({
          name,
          email,
          password: this.formPassword,
          role: this.formRole,
        });

    request.subscribe({
      next: () => {
        this.saving.set(false);
        this.showForm.set(false);
        this.editingId.set(null);
        if (editing) {
          this.notifications.success('User updated', `${name} has been updated.`);
        } else {
          this.notifications.success('User created', `${name} now has an account.`);
        }
        this.refresh();
      },
      error: (error) => {
        this.saving.set(false);
        this.formError.set(error?.error?.error ?? 'Unable to save user.');
      },
    });
  }

  protected deleteUser(user: AdminUser): void {
    const ok = window.confirm(
      `Delete ${user.name} (${user.email})? This removes their products, routines, and scans too.`,
    );

    if (!ok) {
      return;
    }

    this.api.deleteUser(user.id).subscribe({
      next: () => {
        this.notifications.success('User deleted', `${user.name} was removed.`);
        this.refresh();
      },
      error: (error) => {
        this.notifications.error('Delete failed', error?.error?.error ?? 'Unable to delete user.');
      },
    });
  }

  protected roleLabel(role: UserRole): string {
    return role === 'ADMIN' ? 'Admin' : 'Customer';
  }
}
