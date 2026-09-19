import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Booking } from '../../../../services/booking.service';

@Component({
  selector: 'app-invoice-tab',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './invoice-tab.html',
  styleUrl: './invoice-tab.scss',
})
export class InvoiceTab {
  @Input({ required: true }) booking!: Booking;

  // Studio configuration (can be moved to workspace settings later)
  studioConfig = {
    name: 'Wedding Photography Studio',
    address: 'Professional Photography Services',
    phone: '+91 98765 43210',
    email: 'info@wedflowcrm.com',
    website: 'www.wedflowcrm.com',
    gstin: 'GSTIN12345678' // Optional GST number
  };

  formatDate(date: string | null): string {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  formatAmount(amount: number): string {
    return 'Rs. ' + Number(amount).toLocaleString('en-IN');
  }

  printInvoice() {
    window.print();
  }

  get studioName(): string {
    return this.studioConfig.name;
  }

  get studioAddress(): string {
    return this.studioConfig.address;
  }

  get studioContact(): string {
    return `${this.studioConfig.phone} | ${this.studioConfig.email}`;
  }

  get clientName(): string {
    return this.booking.client_name || 'Client';
  }

  get clientPhone(): string {
    // This would come from booking.client_phone when available
    return '+91 9330550475'; // Placeholder
  }

  get clientEmail(): string {
    // This would come from booking.client_email when available
    return 'arnabb319@gmail.com'; // Placeholder
  }

  get clientLocation(): string {
    // This would come from booking.client_address when available
    return 'kolkata'; // Placeholder
  }

  get packageIncludes(): string[] {
    if (!this.booking) return [];
    
    // Extract from deliveries if available
    if (this.booking.deliveries && this.booking.deliveries.length > 0) {
      return this.booking.deliveries
        .map(d => d.type)
        .filter((type, index, self) => self.indexOf(type) === index);
    }

    // Default package includes based on package name
    const defaultIncludes = [
      'Pre-Wedding Photoshoot (1 Day)',
      '500+ Professionally Edited Photos',
      '15-20 Minute Cinematic Wedding Film',
      '4K Wedding Highlight Video (5-7 Minutes)',
      'Drone Coverage for Outdoor Events',
      'Premium Designer Wedding Album (40 Sheets)',
      'Same-Day Instagram Reels (3-5)',
      'All Raw Photos & Videos',
      'Cloud Storage Access for 1 Year'
    ];

    return defaultIncludes;
  }

  get paymentsList(): { label: string; amount: number; date?: string }[] {
    if (!this.booking.payment_schedule) return [];
    
    return this.booking.payment_schedule.map(payment => ({
      label: payment.installment_name || 'Payment',
      amount: payment.amount || 0,
      date: payment.paid_date || undefined
    }));
  }

  get totalPaid(): number {
    return Number(this.booking.amount_paid || 0);
  }

  get balanceDue(): number {
    return Number(this.booking.total_amount || 0) - this.totalPaid;
  }

  get hasOverpayment(): boolean {
    return this.balanceDue < 0;
  }

  get paidPercentage(): number {
    const total = Number(this.booking.total_amount || 0);
    if (total === 0) return 0;
    return Math.round((this.totalPaid / total) * 100);
  }

  get invoiceNumber(): string {
    // Generate invoice number from booking number
    return `INV-${this.booking.booking_number || '000000'}`;
  }

  get dueDate(): string {
    // Could be calculated from payment schedule or event date
    return this.formatDate(this.booking.event_date);
  }
}