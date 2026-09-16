import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Booking, PaymentSchedule } from '../../../../services/booking.service';
import { PaymentModal, NewPaymentData } from './payment-modal/payment-modal';

@Component({
  selector: 'app-payments-tab',
  standalone: true,
  imports: [CommonModule, PaymentModal],
  templateUrl: './payments-tab.html',
  styleUrl: './payments-tab.scss',
})
export class PaymentsTab {
  @Input({ required: true }) booking!: Booking;

  @Output() createPayment = new EventEmitter<NewPaymentData>();
  @Output() deletePayment = new EventEmitter<PaymentSchedule>();

  showAddModal = false;
  confirmDeleteTarget: PaymentSchedule | null = null;

  formatDate(value: string | null): string {
    if (!value) return '—';
    return new Date(value).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  formatAmount(value: number): string {
    return 'Rs. ' + Number(value).toLocaleString('en-IN');
  }

  get scheduledAmount(): number {
    if (!this.booking.payment_schedule) return 0;
    return this.booking.payment_schedule.reduce((sum, p) => sum + Number(p.amount || 0), 0);
  }

  get remainingSchedulable(): number {
    return Math.max(0, Number(this.booking.total_amount || 0) - this.scheduledAmount);
  }

  onOpenAdd(): void { this.showAddModal = true; }
  onCloseAdd(): void { this.showAddModal = false; }

  onSubmitAdd(data: NewPaymentData): void {
    this.showAddModal = false;
    this.createPayment.emit(data);
  }

  onDeleteClick(p: PaymentSchedule): void { this.confirmDeleteTarget = p; }
  onCancelDelete(): void { this.confirmDeleteTarget = null; }

  onConfirmDelete(): void {
    if (this.confirmDeleteTarget) this.deletePayment.emit(this.confirmDeleteTarget);
    this.confirmDeleteTarget = null;
  }
  trackByPaymentId(index: number, item: PaymentSchedule): string {
  return item.id;
}
}