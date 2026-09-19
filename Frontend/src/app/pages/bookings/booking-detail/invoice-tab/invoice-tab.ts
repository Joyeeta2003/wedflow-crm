import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Booking, PaymentSchedule, DeliveryItem } from '../../../../services/booking.service';

@Component({
  selector: 'app-invoice-tab',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './invoice-tab.html',
  styleUrl: './invoice-tab.scss',
})
export class InvoiceTab {
  @Input({ required: true }) booking!: Booking;

  formatDate(value: string | null): string {
    if (!value) return '—';
    return new Date(value).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  formatEventDate(value: string | null): string {
    if (!value) return '—';
    return new Date(value).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      weekday: 'long',
    });
  }

  formatAmount(value: number): string {
    return 'Rs. ' + Number(value).toLocaleString('en-IN');
  }

  get advancesPaid(): PaymentSchedule[] {
    return (this.booking.payment_schedule ?? []).filter((p) => p.status === 'Approved');
  }

  get totalPaid(): number {
    return this.advancesPaid.reduce((sum, p) => sum + Number(p.amount || 0), 0);
  }

  get balanceDue(): number {
    return Number(this.booking.total_amount || 0) - this.totalPaid;
  }

  get packageIncludes(): DeliveryItem[] {
    return this.booking.deliveries ?? [];
  }

  trackByPaymentId(index: number, item: PaymentSchedule): string {
    return item.id;
  }

  trackByDeliveryId(index: number, item: DeliveryItem): string {
    return item.id;
  }

  onPrint(): void {
    window.print();
  }
}