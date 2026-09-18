import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  Booking,
  BookingService,
  BookingEvent,
  CrewPlanDay,
  CrewAssignment,
  PaymentSchedule,
  DeliveryItem,
  MediaItem,
    ReminderLog,
} from '../../../services/booking.service';

import { CrewTab } from './crew-tab/crew-tab';
import { PaymentsTab } from './payments-tab/payments-tab';
import { DeliveriesTab } from './deliveries-tab/deliveries-tab';
import { NewDeliveryData } from './deliveries-tab/delivery-modal/delivery-modal';
import { NewEventDayData } from './crew-tab/event-day-modal/event-day-modal';
import { NewAssignmentData } from './crew-tab/assign-crew-modal/assign-crew-modal';
import { StudioTrackerTab } from './studio-tracker-tab/studio-tracker-tab';
import { Toast } from '../../../components/toast/toast';
import {
  BookingDetailsModal,
  BookingDetailsFormData,
} from './booking-details-modal/booking-details-modal';
import { MediaTab } from './media-tab/media-tab';
import { NewMediaItemData } from './media-tab/media-item-modal/media-item-modal';
import { RemindersTab } from './reminders-tab/reminders-tab';

interface WorkflowStageDef {
  number: number;
  name: string;
  description: string;
}

const WORKFLOW_STAGES: WorkflowStageDef[] = [
  {
    number: 1,
    name: 'Booking Confirmed',
    description: 'The customer has accepted the booking and the event dates are reserved.',
  },
  {
    number: 2,
    name: 'Advance Received',
    description: 'The booking advance has been received and recorded.',
  },
  {
    number: 3,
    name: 'Contract Signed',
    description: 'The customer and company have completed the booking agreement.',
  },
  {
    number: 4,
    name: 'Planning Stage',
    description:
      'Event schedule, venue, customer requirements, and deliverables are being finalized.',
  },
  {
    number: 5,
    name: 'Crew Assigned',
    description:
      'Photographers, videographers, and other required team members have been assigned.',
  },
  {
    number: 6,
    name: 'Pre-Wedding Scheduled',
    description: 'The optional pre-wedding shoot has been scheduled.',
  },
  {
    number: 7,
    name: 'Event Completed',
    description: 'The event-day photography or videography work has been completed.',
  },
  {
    number: 8,
    name: 'Data Received',
    description: 'The captured photos and videos have been received and are ready for backup.',
  },
  {
    number: 9,
    name: 'Editing Assigned',
    description: 'The post-production work has been assigned to the appropriate editor.',
  },
  {
    number: 10,
    name: 'Editing In Progress',
    description: 'The assigned editor is currently working on the photos or videos.',
  },
  {
    number: 11,
    name: 'QC Review',
    description: 'The company is checking the edited work before sharing it with the customer.',
  },
  {
    number: 12,
    name: 'Client Review',
    description: 'A preview has been shared with the customer for review and approval.',
  },
  {
    number: 13,
    name: 'Revision Requested',
    description: 'The customer or quality team has requested changes to the edited work.',
  },
  {
    number: 14,
    name: 'Payment Pending',
    description: 'A remaining customer payment is due before final delivery.',
  },
  {
    number: 15,
    name: 'Full Payment Received',
    description: 'All payments for this booking have been received.',
  },
  {
    number: 16,
    name: 'Album Designing',
    description: 'The album layout and design are being prepared.',
  },
  {
    number: 17,
    name: 'Album Printing',
    description: 'The approved album has been sent for printing.',
  },
  {
    number: 18,
    name: 'Ready For Delivery',
    description: 'All final items are prepared and waiting to be delivered.',
  },
  {
    number: 19,
    name: 'Delivered',
    description: 'The final photos, videos, album, or other items have been delivered.',
  },
  {
    number: 20,
    name: 'Completed',
    description: 'All work, payments, and deliveries for this booking are complete.',
  },
  {
    number: 21,
    name: 'Archived',
    description: 'The completed booking has been moved to the archive for future reference.',
  },
];

