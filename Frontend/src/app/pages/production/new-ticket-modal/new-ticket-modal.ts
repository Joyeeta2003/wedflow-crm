import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';

export interface NewTicketData {
  bookingId: string;
  type: string;
  assigneeId: string;
  title: string;
  deadline: string;
  description: string;
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

  // ASSUMPTION: mock booking list — replace with real bookings service data once confirmed
  bookings: SelectOption[] = [
    { value: '6a2802f6544a263c2cffe7f3', label: 'Swagatam & Swagata - ROYAL WEDDING PACKAGE' },
    { value: '6a5b20497a427311e7ce16c2', label: 'Swagatam & Swagata - STANDARD WEDDING PACKAGE' },
    { value: '6a5685947a427311e7ce06b3', label: 'Soham Biswas - Demo Testing' },
    { value: '6a67b817817c34c4ed708671', label: 'Jason - Om Photography Premium Package' },
    { value: '6a451fc8cf4d7fe2486b481e', label: 'Aniket - Om Photography Premium Package' },
    { value: '6a4212d6d3b007bb1f4ba0d9', label: 'Soumik & Shrya - Ultimate Wedding Package' },
    { value: '6a3d5d8399cc8d99623fd6e7', label: 'Subha - ROYAL WEDDING PACKAGE' },
  ];

  types: SelectOption[] = [
    { value: 'photo_editing', label: 'Photo Editing' },
    { value: 'video_editing', label: 'Video Editing' },
    { value: 'album_design', label: 'Album Design' },
    { value: 'soft_copy_delivery', label: 'Soft Copy Delivery' },
    { value: 'hard_copy_delivery', label: 'Hard Copy / Album' },
    { value: 'other', label: 'Other' },
  ];

  // ASSUMPTION: mock staff list — replace with real staff service data once confirmed
  staff: SelectOption[] = [
    { value: '__none__', label: 'Unassigned' },
    { value: '6a5685de7a427311e7ce0739', label: 'Abhirup (video editor)' },
    { value: '6a27ece8544a263c2cffe486', label: 'Akash Sarkar (photographer)' },
    { value: '6a94202ed3376a07f970bcd7', label: 'Joy (drone operator)' },
    { value: '6a1df2aeaddaa11f075b3ba7', label: 'Kathakali Mondal (cinematographer)' },
    { value: '6a27f0be544a263c2cffe4b4', label: 'Putul Sarkar (photo editor)' },
    { value: '6a45204dcf4d7fe2486b48c7', label: 'Rajib (photo editor)' },
    { value: '6a287ed299cc8d99623fc245', label: 'Rohan Gupta (photographer)' },
    { value: '6a27f0ed544a263c2cffe4cb', label: 'Srabani Dey (video editor)' },
    { value: '6a27f089544a263c2cffe49d', label: 'Sujan Das (videographer)' },
    { value: '6a43649beff108acd0166116', label: 'fjdfjhjd (cinematographer)' },
    { value: '6a437638eff108acd01664e5', label: 'srijon chakrabortty (videographer)' },
    { value: '6a5b230f7a427311e7ce1af6', label: 'ytewtywty (photographer)' },
  ];

  bookingId = '';
  type = 'photo_editing';
  assigneeId = '';
  title = '';
  deadline = '';
  description = '';

  isSubmitting = false;

  isBookingOpen = false;
  isTypeOpen = false;
  isAssigneeOpen = false;

  get bookingLabel(): string {
    return this.bookings.find((b) => b.value === this.bookingId)?.label ?? 'Select booking';
  }

  get typeLabel(): string {
    return this.types.find((t) => t.value === this.type)?.label ?? 'Select type';
  }

  get assigneeLabel(): string {
    return this.staff.find((s) => s.value === this.assigneeId)?.label ?? 'Select editor/staff';
  }

  toggleBookingDropdown(): void {
    this.isBookingOpen = !this.isBookingOpen;
    this.isTypeOpen = false;
    this.isAssigneeOpen = false;
  }

  toggleTypeDropdown(): void {
    this.isTypeOpen = !this.isTypeOpen;
    this.isBookingOpen = false;
    this.isAssigneeOpen = false;
  }

  toggleAssigneeDropdown(): void {
    this.isAssigneeOpen = !this.isAssigneeOpen;
    this.isBookingOpen = false;
    this.isTypeOpen = false;
  }

  closeAllDropdowns(): void {
    this.isBookingOpen = false;
    this.isTypeOpen = false;
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
    this.isSubmitting = true;

    // ASSUMPTION: simulated delay — replace with real API call once endpoint confirmed
    setTimeout(() => {
      this.create.emit({
        bookingId: this.bookingId,
        type: this.type,
        assigneeId: this.assigneeId,
        title: this.title,
        deadline: this.deadline,
        description: this.description,
      });
      this.isSubmitting = false;
    }, 800);
  }
}