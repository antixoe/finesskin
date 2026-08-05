import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminApiService } from '../core/admin-api.service';
import { AuthService } from '../core/auth.service';
import { NotificationService } from '../core/notification.service';
import type { AdminPermission, AdminUser, UserRole } from '../core/finesskin.models';

@Component({
  selector: 'app-admin-roles',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-roles.component.html',
  styleUrl: './admin-pages.css',
})
export class AdminRolesComponent implements OnInit {
  private readonly api = inject(AdminApiService);
  protected readonly authService = inject(AuthService);
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
  protected formPermissions: AdminPermission[] = [];
  protected readonly permissionOptions: Array<{ value: AdminPermission; label: string }> = [
    { value: 'DASHBOARD', label: 'Dashboard overview' },
    { value: 'USERS', label: 'Users management' },
    { value: 'ROLES', label: 'Roles management' },
    { value: 'ROUTINES', label: 'Routines management' },
    { value: 'SCANS', label: 'Scans management' },
    { value: 'SETTINGS', label: 'Settings management' },
  ];

  ngOnInit() {
    this.refresh();
  }

  protected refresh(): void {
    this.loading.set(true);
    this.api.getUsers().subscribe({
      next: (users) => {
        this.users.set(users);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.notifications.error('Could not load role assignments');
      },
    });
  }

  protected startCreate(): void {
    this.editingId.set(null);
    this.formName = '';
    this.formEmail = '';
    this.formPassword = '';
    this.formRole = 'CUSTOMER';
    this.formPermissions = [];
    this.formError.set('');
    this.showForm.set(true);
  }

  protected startEdit(user: AdminUser): void {
    this.editingId.set(user.id);
    this.formName = user.name;
    this.formEmail = user.email;
    this.formPassword = '';
    this.formRole = user.role;
    this.formPermissions = [...user.permissions];
    this.formError.set('');
    this.showForm.set(true);
  }

  protected cancelForm(): void {
    this.showForm.set(false);
    this.editingId.set(null);
    this.formError.set('');
  }

  protected togglePermission(permission: AdminPermission, checked: boolean): void {
    if (checked) {
      this.formPermissions = Array.from(new Set([...this.formPermissions, permission]));
      return;
    }

    this.formPermissions = this.formPermissions.filter((item) => item !== permission);
  }

  protected hasFormPermission(permission: AdminPermission): boolean {
    return this.formPermissions.includes(permission);
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
          permissions: this.formRole === 'ADMIN' ? this.formPermissions : [],
          ...(this.formPassword ? { password: this.formPassword } : {}),
        })
      : this.api.createUser({
          name,
          email,
          password: this.formPassword,
          role: this.formRole,
          permissions: this.formRole === 'ADMIN' ? this.formPermissions : [],
        });

    request.subscribe({
      next: () => {
        this.saving.set(false);
        this.showForm.set(false);
        this.editingId.set(null);
        this.notifications.success(
          editing ? 'Role updated' : 'Role assignment created',
          `${name} is now ${this.roleLabel(this.formRole)}.`,
        );
        this.refresh();
      },
      error: (error) => {
        this.saving.set(false);
        this.formError.set(error?.error?.error ?? 'Unable to save role assignment.');
      },
    });
  }

  protected deleteAssignment(user: AdminUser): void {
    const ok = window.confirm(`Delete ${user.name} (${user.email}) from role management?`);

    if (!ok) {
      return;
    }

    this.api.deleteUser(user.id).subscribe({
      next: () => {
        this.notifications.success('Role assignment deleted', `${user.name} was removed.`);
        this.refresh();
      },
      error: (error) => {
        this.notifications.error('Delete failed', error?.error?.error ?? 'Unable to delete role assignment.');
      },
    });
  }

  protected roleLabel(role: UserRole): string {
    if (role === 'SUPER_ADMIN') {
      return 'Super Admin';
    }

    return role === 'ADMIN' ? 'Admin' : 'Customer';
  }

  protected roleCount(role: UserRole): number {
    return this.users().filter((user) => user.role === role).length;
  }
}
