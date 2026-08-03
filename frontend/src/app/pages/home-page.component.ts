import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { featureCards, skinGoals } from '../core/finesskin.constants';
import { AuthModalService } from '../core/auth-modal.service';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home-page.component.html',
})
export class HomePageComponent {
  private readonly authModal = inject(AuthModalService);
  protected readonly featureCards = featureCards;
  protected readonly skinGoals = skinGoals;

  protected openSignUp(): void {
    this.authModal.open('signup');
  }

  protected openSignIn(): void {
    this.authModal.open('signin');
  }
}
