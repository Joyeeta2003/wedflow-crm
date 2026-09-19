import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';

export interface NewEventDayData {
  eventType: string;
  datePending: boolean;
  date: string;
  venue: string;
  notes: string;
}

@Component({
  selector: 'app-event-day-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './event-day-modal.html',
  styleUrl: './event-day-modal.scss',
})
export class EventDayModal {
  @Output() closeModal = new EventEmitter<void>();
  @Output() create = new EventEmitter<NewEventDayData>();

  eventTypes = ['Pre-Wedding', 'Wedding', 'Reception', 'Engagement', 'Mehendi', 'Sangeet', 'Other'];

  day: NewEventDayData = this.empty();
  isSubmitting = false;

  isTypeOpen = false;
  typeTouched = false;

  private empty(): NewEventDayData {
    return { eventType: 'Wedding', datePending: false, date: '', venue: '', notes: '' };
  }

  get typeInvalid(): boolean {
    return this.typeTouched && !this.day.eventType;
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
    this.day.eventType = t;
    this.isTypeOpen = false;
    this.typeTouched = true;
  }

  onCancel() {
    if (this.isSubmitting) return;
    this.day = this.empty();
    this.typeTouched = false;
    this.closeModal.emit();
  }

  onSubmit(form: NgForm) {
    this.typeTouched = true;

    // ASSUMPTION: Date is required only when "date not yet confirmed" is unchecked
    const dateInvalid = !this.day.datePending && !this.day.date;
    Object.values(form.controls).forEach((c) => c.markAsTouched());

    if (!this.day.eventType || dateInvalid) return;

    this.isSubmitting = true;

    // Emit immediately to parent component which will handle the API call
    this.create.emit({ ...this.day });
    this.isSubmitting = false;
    this.typeTouched = false;
    this.day = this.empty();
    form.resetForm({ eventType: 'Wedding', datePending: false });
  }
}