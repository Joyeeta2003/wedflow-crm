import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Booking } from '../../../../services/booking.service';
import { BookingService } from '../../../../services/booking.service';

export interface BookingDetailsFormData {
  mainEventDate: string;
  bookingDate: string;
  projectDivision: string;
  eventType: string;
  clientManager: string;
  selectionUploadProcess: string;
  reviewNotes: string;
  packageId: string;
  venue: string;
  mapLink: string;
  status: string;
  totalAmount: number;
  notes: string;
  remarks: string;
}

interface SelectOption {
  value: string;
  label: string;
}

@Component({
  selector: 'app-booking-details-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './booking-details-modal.html',
  styleUrl: './booking-details-modal.scss',
})
export class BookingDetailsModal implements OnChanges {
  private bookingService = inject(BookingService);
  @Input({ required: true }) booking!: Booking;

  @Output() closeModal = new EventEmitter<void>();
  @Output() save = new EventEmitter<BookingDetailsFormData>();

  eventTypes: SelectOption[] = [
    { value: 'Wedding', label: 'Wedding' },
    { value: 'Reception', label: 'Reception' },
    { value: 'Rice Ceremony', label: 'Rice Ceremony' },
    { value: 'Baby Shoot', label: 'Baby Shoot' },
    { value: 'Birthday', label: 'Birthday' },
    { value: 'Pre-Wedding', label: 'Pre-Wedding' },
    { value: 'Photo Only', label: 'Photo Only' },
    { value: 'Video Only', label: 'Video Only' },
    { value: 'Other', label: 'Other' },
  ];

  // Load packages from backend API
  packages: SelectOption[] = [];
  isLoadingPackages = false;

  statuses: SelectOption[] = [
    { value: 'booking_confirmed', label: 'Booking Confirmed' },
    { value: 'advance_received', label: 'Advance Received' },
    { value: 'contract_signed', label: 'Contract Signed' },
    { value: 'planning_stage', label: 'Planning Stage' },
    { value: 'crew_assigned', label: 'Crew Assigned' },
    { value: 'pre_wedding_scheduled', label: 'Pre-Wedding Scheduled' },
    { value: 'event_completed', label: 'Event Completed' },
    { value: 'data_received', label: 'Data Received' },
    { value: 'editing_assigned', label: 'Editing Assigned' },
    { value: 'editing_in_progress', label: 'Editing In Progress' },
    { value: 'qc_review', label: 'QC Review' },
    { value: 'client_review', label: 'Client Review' },
    { value: 'revision_requested', label: 'Revision Requested' },
    { value: 'payment_pending', label: 'Payment Pending' },
    { value: 'full_payment_received', label: 'Full Payment Received' },
    { value: 'album_designing', label: 'Album Designing' },
    { value: 'album_printing', label: 'Album Printing' },
    { value: 'ready_for_delivery', label: 'Ready For Delivery' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'completed', label: 'Completed' },
    { value: 'archived', label: 'Archived' },
  ];

  // Accordion state — Core studio information open by default, rest closed (matches original)
  openSections: Record<'core' | 'payment' | 'album' | 'video', boolean> = {
    core: true,
    payment: false,
    album: false,
    video: false,
  };

  // Form fields
  mainEventDate = '';
  bookingDate = '';
  projectDivision = '';
  eventType = '';
  clientManager = '';
  selectionUploadProcess = '';
  reviewNotes = '';
  packageId = '';
  venue = '';
  mapLink = '';
  status = '';
  totalAmount: number | null = null;
  notes = '';
  remarks = '';

  isSubmitting = false;

  // Custom-select open states
  isEventTypeOpen = false;
  isPackageOpen = false;
  isStatusOpen = false;

