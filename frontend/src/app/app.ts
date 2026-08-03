import { CommonModule } from '@angular/common';
import { Component, HostListener, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterOutlet } from '@angular/router';
import { AuthModalService, AuthMode } from './core/auth-modal.service';

@Component({
  selector: 'app-root',
  imports: [CommonModule, FormsModule, RouterOutlet, RouterLink],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly authModal = inject(AuthModalService);
  protected authEmail = '';
  protected authPassword = '';
  protected authName = '';

  protected openAuth(mode: AuthMode): void {
    this.authModal.open(mode);
  }

  protected closeAuth(): void {
    this.authModal.close();
  }

  protected setAuthMode(mode: AuthMode): void {
    this.authModal.setMode(mode);
  }

  protected submitAuth(): void {
    this.authModal.close();
  }

  @HostListener('document:keydown.escape')
  protected handleEscape(): void {
    if (this.authModal.isOpen()) {
      this.closeAuth();
    }
  }
}