type TabKey = 'crew' | 'payments' | 'deliveries' | 'tracker' | 'media' | 'reminders' | 'invoice';

@Component({
  selector: 'app-booking-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, CrewTab, PaymentsTab, DeliveriesTab, Toast, StudioTrackerTab, BookingDetailsModal, MediaTab, RemindersTab],
  templateUrl: './booking-detail.html',
  styleUrl: './booking-detail.scss',
})
export class BookingDetail implements OnInit {
  booking: Booking | null = null;
  loading = true;
  error = '';

  workflowOpen = false;
  activeTab: TabKey = 'crew';

  workflowStages = WORKFLOW_STAGES;

  toastVisible = false;
  toastTitle = '';
  toastMsg = '';
  toastVariant: 'success' | 'error' = 'success';
  private toastTimeout: any;

  get currentStageNumber(): number {
    const stage = WORKFLOW_STAGES.find((s) => s.name === this.booking?.current_workflow_stage);
    return stage?.number ?? 1;
  }

  get stagePercent(): number {
    const total = WORKFLOW_STAGES.length;
    return Math.round(((this.currentStageNumber - 1) / (total - 1)) * 100);
  }

  stageStatus(stageNumber: number): 'completed' | 'current' | 'upcoming' {
    if (stageNumber < this.currentStageNumber) return 'completed';
    if (stageNumber === this.currentStageNumber) return 'current';
    return 'upcoming';
  }

  getStageHistory(stageName: string): { date: string; by: string } | null {
    return null;
  }

  tabs: { key: TabKey; label: string }[] = [
    { key: 'crew', label: 'Crew' },
    { key: 'payments', label: 'Payments' },
    { key: 'deliveries', label: 'Deliveries' },
    { key: 'tracker', label: 'Studio Tracker' },
    { key: 'media', label: 'Media' },
    { key: 'reminders', label: 'Reminders' },
    { key: 'invoice', label: 'Invoice' },
  ];

  constructor(
    private route: ActivatedRoute,
    private bookingService: BookingService,
    private cdr: ChangeDetectorRef,
  ) {}

