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
      <h1 class="headline-lg">Sign in to your account</h1>
      <p class="lead-copy">
        Use the account button in the navigation to sign in. Admins get access
        to the platform dashboard, while customers land in the demo scan studio.
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
