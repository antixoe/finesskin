import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ReminderService } from '../core/reminder.service';

@Component({
  selector: 'app-notifications-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="notifications-page">
      <div class="notifications-page__head">
        <div><p class="section-label">Your care inbox</p><h1>Notifications</h1><p>Small reminders to help your habits and to-dos feel easier to keep up with.</p></div>
        <button type="button" class="client-btn" *ngIf="reminderService.unreadCount()" (click)="reminderService.markAllRead()">Mark all read</button>
      </div>
      <div class="notifications-list" *ngIf="reminderService.reminders().length; else emptyState">
        <article class="notification-card" *ngFor="let reminder of reminderService.reminders()" [class.is-unread]="!reminder.read" [class.is-urgent]="reminder.priority === 'high'" (click)="reminderService.markRead(reminder.id)">
          <span class="notification-card__icon">{{ reminder.icon }}</span><div><strong>{{ reminder.title }}</strong><p>{{ reminder.message }}</p></div><span class="notification-card__kind">{{ reminder.kind }}</span>
        </article>
      </div>
      <ng-template #emptyState><div class="notifications-empty"><span>✦</span><h2>All clear for now</h2><p>You’re caught up. New habit and to-do reminders will appear here.</p><a routerLink="/home" class="client-btn">Back to dashboard</a></div></ng-template>
    </section>
  `,
  styles: [`
    .notifications-page{max-width:54rem;margin:0 auto;padding:1.5rem 0 3rem}.notifications-page__head{display:flex;align-items:flex-end;justify-content:space-between;gap:1rem;margin-bottom:1.2rem}.notifications-page h1{margin:.35rem 0;color:#16324f;font-size:clamp(1.7rem,4vw,2.5rem)}.notifications-page__head p:not(.section-label){margin:0;color:#7890a2;font-size:.82rem;line-height:1.6}.notifications-list{display:grid;gap:.65rem}.notification-card{display:flex;align-items:center;gap:.8rem;padding:1rem;border:1px solid #dbeaf4;border-radius:1rem;background:rgba(255,255,255,.8);box-shadow:0 8px 20px rgba(44,120,165,.06);cursor:pointer;transition:transform .18s ease,box-shadow .18s ease}.notification-card:hover{transform:translateY(-1px);box-shadow:0 12px 24px rgba(44,120,165,.12)}.notification-card.is-unread{border-left:4px solid #139ce7;background:#f5fcff}.notification-card.is-urgent{border-left-color:#f59e0b}.notification-card__icon{display:grid;place-items:center;width:2.4rem;height:2.4rem;flex:none;border-radius:50%;background:#e6f7ff;color:#0879ad;font-weight:900}.is-urgent .notification-card__icon{background:#fff4d9;color:#b77900}.notification-card strong{color:#294963;font-size:.85rem}.notification-card p{margin:.25rem 0 0;color:#7890a2;font-size:.74rem}.notification-card__kind{margin-left:auto;color:#9ab0bf;font-size:.6rem;text-transform:uppercase}.notifications-empty{padding:3rem 1rem;text-align:center;border:1px dashed #bde4f6;border-radius:1.25rem;background:rgba(255,255,255,.6)}.notifications-empty>span{color:#139ce7;font-size:2rem}.notifications-empty h2{margin:.5rem 0 .3rem;color:#294963}.notifications-empty p{margin:0 0 1rem;color:#7890a2;font-size:.8rem}@media(max-width:600px){.notifications-page__head{align-items:flex-start;flex-direction:column}.notification-card__kind{display:none}}
  `],
})
export class NotificationsPageComponent {
  protected readonly reminderService = inject(ReminderService);

  constructor() { this.reminderService.refresh(); }
}
