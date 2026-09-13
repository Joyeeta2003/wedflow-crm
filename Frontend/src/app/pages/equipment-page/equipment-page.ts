import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EquipmentModal,NewEquipmentPayload } from './equipment-modal/equipment-modal';

type EquipmentType = 'camera' | 'drone' | 'tripod' | 'lighting' | 'audio' | 'other';
type EquipmentStatus = 'available' | 'checked_out';

interface EquipmentItem {
  id: string;
  name: string;
  type: EquipmentType;
  typeLabel: string;
  idNumber?: string; // e.g. "11198" — shown for some items only
  status: EquipmentStatus;
}

type TypeFilter = 'all' | EquipmentType;

@Component({
  selector: 'app-equipment',
  standalone: true,
  imports: [CommonModule, FormsModule,EquipmentModal],
  templateUrl: './equipment-page.html',
  styleUrl: './equipment-page.scss'
})
export class Equipment {
  searchTerm = signal('');
  typeFilter = signal<TypeFilter>('all');
  isTypeMenuOpen = signal(false);

  typeOptions: { value: TypeFilter; label: string }[] = [
    { value: 'all', label: 'All Types' },
    { value: 'camera', label: 'Camera' },
    { value: 'drone', label: 'Drone' },
    { value: 'tripod', label: 'Tripod' },
    { value: 'lighting', label: 'Lighting' }, // UNCONFIRMED
    { value: 'audio', label: 'Audio' }, // UNCONFIRMED
    { value: 'other', label: 'Other' } // UNCONFIRMED
  ];

  equipment = signal<EquipmentItem[]>([
    { id: 'e1', name: 'Canon', type: 'camera', typeLabel: 'Camera', status: 'available' },
    { id: 'e2', name: 'DJI', type: 'drone', typeLabel: 'Drone', status: 'available' },
    { id: 'e3', name: 'Nikon', type: 'camera', typeLabel: 'Camera', status: 'available' },
    { id: 'e4', name: 'Samsumg Ultra', type: 'tripod', typeLabel: 'Tripod', status: 'available' },
    { id: 'e5', name: 'Sony', type: 'camera', typeLabel: 'Camera', status: 'available' },
    { id: 'e6', name: 'Sony DSLR', type: 'camera', typeLabel: 'Camera', idNumber: '11198', status: 'available' }
  ]);

  filteredEquipment = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const type = this.typeFilter();

    return this.equipment().filter(item => {
      const matchesTerm = !term || item.name.toLowerCase().includes(term) || item.typeLabel.toLowerCase().includes(term);
      const matchesType = type === 'all' || item.type === type;
      return matchesTerm && matchesType;
    });
  });

  availableItems = computed(() => this.filteredEquipment().filter(i => i.status === 'available'));
  checkedOutItems = computed(() => this.filteredEquipment().filter(i => i.status === 'checked_out'));

  totalAvailable = computed(() => this.equipment().filter(i => i.status === 'available').length);
  totalCheckedOut = computed(() => this.equipment().filter(i => i.status === 'checked_out').length);

  toggleTypeMenu() {
    this.isTypeMenuOpen.set(!this.isTypeMenuOpen());
  }

  selectType(value: TypeFilter) {
    this.typeFilter.set(value);
    this.isTypeMenuOpen.set(false);
  }

  get typeLabel(): string {
    return this.typeOptions.find(o => o.value === this.typeFilter())?.label ?? 'All Types';
  }

  onCheckout(item: EquipmentItem) {
    // TODO: wire up Checkout to Staff flow once confirmed
    console.log('Checkout clicked for', item.id);
  }

   isAddModalOpen = signal(false);

  onAddEquipment() {
    this.isAddModalOpen.set(true);
  }

  onModalClosed() {
    this.isAddModalOpen.set(false);
  }

  onModalSubmitted(payload: NewEquipmentPayload) {
    this.equipment.update(list => [
      ...list,
      {
        id: `e${Date.now()}`,
        name: payload.name,
        type: payload.type,
         typeLabel: payload.typeLabel,
        idNumber: payload.serialNumber,
        status: 'available'
      }
    ]);
    this.isAddModalOpen.set(false);
  }
}
