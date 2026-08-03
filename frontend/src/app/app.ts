import { CommonModule } from '@angular/common';
import { Component, HostListener, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AuthModalService, AuthMode } from './core/auth-modal.service';

@Component({
  selector: 'app-root',
  imports: [CommonModule, FormsModule, RouterOutlet, RouterLink],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly authModal = inject(AuthModalService);
  private readonly router = inject(Router);
  protected authEmail = '';
  protected authPassword = '';
  protected authName = '';
  protected authError = '';
  protected authSuccess = '';

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
    this.resetFeedback();
  }

  protected submitAuth(): void {
    const email = this.authEmail.trim();
    const name = this.authName.trim();
    const isSignUp = this.authModal.mode() === 'signup';
    const previewIdentity = email || 'demo@finesskin.local';

    this.resetFeedback();

    this.authSuccess = isSignUp
      ? `Preview account created for ${name || previewIdentity}.`
      : `Preview access granted for ${previewIdentity}.`;

    window.setTimeout(() => {
      this.closeAuth();
      void this.router.navigateByUrl('/scan');
    }, 900);
  }

  @HostListener('document:keydown.escape')
  protected handleEscape(): void {
    if (this.authModal.isOpen()) {
      this.closeAuth();
    }
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
