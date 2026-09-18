import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';

export interface NewPaymentData {
  label: string;
  amount: number;
  dueDate: string;
  notes: string;
}

@Component({
  selector: 'app-payment-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './payment-modal.html',
  styleUrl: './payment-modal.scss',
})
export class PaymentModal {
  @Input() isOpen = false;
  @Input() remainingAmount = 0; // ASSUMPTION — total_amount minus already-scheduled amounts
  @Output() closeModal = new EventEmitter<void>();
  @Output() create = new EventEmitter<NewPaymentData>();

  payment: NewPaymentData = this.emptyPayment();

  private emptyPayment(): NewPaymentData {
    return { label: '', amount: 0, dueDate: '', notes: '' };
  }

  onCancel() {
    this.payment = this.emptyPayment();
    this.closeModal.emit();
  }

  onSubmit(form: NgForm) {
    if (form.invalid) return;
    this.create.emit({ ...this.payment });
    this.payment = this.emptyPayment();
  }
}
