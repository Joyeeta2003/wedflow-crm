import { Component, EventEmitter, Output, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';

export interface NewTicketData {
  bookingId: string;
  type: string;
  assigneeId: string;
  title: string;
  deadline: string;
  description: string;
  priority: string;
  materialNote: string;
}

interface SelectOption {
  value: string;
  label: string;
}

@Component({
  selector: 'app-new-ticket-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './new-ticket-modal.html',
  styleUrl: './new-ticket-modal.scss',
})
export class NewTicketModal {
  @Output() closeModal = new EventEmitter<void>();
  @Output() create = new EventEmitter<NewTicketData>();
  
  @Input() bookings: any[] = [];
  @Input() staff: any[] = [];

  ngOnChanges(): void {
    console.log('NewTicketModal ngOnChanges - staff:', this.staff);
    console.log('NewTicketModal ngOnChanges - bookings:', this.bookings);
    console.log('NewTicketModal ngOnChanges - staff length:', this.staff.length);
    console.log('NewTicketModal ngOnChanges - bookings length:', this.bookings.length);
  }

  // Map bookings to select options
  get bookingOptions(): SelectOption[] {
    console.log('Building booking options from bookings array:', this.bookings);
    if (!this.bookings || this.bookings.length === 0) {
      console.log('No bookings available');
      return [{ value: '__none__', label: 'No bookings available' }];
    }
    return this.bookings.map(b => ({
      value: b.id,
      label: `${b.client_name} - ${b.package_name}`
    }));
  }

  // Map staff to select options
  get staffOptions(): SelectOption[] {
    console.log('Building staff options from staff array:', this.staff);
    console.log('Staff array length:', this.staff?.length);
    const options = [{ value: '__none__', label: 'Unassigned' }];
    if (this.staff && this.staff.length > 0) {
      // Create a map to track unique staff by ID to avoid duplicates
      const uniqueStaff = new Map();
      this.staff.forEach(s => {
        if (!uniqueStaff.has(s.id)) {
          uniqueStaff.set(s.id, s);
        }
      });

      console.log('Unique staff count:', uniqueStaff.size);
      uniqueStaff.forEach(s => {
        const name = s.staff_name || s.name || `${s.first_name || ''} ${s.last_name || ''}`.trim();
        const role = s.role || 'staff';
        console.log('Processing staff member:', s, 'Label:', `${name} (${role})`);
        options.push({
          value: s.id,
          label: `${name} (${role})`
        });
      });
    } else {
      console.log('No staff available');
    }
    console.log('Final staff options:', options);
    console.log('Final staff options length:', options.length);
    return options;
  }

  types: SelectOption[] = [
    { value: 'photo_editing', label: 'Photo Editing' },
    { value: 'video_editing', label: 'Video Editing' },
    { value: 'album_design', label: 'Album Design' },
    { value: 'soft_copy_delivery', label: 'Soft Copy Delivery' },
    { value: 'hard_copy_delivery', label: 'Hard Copy / Album' },
    { value: 'other', label: 'Other' },
  ];

  priorities: SelectOption[] = [
    { value: 'low', label: 'Low' },
    { value: 'normal', label: 'Normal' },
    { value: 'high', label: 'High' },
    { value: 'critical', label: 'Critical' },
  ];

  bookingId = '';
  type = 'photo_editing';
  assigneeId = '';
  title = '';
  deadline = '';
  description = '';
  priority = 'normal';
  materialNote = '';

  isSubmitting = false;

  isBookingOpen = false;
  isTypeOpen = false;
  isPriorityOpen = false;
  isAssigneeOpen = false;

  get bookingLabel(): string {
    return this.bookingOptions.find((b) => b.value === this.bookingId)?.label ?? 'Select booking';
  }

  get typeLabel(): string {
    return this.types.find((t) => t.value === this.type)?.label ?? 'Select type';
  }

  get assigneeLabel(): string {
    return this.staffOptions.find((s) => s.value === this.assigneeId)?.label ?? 'Select editor/staff';
  }

  get priorityLabel(): string {
    return this.priorities.find((p) => p.value === this.priority)?.label ?? 'Normal';
  }

  toggleBookingDropdown(): void {
    this.isBookingOpen = !this.isBookingOpen;
    this.isTypeOpen = false;
    this.isAssigneeOpen = false;
  }

  toggleTypeDropdown(): void {
    this.isTypeOpen = !this.isTypeOpen;
    this.isBookingOpen = false;
    this.isPriorityOpen = false;
    this.isAssigneeOpen = false;
  }

  togglePriorityDropdown(): void {
    this.isPriorityOpen = !this.isPriorityOpen;
    this.isBookingOpen = false;
    this.isTypeOpen = false;
    this.isAssigneeOpen = false;
  }

  selectPriority(value: string): void {
    this.priority = value;
    this.isPriorityOpen = false;
  }

  toggleAssigneeDropdown(): void {
    this.isAssigneeOpen = !this.isAssigneeOpen;
    this.isBookingOpen = false;
    this.isTypeOpen = false;
  }

  closeAllDropdowns(): void {
    this.isBookingOpen = false;
    this.isTypeOpen = false;
    this.isPriorityOpen = false;
    this.isAssigneeOpen = false;
  }

  selectBooking(value: string): void {
    this.bookingId = value;
    this.isBookingOpen = false;
  }

  selectType(value: string): void {
    this.type = value;
    this.isTypeOpen = false;
  }

  selectAssignee(value: string): void {
    this.assigneeId = value;
    this.isAssigneeOpen = false;
  }

  onCancel(): void {
    if (this.isSubmitting) return;
    this.closeModal.emit();
  }

  onSubmit(form: NgForm): void {
    console.log('Create button clicked!');
    console.log('Form data:', {
      title: this.title,
      deadline: this.deadline,
      type: this.type,
      priority: this.priority,
      assigneeId: this.assigneeId,
      bookingId: this.bookingId
    });

    // Simplified validation - just check if title exists
    if (!this.title || this.title.trim() === '') {
      console.log('Validation failed: missing title');
      alert('Please fill in Title');
      return;
    }

    // If deadline is empty, set a default one
    if (!this.deadline || this.deadline.trim() === '') {
      console.log('Deadline missing, setting default');
      const defaultDate = new Date();
      defaultDate.setDate(defaultDate.getDate() + 7); // 7 days from now
      this.deadline = defaultDate.toISOString().slice(0, 16);
    }

    console.log('Validation passed, emitting create event with deadline:', this.deadline);
    this.create.emit({
      bookingId: this.bookingId,
      type: this.type,
      assigneeId: this.assigneeId,
      title: this.title,
      deadline: this.deadline,
      description: this.description,
      priority: this.priority,
      materialNote: this.materialNote,
    });
  }

  resetForm(): void {
    this.bookingId = '';
    this.type = 'photo_editing';
    this.assigneeId = '';
    this.title = '';
    this.deadline = '';
    this.description = '';
    this.priority = 'normal';
    this.materialNote = '';
  }
}