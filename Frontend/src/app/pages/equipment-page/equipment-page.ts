import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EquipmentModal, NewEquipmentPayload } from './equipment-modal/equipment-modal';
import { EquipmentCheckoutModal, CheckoutPayload } from './equipment-checkout-modal/equipment-checkout-modal';

export type EquipmentType = 'camera' | 'drone' | 'memory_card' | 'hard_disk' | 'lens' | 'tripod' | 'light' | 'other';
type EquipmentStatus = 'available' | 'checked_out';

interface EquipmentItem {
  id: string;
  name: string;
  type: EquipmentType;
  typeLabel: string;
  idNumber?: string;
  status: EquipmentStatus;
  checkedOutWith?: string;
  checkedOutSince?: Date;
  checkedOutDue?: Date;
}

type TypeFilter = 'all' | EquipmentType;

@Component({
  selector: 'app-equipment',
  standalone: true,
  imports: [CommonModule, FormsModule, EquipmentModal, EquipmentCheckoutModal],
  templateUrl: './equipment-page.html',
  styleUrl: './equipment-page.scss',
})
export class Equipment {
  searchTerm = signal('');
  typeFilter = signal<TypeFilter>('all');
  isTypeMenuOpen = signal(false);

  typeOptions: { value: TypeFilter; label: string }[] = [
    { value: 'all', label: 'All Types' },
    { value: 'camera', label: 'Camera' },
    { value: 'drone', label: 'Drone' },
    { value: 'memory_card', label: 'Memory Card' },
    { value: 'hard_disk', label: 'Hard Disk' },
    { value: 'lens', label: 'Lens' },
    { value: 'tripod', label: 'Tripod' },
    { value: 'light', label: 'Light' },
    { value: 'other', label: 'Other' },
  ];

  equipment = signal<EquipmentItem[]>([
    { id: 'e1', name: 'Canon', type: 'camera', typeLabel: 'Camera', status: 'available' },
    { id: 'e2', name: 'DJI', type: 'drone', typeLabel: 'Drone', status: 'available' },
    { id: 'e3', name: 'Nikon', type: 'camera', typeLabel: 'Camera', status: 'available' },
    { id: 'e4', name: 'Samsumg Ultra', type: 'tripod', typeLabel: 'Tripod', status: 'available' },
    { id: 'e5', name: 'Sony', type: 'camera', typeLabel: 'Camera', status: 'available' },
    { id: 'e6', name: 'Sony DSLR', type: 'camera', typeLabel: 'Camera', idNumber: '11198', status: 'available' },
  ]);

  filteredEquipment = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const type = this.typeFilter();
    return this.equipment().filter((item) => {
      const matchesTerm =
        !term || item.name.toLowerCase().includes(term) || item.typeLabel.toLowerCase().includes(term);
      const matchesType = type === 'all' || item.type === type;
      return matchesTerm && matchesType;
    });
  });

  availableItems = computed(() => this.filteredEquipment().filter((i) => i.status === 'available'));
  checkedOutItems = computed(() => this.filteredEquipment().filter((i) => i.status === 'checked_out'));

  totalAvailable = computed(() => this.equipment().filter((i) => i.status === 'available').length);
  totalCheckedOut = computed(() => this.equipment().filter((i) => i.status === 'checked_out').length);

  toggleTypeMenu() {
    this.isTypeMenuOpen.set(!this.isTypeMenuOpen());
  }

  selectType(value: TypeFilter) {
    this.typeFilter.set(value);
    this.isTypeMenuOpen.set(false);
  }

  get typeLabel(): string {
    return this.typeOptions.find((o) => o.value === this.typeFilter())?.label ?? 'All Types';
  }

  // ==== Add Equipment modal ====
  isAddModalOpen = signal(false);

  onAddEquipment() {
    this.isAddModalOpen.set(true);
  }

  onModalClosed() {
    this.isAddModalOpen.set(false);
  }

  onModalSubmitted(payload: NewEquipmentPayload) {
    this.equipment.update((list) => [
      ...list,
      {
        id: `e${Date.now()}`,
        name: payload.name,
        type: payload.type,
        typeLabel: payload.typeLabel,
        idNumber: payload.serialNumber,
        status: 'available',
      },
    ]);
    this.isAddModalOpen.set(false);
  }

  // ==== Checkout modal ====
  isCheckoutModalOpen = signal(false);
  checkoutTargetId = signal<string | null>(null);
  checkoutTargetName = signal('');

  onCheckout(item: EquipmentItem) {
    this.checkoutTargetId.set(item.id);
    this.checkoutTargetName.set(item.name);
    this.isCheckoutModalOpen.set(true);
  }

  onCheckoutModalClosed() {
    this.isCheckoutModalOpen.set(false);
    this.checkoutTargetId.set(null);
  }

  onCheckoutSubmitted(payload: CheckoutPayload) {
    console.log('onCheckoutSubmitted fired', payload); // TEMP debug line — remove once confirmed working
    this.equipment.update((list) =>
      list.map((item) =>
        item.id === payload.equipmentId
          ? {
              ...item,
              status: 'checked_out' as const,
              checkedOutWith: payload.staffName,
              checkedOutSince: new Date(),
              checkedOutDue: payload.expectedReturnDate ? new Date(payload.expectedReturnDate) : undefined,
            }
          : item
      )
    );
    this.isCheckoutModalOpen.set(false);
    this.checkoutTargetId.set(null);
    this.showToast('Equipment checked out');
  }

  // ==== Mark Returned ====
  markReturned(item: EquipmentItem) {
    this.equipment.update((list) =>
      list.map((i) =>
        i.id === item.id
          ? { ...i, status: 'available' as const, checkedOutWith: undefined, checkedOutSince: undefined, checkedOutDue: undefined }
          : i
      )
    );
    this.showToast('Equipment returned successfully');
  }

  formatShortDate(date?: Date): string {
    if (!date) return '';
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  }

  // ==== Inline toast (self-contained, no external component dependency) ====
  toastVisible = signal(false);
  toastMessage = signal('');
  private toastTimeoutId: ReturnType<typeof setTimeout> | null = null;

  showToast(message: string) {
    if (this.toastTimeoutId) clearTimeout(this.toastTimeoutId);
    this.toastMessage.set(message);
    this.toastVisible.set(true);
    this.toastTimeoutId = setTimeout(() => this.toastVisible.set(false), 3000);
  }

  closeToast() {
    if (this.toastTimeoutId) clearTimeout(this.toastTimeoutId);
    this.toastVisible.set(false);
  }
}