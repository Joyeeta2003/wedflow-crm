import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';

export interface NewMediaItemData {
  mediaType: string;
  label: string;
  capacity: string;
  photographer: string;
  notes: string;
}

@Component({
  selector: 'app-media-item-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './media-item-modal.html',
  styleUrl: './media-item-modal.scss',
})
export class MediaItemModal {
  @Output() closeModal = new EventEmitter<void>();
  @Output() create = new EventEmitter<NewMediaItemData>();

  mediaTypes = ['Memory Card', 'Hard Disk', 'Pen Drive', 'SD Card', 'CFexpress Card'];

  item: NewMediaItemData = this.empty();
  isSubmitting = false;

  isTypeOpen = false;
  labelTouched = false;

  private empty(): NewMediaItemData {
    return { mediaType: 'Memory Card', label: '', capacity: '', photographer: '', notes: '' };
  }

  get labelInvalid(): boolean {
    return this.labelTouched && !this.item.label.trim();
  }

  toggleTypeDropdown(): void {
    this.isTypeOpen = !this.isTypeOpen;
  }

  closeTypeDropdown(): void {
    this.isTypeOpen = false;
  }

  selectType(t: string): void {
    this.item.mediaType = t;
    this.isTypeOpen = false;
  }

  onCancel(): void {
    if (this.isSubmitting) return;
    this.item = this.empty();
    this.labelTouched = false;
    this.closeModal.emit();
  }

  onSubmit(form: NgForm): void {
    this.labelTouched = true;
    if (!this.item.label.trim()) return;

    this.isSubmitting = true;

    // ASSUMPTION: simulated delay — replace with real API call once endpoint confirmed
    setTimeout(() => {
      this.create.emit({ ...this.item });
      this.isSubmitting = false;
      this.labelTouched = false;
      this.item = this.empty();
      form.resetForm({ mediaType: 'Memory Card' });
    }, 800);
  }
}
