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
  protected gallerySearch = '';
  protected gallerySort: 'newest' | 'oldest' | 'title' = 'newest';
  protected caption = '';

  protected get filteredPhotos(): ProgressPhoto[] {
    const photos = this.photoRoll.photos();
    const query = this.gallerySearch.trim().toLowerCase();
    return photos
      .filter((photo) => this.galleryCategory === 'all' || photo.targetType === this.galleryCategory)
      .filter((photo) => !query || `${photo.targetTitle} ${photo.caption ?? ''} ${photo.targetType}`.toLowerCase().includes(query))
      .sort((a, b) => this.gallerySort === 'title'
        ? a.targetTitle.localeCompare(b.targetTitle)
        : this.gallerySort === 'oldest'
          ? a.createdAt.localeCompare(b.createdAt)
          : b.createdAt.localeCompare(a.createdAt));
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
