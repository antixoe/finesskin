import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { NotificationService } from './notification.service';
import type { NotificationType } from './notification.service';

@Component({
  selector: 'app-notification-container',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification-container.component.html',
  styleUrl: './notification-container.component.css',
})
export class NotificationContainerComponent {
  protected readonly notificationService = inject(NotificationService);
  protected readonly notifications = this.notificationService.notifications;

  protected iconFor(type: NotificationType): string {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '!';
      default:
        return 'i';
    }
  }
}
