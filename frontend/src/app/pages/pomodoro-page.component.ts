import { CommonModule } from '@angular/common';
import { Component, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';

type TimerMode = 'focus' | 'break';

@Component({
  selector: 'app-pomodoro-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pomodoro-page.component.html',
  styleUrl: './pomodoro-page.component.css',
})
export class PomodoroPageComponent implements OnDestroy {
  protected workMinutes = 25;
  protected breakMinutes = 5;
  protected musicUrl = '';
  protected musicEnabled = false;
  protected uploadedTracks: { name: string; url: string }[] = [];
  protected musicTrackIndex = 0;
  protected mode: TimerMode = 'focus';
  protected secondsLeft = this.workMinutes * 60;
  protected running = false;
  protected completedRounds = 0;
  protected message = 'Ready when you are';
  protected backgroundImage = '';
  protected showSettings = false;
  private timer?: number;

  get modeLabel(): string { return this.mode === 'focus' ? 'Focus time' : 'Little break'; }
  get formattedTime(): string {
    const minutes = Math.floor(this.secondsLeft / 60).toString().padStart(2, '0');
    const seconds = (this.secondsLeft % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  }
  get progress(): number {
    const total = (this.mode === 'focus' ? this.workMinutes : this.breakMinutes) * 60;
    return total ? Math.max(0, Math.min(100, ((total - this.secondsLeft) / total) * 100)) : 0;
  }

  protected toggleTimer(): void {
    this.running = !this.running;
    this.message = this.running ? `${this.modeLabel} is on ✨` : 'Paused — take your time';
    if (this.running) this.startTicking(); else this.stopTicking();
  }

  protected resetTimer(): void {
    this.stopTicking();
    this.running = false;
    this.secondsLeft = this.durationFor(this.mode);
    this.message = 'Ready when you are';
  }

  protected skipMode(): void {
    this.stopTicking();
    this.running = false;
    this.mode = this.mode === 'focus' ? 'break' : 'focus';
    this.secondsLeft = this.durationFor(this.mode);
    this.message = this.mode === 'focus' ? 'Back to your cozy focus' : 'Break time — you earned it';
  }

  protected saveSettings(): void {
    this.workMinutes = Math.max(1, Math.min(120, Math.round(Number(this.workMinutes) || 25)));
    this.breakMinutes = Math.max(1, Math.min(60, Math.round(Number(this.breakMinutes) || 5)));
    if (!this.running) this.secondsLeft = this.durationFor(this.mode);
    this.message = 'Your timer is all set 💗';
  }

  protected requestNotifications(): void {
    if ('Notification' in window) Notification.requestPermission();
  }

  protected chooseBackground(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => { this.backgroundImage = String(reader.result); };
    reader.readAsDataURL(file);
    (event.target as HTMLInputElement).value = '';
  }

  protected clearBackground(): void { this.backgroundImage = ''; }

  protected chooseMusicFiles(event: Event): void {
    const files = Array.from((event.target as HTMLInputElement).files ?? []).filter((file) => file.type.startsWith('audio/'));
    this.uploadedTracks.forEach((track) => URL.revokeObjectURL(track.url));
    this.uploadedTracks = files.map((file) => ({ name: file.name, url: URL.createObjectURL(file) }));
    this.musicTrackIndex = 0;
    this.musicEnabled = this.uploadedTracks.length > 0;
    (event.target as HTMLInputElement).value = '';
  }

  protected get uploadedMusicUrl(): string { return this.uploadedTracks[this.musicTrackIndex]?.url ?? ''; }
  protected get activeMusicName(): string { return this.uploadedTracks[this.musicTrackIndex]?.name ?? ''; }
  protected nextMusicTrack(): void { if (this.uploadedTracks.length) this.musicTrackIndex = (this.musicTrackIndex + 1) % this.uploadedTracks.length; }
  protected previousMusicTrack(): void { if (this.uploadedTracks.length) this.musicTrackIndex = (this.musicTrackIndex - 1 + this.uploadedTracks.length) % this.uploadedTracks.length; }
  protected clearUploadedMusic(): void { this.uploadedTracks.forEach((track) => URL.revokeObjectURL(track.url)); this.uploadedTracks = []; this.musicTrackIndex = 0; }

  protected openSettings(): void { this.showSettings = true; }
  protected closeSettings(): void { this.showSettings = false; }

  private startTicking(): void {
    this.stopTicking();
    this.timer = window.setInterval(() => {
      if (this.secondsLeft > 0) {
        this.secondsLeft -= 1;
        return;
      }
      this.playChime();
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(`${this.modeLabel} is finished`, { body: this.mode === 'focus' ? 'Time for a little break 💗' : 'Ready for another gentle focus round.' });
      }
      if (this.mode === 'focus') this.completedRounds += 1;
      this.mode = this.mode === 'focus' ? 'break' : 'focus';
      this.secondsLeft = this.durationFor(this.mode);
      this.message = this.mode === 'focus' ? 'Break finished — you can do this' : 'Focus finished — stretch and breathe';
    }, 1000);
  }

  private stopTicking(): void { if (this.timer) window.clearInterval(this.timer); this.timer = undefined; }
  private durationFor(mode: TimerMode): number { return (mode === 'focus' ? this.workMinutes : this.breakMinutes) * 60; }

  private playChime(): void {
    try {
      const context = new AudioContext();
      [523.25, 659.25, 783.99].forEach((frequency, index) => {
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        oscillator.frequency.value = frequency;
        oscillator.type = 'sine';
        gain.gain.setValueAtTime(0.001, context.currentTime + index * 0.16);
        gain.gain.exponentialRampToValueAtTime(0.18, context.currentTime + index * 0.16 + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + index * 0.16 + 0.42);
        oscillator.connect(gain).connect(context.destination);
        oscillator.start(context.currentTime + index * 0.16);
        oscillator.stop(context.currentTime + index * 0.16 + 0.45);
      });
    } catch { /* Audio may be unavailable until the browser receives a gesture. */ }
  }

  ngOnDestroy(): void { this.stopTicking(); this.clearUploadedMusic(); }
}
