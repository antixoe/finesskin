import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthModalService } from '../core/auth-modal.service';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="panel login-page">
      <p class="section-label">Login</p>
      <h1 class="headline-lg">Secure access coming next.</h1>
      <p class="lead-copy">
        This page is reserved for customer and admin sign-in. The landing page
        stays focused on introducing the brand, while the application tools live
        behind login.
      </p>
      <div class="button-row">
        <a routerLink="/" class="btn btn--secondary">Back to Home</a>
        <a routerLink="/scan" class="btn btn--primary">Open Demo Area</a>
      </div>
    </section>
  `,
})
export class LoginPageComponent {
  private readonly authModal = inject(AuthModalService);

  protected openAuth(): void {
    this.authModal.open('signin');
  }
}
