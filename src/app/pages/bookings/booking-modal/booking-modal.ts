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

  // TODO: real API theke fetch hobe — filhal screenshot-er data diye mock kori
  clients: ClientOption[] = [
    { id: '1', label: 'Sample Customer - 9876543210' },
    { id: '2', label: 'Soumik & Shrya - +91 7439452394' },
    { id: '3', label: 'Swagatam & Swagata - 9876543210' },
    { id: '4', label: 'Arnab - +91 9330550475' },
    { id: '5', label: 'Subha - +918296100911' },
    { id: '6', label: 'xyz - 1234567890' },
    { id: '7', label: 'Aniket - 822310098' },
  ];

  packages: PackageOption[] = [
    { id: 'p1', label: 'ROYAL WEDDING PACKAGE - Rs. 2,20,000' },
    { id: 'p2', label: 'EXCLUSIVE WEDDING PACKAGE - Rs. 15,00,000' },
    { id: 'p3', label: 'STANDARD WEDDING PACKAGE - Rs. 1,00,000' },
    { id: 'p4', label: 'BASIC PRE-WEDDING PACKAGE - Rs. 20,000' },
    { id: 'p5', label: 'PREMIUM PRE-WEDDING PACKAGE - Rs. 35,000' },
    { id: 'p6', label: 'ABC Package - Rs. 50,000' },
    { id: 'p7', label: 'Royal Wedding Package - Rs. 3,50,000' },
    { id: 'p8', label: 'Ultimate Wedding Package - Rs. 3,50,000' },
    { id: 'p9', label: 'Om Photography Premium Package - Rs. 76,000' },
    { id: 'p10', label: 'Demo Testing - Rs. 1,50,000' },
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