  // TEMPORARY DUMMY DATA — for UI testing only. Remove once backend confirmed working.
  private mockBooking: Booking = {
    id: 'mock-1',
    booking_number: 'DRVSTU-BKG-000009',
    booking_date: '2026-01-10',
    event_date: '2026-06-13',
    client_id: 'client-1',
    client_name: 'Arnab',
    package_id: 'pkg-1',
    package_name: 'Royal Wedding Package',
    total_amount: 350000,
    status: 'confirmed',
    current_workflow_stage: 'Full Payment Received',
    venue: 'ITC',
    notes: null,
    amount_paid: 665000,
    event_days: [
      { id: 'e1', event_name: 'Mehendi', event_date: '2026-06-13', venue: 'ITC' },
      { id: 'e2', event_name: 'Wedding', event_date: '2026-06-14', venue: 'ITC' },
      { id: 'e3', event_name: 'Reception', event_date: '2026-06-15', venue: 'ITC' },
    ],
    package_crew_plan: [
      {
        day_number: 1,
        event_type: 'Mehendi',
        roles: [
          { role: 'Photographer', quantity: 2 },
          { role: 'Cinematographer', quantity: 2 },
        ],
      },
      {
        day_number: 2,
        event_type: 'Wedding',
        roles: [
          { role: 'Photographer', quantity: 3 },
          { role: 'Cinematographer', quantity: 1 },
          { role: 'Drone Operator', quantity: 1 },
        ],
      },
      {
        day_number: 3,
        event_type: 'Reception',
        roles: [{ role: 'Photographer', quantity: 2 }],
      },
    ],
    crew_assignments: [
      {
        id: 'a1',
        staff_name: 'Rohan Gupta',
        assigned_role: 'Photographer',
        event_name: 'Mehendi',
        event_date: '2026-06-13',
        event_time: '10:00 am',
        venue: 'ITC',
        status: 'assigned',
        is_full_day: true,
        is_notified: true,
        handover_status: 'submitted',
        files_status: 'submitted',
        submitted_at: '10 Jun, 2:49 AM',
      },
      {
        id: 'a2',
        staff_name: 'Akash Sarkar',
        assigned_role: 'Photographer',
        event_name: 'Mehendi',
        event_date: '2026-06-13',
        venue: 'ITC',
        status: 'assigned',
        is_full_day: true,
        is_notified: true,
        handover_status: 'pending',
        files_status: 'pending',
        submitted_at: null,
      },
      {
        id: 'a3',
        staff_name: 'Rohan Gupta',
        assigned_role: 'Photographer',
        event_name: 'Wedding',
        event_date: '2026-06-14',
        venue: 'ITC',
        status: 'assigned',
        is_full_day: true,
        is_notified: true,
        handover_status: 'pending',
        files_status: 'pending',
        submitted_at: null,
      },
      {
        id: 'a4',
        staff_name: 'Akash Sarkar',
        assigned_role: 'Photographer',
        event_name: 'Reception',
        event_date: '2026-06-15',
        venue: 'ITC',
        status: 'assigned',
        is_full_day: true,
        is_notified: true,
        handover_status: 'pending',
        files_status: 'pending',
        submitted_at: null,
      },
      {
        id: 'a5',
        staff_name: 'Rohan Gupta',
        assigned_role: 'Photographer',
        event_name: 'Reception',
        event_date: '2026-06-15',
        venue: 'ITC',
        status: 'assigned',
        is_full_day: true,
        is_notified: true,
        handover_status: 'pending',
        files_status: 'pending',
        submitted_at: null,
      },
      {
        id: 'a6',
        staff_name: 'Kathakali Mondal',
        assigned_role: 'Cinematographer',
        event_name: 'Wedding',
        event_date: '2026-06-14',
        venue: 'ITC',
        status: 'assigned',
        is_full_day: true,
        is_notified: true,
        handover_status: 'pending',
        files_status: 'pending',
        submitted_at: null,
      },
      {
        id: 'a7',
        staff_name: 'fjdfjhjd',
        assigned_role: 'Cinematographer',
        event_name: 'Mehendi',
        event_date: '2026-06-13',
        venue: 'ITC',
        status: 'assigned',
        is_full_day: true,
        is_notified: true,
        handover_status: 'pending',
        files_status: 'pending',
        submitted_at: null,
      },
      {
        id: 'a8',
        staff_name: 'Akash Sarkar',
        assigned_role: 'Photographer',
        event_name: 'Wedding',
        event_date: '2026-06-14',
        venue: 'ITC',
        status: 'assigned',
        is_full_day: true,
        is_notified: true,
        handover_status: 'pending',
        files_status: 'pending',
        submitted_at: null,
      },
      {
        id: 'a9',
        staff_name: 'Kathakali Mondal',
        assigned_role: 'Cinematographer',
        event_name: 'Mehendi',
        event_date: '2026-06-13',
        venue: 'ITC',
        status: 'assigned',
        is_full_day: true,
        is_notified: true,
        handover_status: 'pending',
        files_status: 'pending',
        submitted_at: null,
      },
      {
        id: 'a10',
        staff_name: 'ytewtywty',
        assigned_role: 'Photographer',
        event_name: 'Wedding',
        event_date: '2026-06-14',
        venue: 'ITC',
        status: 'assigned',
        is_full_day: true,
        is_notified: true,
        handover_status: 'pending',
        files_status: 'pending',
        submitted_at: null,
      },
    ],
    payment_schedule: [
      {
        id: 'p1',
        installment_name: 'Advance',
        amount: 105000,
        due_date: '2026-06-13',
        paid_date: '2026-06-30',
        status: 'Approved',
        notes: null,
      },
      {
        id: 'p2',
        installment_name: 'Advance',
        amount: 105000,
        due_date: '2026-06-10',
        paid_date: '2026-06-30',
        status: 'Approved',
        notes: null,
      },
      {
        id: 'p3',
        installment_name: 'Advance',
        amount: 105000,
        due_date: '2026-06-14',
        paid_date: '2026-06-30',
        status: 'Approved',
        notes: null,
      },
      {
        id: 'p4',
        installment_name: 'Advance',
        amount: 350000,
        due_date: '2026-06-10',
        paid_date: '2026-06-30',
        status: 'Approved',
        notes: null,
      },
    ],
    deliveries: [
      {
        id: 'd1',
        type: '15-20 Minute Cinematic Wedding Film',
        description: '15-20 Minute Cinematic Wedding Film',
        due_date: null,
        status: 'Pending',
        delivered_date: null,
        notes: null,
      },
      {
        id: 'd2',
        type: 'Drone Coverage for Outdoor Events',
        description: 'Drone Coverage for Outdoor Events',
        due_date: null,
        status: 'Pending',
        delivered_date: null,
        notes: null,
      },
      {
        id: 'd3',
        type: 'Same-Day Instagram Reels (3-5)',
        description: 'Same-Day Instagram Reels (3-5)',
        due_date: null,
        status: 'Delivered',
        delivered_date: '2026-06-30',
        notes: null,
      },
      {
        id: 'd4',
        type: '4K Wedding Highlight Video (5-7 Minutes)',
        description: '4K Wedding Highlight Video (5-7 Minutes)',
        due_date: null,
        status: 'Pending',
        delivered_date: null,
        notes: null,
      },
      {
        id: 'd5',
        type: 'Pre-Wedding Photoshoot (1 Day)',
        description: 'Pre-Wedding Photoshoot (1 Day)',
        due_date: null,
        status: 'Delivered',
        delivered_date: '2026-06-10',
        notes: null,
      },
      {
        id: 'd6',
        type: 'Premium Designer Wedding Album (40 Sheets)',
        description: 'Premium Designer Wedding Album (40 Sheets)',
        due_date: null,
        status: 'Delivered',
        delivered_date: '2026-06-10',
        notes: null,
      },
      {
        id: 'd7',
        type: 'All Raw Photos & Videos',
        description: 'All Raw Photos & Videos',
        due_date: null,
        status: 'In Progress',
        delivered_date: null,
        notes: null,
      },
      {
        id: 'd8',
        type: '500+ Professionally Edited Photos',
        description: '500+ Professionally Edited Photos',
        due_date: null,
        status: 'Pending',
        delivered_date: null,
        notes: null,
      },
      {
        id: 'd9',
        type: 'Cloud Storage Access for 1 Year',
        description: 'Cloud Storage Access for 1 Year',
        due_date: null,
        status: 'Pending',
        delivered_date: null,
        notes: null,
      },
    ],
        reminders: [
      { id: 'r1', reminder_type: 'client reminder', days_before_event: 1, scheduled_date: '2026-06-12', status: 'sent' },
      { id: 'r2', reminder_type: 'client reminder', days_before_event: 3, scheduled_date: '2026-06-10', status: 'sent' },
      { id: 'r3', reminder_type: 'crew details customer', days_before_event: 3, scheduled_date: '2026-06-10', status: 'sent' },
      { id: 'r4', reminder_type: 'crew details customer', days_before_event: 3, scheduled_date: '2026-06-12', status: 'skipped' },
      { id: 'r5', reminder_type: 'crew details customer', days_before_event: 3, scheduled_date: '2026-06-11', status: 'skipped' },
      { id: 'r6', reminder_type: 'client reminder', days_before_event: 7, scheduled_date: '2026-06-06', status: 'sent' },
      { id: 'r7', reminder_type: 'client reminder', days_before_event: 15, scheduled_date: '2026-05-29', status: 'sent' },
      { id: 'r8', reminder_type: 'client reminder', days_before_event: 30, scheduled_date: '2026-05-14', status: 'sent' },
      { id: 'r9', reminder_type: 'client reminder', days_before_event: 60, scheduled_date: '2026-04-14', status: 'sent' },
    ],
  };

