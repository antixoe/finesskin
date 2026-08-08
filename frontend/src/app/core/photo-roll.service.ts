import { Injectable, signal } from '@angular/core';

export type PhotoTargetType = 'habit' | 'todo';

export interface ProgressPhoto {
  id: string;
  targetType: PhotoTargetType;
  targetId: string;
  targetTitle: string;
  dataUrl: string;
  createdAt: string;
  caption?: string;
}

@Injectable({ providedIn: 'root' })
export class PhotoRollService {
  readonly photos = signal<ProgressPhoto[]>(this.read());

  add(photo: Omit<ProgressPhoto, 'id' | 'createdAt'>): void {
    const next: ProgressPhoto = {
      ...photo,
      id: `photo-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      createdAt: new Date().toISOString(),
    };
    this.photos.update((photos) => {
      const updated = [next, ...photos];
      this.write(updated);
      return updated;
    });
  }

  remove(id: string): void {
    this.photos.update((photos) => {
      const updated = photos.filter((photo) => photo.id !== id);
      this.write(updated);
      return updated;
    });
  }

  updateCaption(id: string, caption: string): void {
    this.photos.update((photos) => {
      const updated = photos.map((photo) => photo.id === id ? { ...photo, caption } : photo);
      this.write(updated);
      return updated;
    });
  }

  private read(): ProgressPhoto[] {
    try {
      const stored = localStorage.getItem('finesskin-progress-photos');
      if (stored) return JSON.parse(stored) as ProgressPhoto[];
      const demoPhotos = this.demoPhotos();
      localStorage.setItem('finesskin-progress-photos', JSON.stringify(demoPhotos));
      return demoPhotos;
    } catch {
      return [];
    }
  }

  private demoPhotos(): ProgressPhoto[] {
    return [
      {
        id: 'demo-photo-1', targetType: 'habit', targetId: 'demo-habit', targetTitle: 'Morning skincare',
        dataUrl: this.demoImage('#dff4ff', '#139ce7', 'morning glow'),
        createdAt: '2026-08-08T07:42:00.000Z', caption: 'A soft start and a little time for me. ✦',
      },
      {
        id: 'demo-photo-2', targetType: 'todo', targetId: 'demo-todo', targetTitle: 'Drink water',
        dataUrl: this.demoImage('#fff0f6', '#ec6f9c', 'small wins'),
        createdAt: '2026-08-07T16:18:00.000Z', caption: 'Keeping my promises to future me ♡',
      },
    ];
  }

  private demoImage(background: string, accent: string, label: string): string {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 680"><rect width="900" height="680" rx="44" fill="${background}"/><circle cx="730" cy="150" r="110" fill="${accent}" opacity=".18"/><circle cx="170" cy="530" r="160" fill="${accent}" opacity=".13"/><rect x="245" y="145" width="410" height="330" rx="42" fill="#fff" opacity=".9"/><circle cx="380" cy="295" r="52" fill="${accent}" opacity=".85"/><circle cx="520" cy="295" r="52" fill="${accent}" opacity=".55"/><path d="M365 380c45 42 125 42 170 0" fill="none" stroke="${accent}" stroke-width="16" stroke-linecap="round"/><text x="450" y="565" text-anchor="middle" font-family="Arial,sans-serif" font-size="34" font-weight="700" fill="${accent}">${label}</text></svg>`;
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
  }

  private write(photos: ProgressPhoto[]): void {
    localStorage.setItem('finesskin-progress-photos', JSON.stringify(photos));
  }
}
