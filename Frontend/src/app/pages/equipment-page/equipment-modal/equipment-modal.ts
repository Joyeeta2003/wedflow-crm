import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export type EquipmentType = 'camera' | 'drone' | 'memory_card' | 'hard_disk' | 'lens' | 'tripod' | 'light' | 'other';
export interface NewEquipmentPayload {
  name: string;
  type: EquipmentType;
  typeLabel: string;
  serialNumber?: string;
  description?: string;
}

interface TypeOption {
  value: EquipmentType;
  label: string;
}

@Component({
  selector: 'app-equipment-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './equipment-modal.html',
  styleUrl: './equipment-modal.scss'
})
export class EquipmentModal {
  @Input() isOpen = false;
  @Output() closed = new EventEmitter<void>();
  @Output() submitted = new EventEmitter<NewEquipmentPayload>();
  showValidationError = signal(false);

  typeOptions: TypeOption[] = [
  { value: 'camera', label: 'Camera' },
  { value: 'drone', label: 'Drone' },
  { value: 'memory_card', label: 'Memory Card' },
  { value: 'hard_disk', label: 'Hard Disk' },
  { value: 'lens', label: 'Lens' },
  { value: 'tripod', label: 'Tripod' },
  { value: 'light', label: 'Light' },
  { value: 'other', label: 'Other' }
];

  name = signal('');
  selectedType = signal<EquipmentType>('camera');
  serialNumber = signal('');
  description = signal('');
  isTypeMenuOpen = signal(false);

  toggleTypeMenu() {
    this.isTypeMenuOpen.set(!this.isTypeMenuOpen());
  }

  selectType(value: EquipmentType) {
    this.selectedType.set(value);
    this.isTypeMenuOpen.set(false);
  }

  get typeLabel(): string {
    return this.typeOptions.find(o => o.value === this.selectedType())?.label ?? 'Camera';
  }

  onOverlayClick() {
    this.close();
  }

  close() {
    this.resetForm();
    this.closed.emit();
  }

 submit() {
  const trimmedName = this.name().trim();
  if (!trimmedName) {
    this.showValidationError.set(true);
    return;
  }
  this.showValidationError.set(false);

  const typeOpt = this.typeOptions.find(o => o.value === this.selectedType());

  this.submitted.emit({
    name: trimmedName,
    type: this.selectedType(),
    typeLabel: typeOpt?.label ?? 'Camera',
    serialNumber: this.serialNumber().trim() || undefined,
    description: this.description().trim() || undefined
  });
   this.resetForm();
}

private resetForm() {
  this.name.set('');
  this.selectedType.set('camera');
  this.serialNumber.set('');
  this.description.set('');
  this.isTypeMenuOpen.set(false);
  this.showValidationError.set(false); // ← add koro
}

}