  ngOnInit(): void {
    // TEMPORARY — bypasses real API for UI testing. Restore the block below once confirmed.
    this.booking = this.mockBooking;
    this.loading = false;
    return;

    /* ORIGINAL — uncomment when ready to test against real backend
    const bookingId = this.route.snapshot.paramMap.get('id');
    if (!bookingId) {
      this.error = 'Booking not found';
      this.loading = false;
      return;
    }

    this.bookingService.getBookingById(bookingId).subscribe({
      next: (response) => {
        this.booking = response.booking;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading booking:', error);
        this.error = error?.error?.error || 'Failed to load booking';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
    */
  }

  formatDate(value: string | null): string {
    if (!value) return '—';
    return new Date(value).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      weekday: 'long',
    });
  }

  formatAmount(value: number): string {
    return 'Rs. ' + Number(value).toLocaleString('en-IN');
  }

  get amountPaid(): number {
    return Number(this.booking?.amount_paid || 0);
  }

  get balanceDue(): number {
    return Number(this.booking?.total_amount || 0) - this.amountPaid;
  }

  get paymentProgress(): number {
    const total = Number(this.booking?.total_amount || 0);
    return total > 0 ? Math.round((this.amountPaid / total) * 100) : 0;
  }

  get crewCount(): number {
    return this.booking?.crew_assignments?.length ?? 0;
  }

  setTab(key: TabKey) {
    this.activeTab = key;
  }

  toggleWorkflow() {
    this.workflowOpen = !this.workflowOpen;
  }

  workflowBadgeClass(stage: string | undefined): string {
    if (stage === 'Full Payment Received') return 'badge-success';
    return 'badge-neutral';
  }

  private showToast(
    title: string,
    message: string,
    variant: 'success' | 'error' = 'success',
  ): void {
    this.toastTitle = title;
    this.toastMsg = message;
    this.toastVariant = variant;
    this.toastVisible = true;
    clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(() => {
      this.toastVisible = false;
      this.cdr.detectChanges();
    }, 2500);
  }

  onToastClosed(): void {
    this.toastVisible = false;
    clearTimeout(this.toastTimeout);
  }

  // --- Crew tab event handlers ---
  onCrewAddDay(data: NewEventDayData): void {
    if (!this.booking) return;
    const newDay: BookingEvent = {
      id: 'e' + Date.now(), // ASSUMPTION — real id backend theke ashবে
      event_name: data.eventType,
      event_date: data.datePending ? null : data.date || null,
      venue: data.venue || null,
      notes: data.notes || null,
      date_pending: data.datePending,
    };
    this.booking.event_days = [...(this.booking.event_days ?? []), newDay];
    this.showToast('Event day added', 'The event day has been added successfully.');
  }

  onCrewRemoveDay(e: BookingEvent): void {
    if (!this.booking?.event_days) return;
    this.booking.event_days = this.booking.event_days.filter((x) => x.id !== e.id);
    this.showToast('Deleted', 'The event day has been removed.');
  }

  onCrewAssignMember(data: NewAssignmentData): void {
    if (!this.booking) return;
    const newAssignment: CrewAssignment = {
      id: 'a' + Date.now(), // ASSUMPTION — real id backend theke ashবে
      staff_name: data.staffName,
      assigned_role: data.role,
      event_name: data.eventName,
      event_date: data.eventDate ?? '',
      event_time: data.reportTime || undefined,
      venue: data.reportLocation || data.venue,
      status: 'assigned',
      is_full_day: data.shift === 'full_day',
      is_notified: false,
      handover_status: 'pending',
      files_status: 'pending',
      submitted_at: null,
    };
    this.booking.crew_assignments = [...(this.booking.crew_assignments ?? []), newAssignment];
    this.showToast('Crew assigned', `${data.staffName} has been assigned as ${data.role}.`);
  }

  onCrewVerifyFiles(a: CrewAssignment): void {
    /* TODO */
  }

  onCrewRemoveAssignment(a: CrewAssignment): void {
    if (!this.booking?.crew_assignments) return;
    this.booking.crew_assignments = this.booking.crew_assignments.filter((x) => x.id !== a.id);
    this.showToast('Deleted', 'The crew assignment has been removed.');
  }

  // --- Payments tab event handlers ---
  onPaymentCreate(data: any): void {
    if (!this.booking) return;
    const newItem: PaymentSchedule = {
      id: 'p' + Date.now(), // ASSUMPTION — real id backend theke ashবে
      installment_name: data.label,
      amount: Number(data.amount) || 0,
      due_date: data.dueDate || null,
      paid_date: null,
      status: 'Pending', // ASSUMPTION — naya add kora installment default status
      notes: data.notes || null,
    };
    this.booking.payment_schedule = [...(this.booking.payment_schedule ?? []), newItem];
    this.showToast('Payment added', 'The payment installment has been added successfully.');
  }

  onPaymentDelete(p: PaymentSchedule): void {
    if (!this.booking?.payment_schedule) return;
    this.booking.payment_schedule = this.booking.payment_schedule.filter((x) => x.id !== p.id);
    this.showToast('Deleted', 'The payment installment has been removed.');
  }

  // --- Deliveries tab event handlers ---
  onDeliveryCreate(data: NewDeliveryData): void {
    if (!this.booking) return;
    const newItem: DeliveryItem = {
      id: 'd' + Date.now(),
      type: data.type,
      description: data.description,
      due_date: data.dueDate || null,
      status: 'Pending',
      delivered_date: null,
      notes: data.notes || null,
    };
    this.booking.deliveries = [...(this.booking.deliveries ?? []), newItem];
    this.showToast('Delivery added', 'The delivery item has been added successfully.');
  }

    // --- Media tab event handlers ---
  onMediaCreate(data: NewMediaItemData): void {
    if (!this.booking) return;
    const newItem: MediaItem = {
      id: 'm' + Date.now(), // ASSUMPTION — real id backend theke ashবে
      media_type: data.mediaType,
      label: data.label,
      capacity: data.capacity || null,
      photographer: data.photographer || null,
      notes: data.notes || null,
    };
    this.booking.media = [...(this.booking.media ?? []), newItem];
    this.showToast('Media added', 'The storage item has been added successfully.');
  }

  onMediaDelete(m: MediaItem): void {
    if (!this.booking?.media) return;
    this.booking.media = this.booking.media.filter((x) => x.id !== m.id);
    this.showToast('Deleted', 'The storage item has been removed.');
  }

  onDeliveryStart(d: DeliveryItem): void {
    d.status = 'In Progress';
  }

  onDeliveryMarkReady(d: DeliveryItem): void {
    d.status = 'Delivered';
    d.delivered_date = new Date().toISOString();
  }

  onDeliveryDelete(d: DeliveryItem): void {
    if (!this.booking?.deliveries) return;
    this.booking.deliveries = this.booking.deliveries.filter((x) => x.id !== d.id);
    this.showToast('Deleted', 'The delivery item has been removed.');
  }

  // state
  isBookingDetailsModalOpen = false;

  onOpenBookingDetailsModal(): void {
    this.isBookingDetailsModalOpen = true;
  }

  onCloseBookingDetailsModal(): void {
    this.isBookingDetailsModalOpen = false;
  }

onSaveBookingDetails(data: BookingDetailsFormData): void {
  if (!this.booking) return;

  // TODO: real API call once endpoint confirmed — merging into local mock for now
  Object.assign(this.booking, {
    main_event_date: data.mainEventDate,
    booking_date: data.bookingDate,
    project_division: data.projectDivision,
    event_type: data.eventType,
    client_manager: data.clientManager,
    selection_upload_process: data.selectionUploadProcess,
    review_notes: data.reviewNotes,
    package_id: data.packageId,
    venue: data.venue,
    map_link: data.mapLink,
    status: data.status,
    total_amount: data.totalAmount,
    notes: data.notes,
    remarks: data.remarks,
  });
  this.isBookingDetailsModalOpen = false;

  this.toastTitle = 'Booking updated';
  this.toastMsg = '';
  this.toastVariant = 'success';
  this.toastVisible = true;
}

  
}
