import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';

export interface NewDeliveryData {
  type: string;
  description: string;
  dueDate: string;
  notes: string;
}

@Component({
  selector: 'app-delivery-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './delivery-modal.html',
  styleUrl: './delivery-modal.scss',
})
export class DeliveryModal {
  @Output() closeModal = new EventEmitter<void>();
  @Output() create = new EventEmitter<NewDeliveryData>();

  deliveryTypes = [
    'Album Design',
    'Album Print',
    'Video Edit',
    'Video Delivery',
    'Reel Edit',
    'Raw Data',
    'Photo Editing',
    'Teaser',
    'Other',
  ];

  delivery: NewDeliveryData = this.empty();
  isSubmitting = false;

  isTypeOpen = false;
  typeTouched = false;

  private empty(): NewDeliveryData {
    return { type: '', description: '', dueDate: '', notes: '' };
  }

  get typeInvalid(): boolean {
    return this.typeTouched && !this.delivery.type;
  }

  toggleTypeDropdown(): void {
    this.isTypeOpen = !this.isTypeOpen;
    if (!this.isTypeOpen) this.typeTouched = true;
  }

  closeTypeDropdown(): void {
    this.isTypeOpen = false;
    this.typeTouched = true;
  }

  selectType(t: string): void {
    this.delivery.type = t;
    this.isTypeOpen = false;
    this.typeTouched = true;
  }

  onCancel() {
    if (this.isSubmitting) return;
    this.delivery = this.empty();
    this.typeTouched = false;
    this.closeModal.emit();
  }

  onSubmit(form: NgForm) {
    this.typeTouched = true;
    Object.values(form.controls).forEach((c) => c.markAsTouched());

    if (form.invalid || !this.delivery.type) return;

    this.isSubmitting = true;

    // ASSUMPTION: simulated delay for loading UX — replace with real API call
    // once backend endpoint for adding delivery items is confirmed
    setTimeout(() => {
      this.create.emit({ ...this.delivery });
      this.isSubmitting = false;
      this.typeTouched = false;
      this.delivery = this.empty();
      form.resetForm();
    }, 800);
  }
}