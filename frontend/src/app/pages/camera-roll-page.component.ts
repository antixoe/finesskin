import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PhotoRollService, ProgressPhoto } from '../core/photo-roll.service';

@Component({
  selector: 'app-camera-roll-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './camera-roll-page.component.html',
  styleUrl: './camera-roll-page.component.css',
})
export class CameraRollPageComponent {
  protected readonly photoRoll = inject(PhotoRollService);
  protected selectedPhoto: ProgressPhoto | null = null;
  protected galleryCategory: 'all' | 'habit' | 'todo' = 'all';
  protected caption = '';

  protected get filteredPhotos(): ProgressPhoto[] {
    const photos = this.photoRoll.photos();
    return this.galleryCategory === 'all' ? photos : photos.filter((photo) => photo.targetType === this.galleryCategory);
  }

  protected setGalleryCategory(category: 'all' | 'habit' | 'todo'): void {
    this.galleryCategory = category;
  }

  protected countByType(type: 'habit' | 'todo'): number {
    return this.photoRoll.photos().filter((photo) => photo.targetType === type).length;
  }

  protected removePhoto(id: string): void {
    this.photoRoll.remove(id);
    if (this.selectedPhoto?.id === id) this.closeDetail();
  }

  protected openDetail(photo: ProgressPhoto): void { this.selectedPhoto = photo; this.caption = photo.caption ?? ''; }
  protected closeDetail(): void { this.selectedPhoto = null; this.caption = ''; }
  protected saveCaption(): void { if (!this.selectedPhoto) return; this.photoRoll.updateCaption(this.selectedPhoto.id, this.caption.trim()); this.selectedPhoto = this.photoRoll.photos().find((photo) => photo.id === this.selectedPhoto?.id) ?? null; }
}
