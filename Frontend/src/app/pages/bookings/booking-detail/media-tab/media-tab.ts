import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Booking, MediaItem } from '../../../../services/booking.service';
import { MediaItemModal, NewMediaItemData } from './media-item-modal/media-item-modal';

@Component({
  selector: 'app-media-tab',
  standalone: true,
  imports: [CommonModule, MediaItemModal],
  templateUrl: './media-tab.html',
  styleUrl: './media-tab.scss',
})
export class MediaTab {
  @Input({ required: true }) booking!: Booking;

  @Output() createMedia = new EventEmitter<NewMediaItemData>();
  @Output() deleteMedia = new EventEmitter<MediaItem>();

  showAddModal = false;
  confirmDeleteTarget: MediaItem | null = null;

  trackByMediaId(index: number, item: MediaItem): string {
    return item.id;
  }

  onOpenAdd(): void {
    this.showAddModal = true;
  }

  onCloseAdd(): void {
    this.showAddModal = false;
  }

  onSubmitAdd(data: NewMediaItemData): void {
    this.showAddModal = false;
    this.createMedia.emit(data);
  }

  onDeleteClick(item: MediaItem): void {
    this.confirmDeleteTarget = item;
  }

  onCancelDelete(): void {
    this.confirmDeleteTarget = null;
  }

  onConfirmDelete(): void {
    if (this.confirmDeleteTarget) this.deleteMedia.emit(this.confirmDeleteTarget);
    this.confirmDeleteTarget = null;
  }
}