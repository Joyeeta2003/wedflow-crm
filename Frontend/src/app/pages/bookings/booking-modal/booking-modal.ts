import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';

export interface ClientOption {
  id: string;
  label: string;
}
export interface PackageOption {
  id: string;
  label: string;
}

export interface NewBookingData {
  clientMode: 'existing' | 'new';
  clientId: string;
  newClientName: string; // 👈 notun
  newClientPhone: string; // 👈 notun
  newClientEmail: string; // 👈 notun
  newClientAddress: string;
  packageMode: 'existing' | 'new' | 'custom';
  packageId: string;
  bookingDate: string;
  projectDivision: string;
  eventType: string;
  clientManager: string;
  mainEventDate: string;
  totalAmount: number;
  venue: string;
  coverageSide: 'single' | 'both';
  googleMapsLink: string;
  notes: string;
  paymentMethod: string;
  finalPaymentStatus: string;
  paymentCollectionNotes: string;
  selectionUploadProcess: string;
  review: string;
  remarks: string;
}

@Component({
  selector: 'app-booking-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './booking-modal.html',
  styleUrl: './booking-modal.scss',
})
export class BookingModal {
  @Input() isOpen = false;
  @Input() clients: ClientOption[] = [];
  @Input() packages: PackageOption[] = [];
  @Output() closeModal = new EventEmitter<void>();
  @Output() create = new EventEmitter<NewBookingData>();

  eventTypes = [
    'Wedding',
    'Reception',
    'Rice Ceremony',
    'Baby Shoot',
    'Birthday',
    'Pre-Wedding',
    'Photo Only',
    'Video Only',
    'Other',
  ];

  booking: NewBookingData = this.emptyBooking();

  private emptyBooking(): NewBookingData {
    return {
      clientMode: 'existing',
      clientId: '',
      newClientName: '', // 👈 notun
      newClientPhone: '', // 👈 notun
      newClientEmail: '', // 👈 notun
      newClientAddress: '', // 👈 notun
      packageMode: 'existing',
      packageId: '',
      bookingDate: this.todayDDMMYYYY(),
      projectDivision: '',
      eventType: '',
      clientManager: '',
      mainEventDate: '',
      totalAmount: 0,
      venue: '',
      coverageSide: 'single',
      googleMapsLink: '',
      notes: '',
      paymentMethod: '',
      finalPaymentStatus: '',
      paymentCollectionNotes: '',
      selectionUploadProcess: '',
      review: '',
      remarks: '',
    };
  }

  private todayDDMMYYYY(): string {
    const d = new Date();
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    return `${dd}-${mm}-${d.getFullYear()}`;
  }

  onCancel() {
    this.booking = this.emptyBooking();
    this.closeModal.emit();
  }

  onSubmit(form: NgForm) {
    if (form.invalid) return;
    this.create.emit({ ...this.booking });
    this.booking = this.emptyBooking();
  }
}
