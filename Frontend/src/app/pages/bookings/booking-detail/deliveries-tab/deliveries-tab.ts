import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Booking, DeliveryItem } from '../../../../services/booking.service';
import { DeliveryModal, NewDeliveryData } from './delivery-modal/delivery-modal';

@Component({
  selector: 'app-deliveries-tab',
  standalone: true,
  imports: [CommonModule, DeliveryModal],
  templateUrl: './deliveries-tab.html',
  styleUrl: './deliveries-tab.scss',
})
export class DeliveriesTab {
  @Input({ required: true }) booking!: Booking;

  @Output() createDelivery = new EventEmitter<NewDeliveryData>();
  @Output() startDelivery = new EventEmitter<DeliveryItem>();
  @Output() markReady = new EventEmitter<DeliveryItem>();
  @Output() deleteDelivery = new EventEmitter<DeliveryItem>();

  showAddModal = false;
  confirmDeleteTarget: DeliveryItem | null = null;

  formatDate(value: string | null): string {
    if (!value) return '—';
    return new Date(value).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  statusClass(status: string): string {
    if (status === 'Delivered') return 'status-delivered';
    if (status === 'In Progress') return 'status-progress';
    return 'status-pending';
  }

  onOpenAdd(): void {
    this.showAddModal = true;
  }

  onCloseAdd(): void {
    this.showAddModal = false;
  }

  onSubmitAdd(data: NewDeliveryData): void {
    this.showAddModal = false;
    this.createDelivery.emit(data);
  }

  onDeleteClick(d: DeliveryItem): void {
    this.confirmDeleteTarget = d;
  }

  onCancelDelete(): void {
    this.confirmDeleteTarget = null;
  }

  onConfirmDelete(): void {
    if (this.confirmDeleteTarget) this.deleteDelivery.emit(this.confirmDeleteTarget);
    this.confirmDeleteTarget = null;
  }
  
  trackByDeliveryId(index: number, item: DeliveryItem): string {
  return item.id;
}

}