  // Touched flags (Staff-field validation pattern)
  mainEventDateTouched = false;
  venueTouched = false;
  statusTouched = false;
  totalAmountTouched = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['booking'] && this.booking) {
      // Load booking data into form
      this.mainEventDate = (this.booking as any).main_event_date ?? '';
      this.bookingDate = (this.booking as any).booking_date ?? '';
      this.projectDivision = (this.booking as any).project_division ?? '';
      this.eventType = (this.booking as any).event_type ?? '';
      this.clientManager = (this.booking as any).client_manager ?? '';
      this.selectionUploadProcess = (this.booking as any).selection_upload_process ?? '';
      this.reviewNotes = (this.booking as any).review_notes ?? '';
      this.packageId = (this.booking as any).package_id ?? '';
      this.venue = (this.booking as any).venue ?? '';
      this.mapLink = (this.booking as any).map_link ?? '';
      this.status = (this.booking as any).status ?? '';
      this.totalAmount = (this.booking as any).total_amount ?? null;
      this.notes = (this.booking as any).notes ?? '';
      this.remarks = (this.booking as any).remarks ?? '';
      
      // Load packages from API
      this.loadPackages();
    }
  }

  loadPackages() {
    this.isLoadingPackages = true;
    this.bookingService.getPackages().subscribe({
      next: (response) => {
        this.packages = response.packages.map(pkg => ({
          value: pkg.id,
          label: `${pkg.name} - Rs. ${pkg.price}`
        }));
        this.isLoadingPackages = false;
      },
      error: (error) => {
        console.error('Error loading packages:', error);
        this.isLoadingPackages = false;
      }
    });
  }

  get eventTypeLabel(): string {
    return this.eventTypes.find((e) => e.value === this.eventType)?.label ?? 'Select event type';
  }

  get packageLabel(): string {
    return this.packages.find((p) => p.value === this.packageId)?.label ?? 'Select package';
  }

  get statusLabel(): string {
    return this.statuses.find((s) => s.value === this.status)?.label ?? 'Select status';
  }

  get mainEventDateInvalid(): boolean {
    return this.mainEventDateTouched && !this.mainEventDate.trim();
  }

  get venueInvalid(): boolean {
    return this.venueTouched && !this.venue.trim();
  }

  get statusInvalid(): boolean {
    return this.statusTouched && !this.status;
  }

  get totalAmountInvalid(): boolean {
    return this.totalAmountTouched && (this.totalAmount === null || this.totalAmount <= 0);
  }

  toggleSection(key: 'core' | 'payment' | 'album' | 'video'): void {
    this.openSections[key] = !this.openSections[key];
  }

  toggleEventTypeDropdown(): void {
    this.isEventTypeOpen = !this.isEventTypeOpen;
    this.isPackageOpen = false;
    this.isStatusOpen = false;
  }

  togglePackageDropdown(): void {
    this.isPackageOpen = !this.isPackageOpen;
    this.isEventTypeOpen = false;
    this.isStatusOpen = false;
  }

  toggleStatusDropdown(): void {
    this.isStatusOpen = !this.isStatusOpen;
    this.isEventTypeOpen = false;
    this.isPackageOpen = false;
    if (!this.isStatusOpen) this.statusTouched = true;
  }

  closeAllDropdowns(): void {
    this.isEventTypeOpen = false;
    this.isPackageOpen = false;
    this.isStatusOpen = false;
  }

  selectEventType(value: string): void {
    this.eventType = value;
    this.isEventTypeOpen = false;
  }

  selectPackage(value: string): void {
    this.packageId = value;
    this.isPackageOpen = false;
  }

  selectStatus(value: string): void {
    this.status = value;
    this.isStatusOpen = false;
  }

  onMainEventDateBlur(): void {
    this.mainEventDateTouched = true;
  }

  onVenueBlur(): void {
    this.venueTouched = true;
  }

  onTotalAmountBlur(): void {
    this.totalAmountTouched = true;
  }

  onCancel(): void {
    if (this.isSubmitting) return;
    this.closeModal.emit();
  }

  onSubmit(form: NgForm): void {
    this.mainEventDateTouched = true;
    this.venueTouched = true;
    this.statusTouched = true;
    this.totalAmountTouched = true;

    if (
      !this.mainEventDate.trim() ||
      !this.venue.trim() ||
      !this.status ||
      this.totalAmount === null ||
      this.totalAmount <= 0
    ) {
      return;
    }

    this.isSubmitting = true;

    // Use real API call to update booking
    this.bookingService.updateBooking(this.booking.id, {
      clientId: this.booking.client_id,
      packageId: this.packageId,
      bookingDate: this.bookingDate,
      eventDate: this.mainEventDate,
      totalAmount: this.totalAmount,
      venue: this.venue,
      eventType: this.eventType,
      status: this.status,
      currentWorkflowStage: this.status,
      notes: this.notes
    }).subscribe({
      next: (response) => {
        this.save.emit({
          mainEventDate: this.mainEventDate,
          bookingDate: this.bookingDate,
          projectDivision: this.projectDivision,
          eventType: this.eventType,
          clientManager: this.clientManager,
          selectionUploadProcess: this.selectionUploadProcess,
          reviewNotes: this.reviewNotes,
          packageId: this.packageId,
          venue: this.venue,
          mapLink: this.mapLink,
          status: this.status,
          totalAmount: this.totalAmount as number,
          notes: this.notes,
          remarks: this.remarks,
        });
        this.isSubmitting = false;
      },
      error: (error) => {
        console.error('Error updating booking:', error);
        this.isSubmitting = false;
      }
    });
  }
}