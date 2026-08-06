import { CommonModule } from '@angular/common';
import { Component, HostListener, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthModalService, AuthMode } from './core/auth-modal.service';
import { AuthService } from './core/auth.service';
import { NotificationContainerComponent } from './core/notification-container.component';
import { NotificationService } from './core/notification.service';

@Component({
  selector: 'app-root',
  imports: [CommonModule, FormsModule, RouterOutlet, RouterLink, RouterLinkActive, NotificationContainerComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly authModal = inject(AuthModalService);
  protected readonly authService = inject(AuthService);
  private readonly notifications = inject(NotificationService);
  private readonly router = inject(Router);
  protected authEmail = '';
  protected authPassword = '';
  protected authName = '';
  protected authError = '';
  protected authSuccess = '';
  protected readonly authBusy = signal(false);
  protected readonly showPassword = signal(false);

  protected openAuth(mode: AuthMode): void {
    this.resetFeedback();
    this.authModal.open(mode);
    this.syncBodyScroll();
  }

  protected closeAuth(): void {
    this.authModal.close();
    this.resetFields();
    this.resetFeedback();
    this.syncBodyScroll();
  }

  protected setAuthMode(mode: AuthMode): void {
    this.authModal.setMode(mode);
    this.authPassword = '';
    this.showPassword.set(false);
    this.resetFeedback();
  }

  protected togglePassword(): void {
    this.showPassword.update((visible) => !visible);
  }

  protected submitAuth(): void {
    const email = this.authEmail.trim();
    const password = this.authPassword;
    const name = this.authName.trim();
    const isSignUp = this.authModal.mode() === 'signup';

    if (!email || !password || (isSignUp && !name)) {
      this.authError = 'Please fill in all required fields.';
      return;
    }

    this.authBusy.set(true);
    this.resetFeedback();

    const startedAt = Date.now();
    const MIN_LOADING_MS = 900;

    const request = isSignUp
      ? this.authService.signUp(name, email, password)
      : this.authService.signIn(email, password);

    request.subscribe({
      next: (response) => {
        this.releaseBusy(startedAt, MIN_LOADING_MS);
        const isAdmin = response.user.role === 'ADMIN' || response.user.role === 'SUPER_ADMIN';

        this.authSuccess = isSignUp
          ? `Hi, ${response.user.name}! Your account is ready.`
          : `Hi, ${response.user.name}! Great to see you again.`;

        this.notifications.success(
          isSignUp ? 'Welcome to Finesskin' : `Hi, ${response.user.name}!`,
          isSignUp
            ? 'Your account is ready. Start tracking your skin.'
            : 'Signed in successfully.',
        );

        window.setTimeout(() => {
          this.closeAuth();
          void this.router.navigateByUrl(isAdmin ? '/dashboard' : '/home');
        }, 900);
      },
      error: (error) => {
        this.releaseBusy(startedAt, MIN_LOADING_MS);
        const message = error?.error?.error ?? 'Unable to sign in. Please try again.';
        this.authError = message;
        this.notifications.error(isSignUp ? 'Sign up failed' : 'Sign in failed', message);
      },
    });
  }

  protected signOut(): void {
    const name = this.authService.user()?.name ?? 'Goodbye';
    this.authService.signOut();
    this.notifications.info('Signed out', `${name}, see you next time!`);
    void this.router.navigateByUrl('/');
  }

  @HostListener('document:keydown.escape')
  protected handleEscape(): void {
    if (this.authModal.isOpen()) {
      this.closeAuth();
    }
  }

  private releaseBusy(startedAt: number, minMs: number): void {
    const elapsed = Date.now() - startedAt;
    const remaining = Math.max(minMs - elapsed, 0);

    window.setTimeout(() => this.authBusy.set(false), remaining);
  }

  private resetFields(): void {
    this.authEmail = '';
    this.authPassword = '';
    this.authName = '';
  }

  private resetFeedback(): void {
    this.authError = '';
    this.authSuccess = '';
  }

  private syncBodyScroll(): void {
    document.body.style.overflow = this.authModal.isOpen() ? 'hidden' : '';
  }
}
