import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface CheckoutPayload {
  equipmentId: string;
  staffId: string;
  staffName: string;
  expectedReturnDate?: string;
  notes?: string;
}

interface StaffOption {
  id: string;
  name: string;
}

@Component({
  selector: 'app-equipment-checkout-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './equipment-checkout-modal.html',
  styleUrl: './equipment-checkout-modal.scss'
})
export class EquipmentCheckoutModal {
  @Input() isOpen = false;
  @Input() equipmentId: string | null = null;
  @Input() equipmentName = '';
  @Output() closed = new EventEmitter<void>();
  @Output() submitted = new EventEmitter<CheckoutPayload>();

  // real ids/names from devtools option list
  staffOptions = signal<StaffOption[]>([
    { id: '6a5685de7a427311e7ce0739', name: 'Abhirup (video editor)' },
    { id: '6a27ece8544a263c2cffe486', name: 'Akash Sarkar (photographer)' },
    { id: '6a94202ed3376a07f970bcd7', name: 'Joy (drone operator)' },
    { id: '6a1df2aeaddaa11f075b3ba7', name: 'Kathakali Mondal (cinematographer)' },
    { id: '6a27f0be544a263c2cffe4b4', name: 'Putul Sarkar (photo editor)' },
    { id: '6a45204dcf4d7fe2486b48c7', name: 'Rajib (photo editor)' },
    { id: '6a287ed299cc8d99623fc245', name: 'Rohan Gupta (photographer)' },
    { id: '6a27f0ed544a263c2cffe4cb', name: 'Srabani Dey (video editor)' },
    { id: '6a27f089544a263c2cffe49d', name: 'Sujan Das (videographer)' },
    { id: '6a43649beff108acd0166116', name: 'fjdfjhjd (cinematographer)' },
    { id: '6a437638eff108acd01664e5', name: 'srijon chakrabortty (videographer)' },
    { id: '6a5b230f7a427311e7ce1af6', name: 'ytewtywty (photographer)' }
  ]);

  selectedStaffId = signal<string | null>(null);
  expectedReturnDate = signal('');
  notes = signal('');
  isStaffMenuOpen = signal(false);
  showValidationError = signal(false);

  toggleStaffMenu() {
    this.isStaffMenuOpen.set(!this.isStaffMenuOpen());
  }

  selectStaff(id: string) {
    this.selectedStaffId.set(id);
    this.isStaffMenuOpen.set(false);
    this.showValidationError.set(false);
  }

  get staffLabel(): string {
    return this.staffOptions().find(s => s.id === this.selectedStaffId())?.name ?? 'Select staff...';
  }

  onOverlayClick() {
    this.close();
  }

  close() {
    this.resetForm();
    this.closed.emit();
  }

  submit() {
    const staffId = this.selectedStaffId();
    if (!staffId) {
      this.showValidationError.set(true);
      return;
    }

    const staff = this.staffOptions().find(s => s.id === staffId);

    this.submitted.emit({
      equipmentId: this.equipmentId ?? '',
      staffId,
      staffName: staff?.name ?? '',
      expectedReturnDate: this.expectedReturnDate() || undefined,
      notes: this.notes().trim() || undefined
    });

    this.resetForm();
  }

  private resetForm() {
    this.selectedStaffId.set(null);
    this.expectedReturnDate.set('');
    this.notes.set('');
    this.isStaffMenuOpen.set(false);
    this.showValidationError.set(false);
  }
}