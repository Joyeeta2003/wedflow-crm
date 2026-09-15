import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  Booking,
  BookingService,
  CrewPlanDay,
  CrewAssignment,
  BookingEvent
} from '../../../services/booking.service';

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
  imports: [CommonModule, RouterLink],
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
    { event_name: 'Mehendi', event_date: '2026-06-13', venue: 'ITC' },
    { event_name: 'Wedding', event_date: '2026-06-14', venue: 'ITC' },
    { event_name: 'Reception', event_date: '2026-06-15', venue: 'ITC' },
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
      roles: [
        { role: 'Photographer', quantity: 2 },
      ],
    },
  ],
  crew_assignments: [
    { id: 'a1', staff_name: 'Rohan Gupta', assigned_role: 'Photographer', event_name: 'Mehendi', event_date: '2026-06-13', event_time: '10:00 am', venue: 'ITC', status: 'assigned', is_full_day: true, is_notified: true, handover_status: 'submitted', files_status: 'submitted', submitted_at: '10 Jun, 2:49 AM' },
    { id: 'a2', staff_name: 'Akash Sarkar', assigned_role: 'Photographer', event_name: 'Mehendi', event_date: '2026-06-13', venue: 'ITC', status: 'assigned', is_full_day: true, is_notified: true, handover_status: 'pending', files_status: 'pending', submitted_at: null },
    { id: 'a3', staff_name: 'Rohan Gupta', assigned_role: 'Photographer', event_name: 'Wedding', event_date: '2026-06-14', venue: 'ITC', status: 'assigned', is_full_day: true, is_notified: true, handover_status: 'pending', files_status: 'pending', submitted_at: null },
    { id: 'a4', staff_name: 'Akash Sarkar', assigned_role: 'Photographer', event_name: 'Reception', event_date: '2026-06-15', venue: 'ITC', status: 'assigned', is_full_day: true, is_notified: true, handover_status: 'pending', files_status: 'pending', submitted_at: null },
    { id: 'a5', staff_name: 'Rohan Gupta', assigned_role: 'Photographer', event_name: 'Reception', event_date: '2026-06-15', venue: 'ITC', status: 'assigned', is_full_day: true, is_notified: true, handover_status: 'pending', files_status: 'pending', submitted_at: null },
    { id: 'a6', staff_name: 'Kathakali Mondal', assigned_role: 'Cinematographer', event_name: 'Wedding', event_date: '2026-06-14', venue: 'ITC', status: 'assigned', is_full_day: true, is_notified: true, handover_status: 'pending', files_status: 'pending', submitted_at: null },
    { id: 'a7', staff_name: 'fjdfjhjd', assigned_role: 'Cinematographer', event_name: 'Mehendi', event_date: '2026-06-13', venue: 'ITC', status: 'assigned', is_full_day: true, is_notified: true, handover_status: 'pending', files_status: 'pending', submitted_at: null },
    { id: 'a8', staff_name: 'Akash Sarkar', assigned_role: 'Photographer', event_name: 'Wedding', event_date: '2026-06-14', venue: 'ITC', status: 'assigned', is_full_day: true, is_notified: true, handover_status: 'pending', files_status: 'pending', submitted_at: null },
    { id: 'a9', staff_name: 'Kathakali Mondal', assigned_role: 'Cinematographer', event_name: 'Mehendi', event_date: '2026-06-13', venue: 'ITC', status: 'assigned', is_full_day: true, is_notified: true, handover_status: 'pending', files_status: 'pending', submitted_at: null },
    { id: 'a10', staff_name: 'ytewtywty', assigned_role: 'Photographer', event_name: 'Wedding', event_date: '2026-06-14', venue: 'ITC', status: 'assigned', is_full_day: true, is_notified: true, handover_status: 'pending', files_status: 'pending', submitted_at: null },
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

  // ASSUMPTION: no dedicated crew-count field on Booking; using assignment list length
  get crewCount(): number {
    return this.booking?.crew_assignments?.length ?? 0;
  }

  setTab(key: TabKey) {
    this.activeTab = key;
  }

  toggleWorkflow() {
    this.workflowOpen = !this.workflowOpen;
  }

  // other stages use a neutral outline style until confirmed
  workflowBadgeClass(stage: string | undefined): string {
    if (stage === 'Full Payment Received') return 'badge-success';
    return 'badge-neutral';
  }

  // Stage 2 helper — used by Crew tab (Package Crew Plan cards)
  assignedCount(day: CrewPlanDay, role: string): number {
    if (!this.booking?.crew_assignments) return 0;
    return this.booking.crew_assignments.filter(
      (a: CrewAssignment) => a.event_name === day.event_type && a.assigned_role === role,
    ).length;
  }

  // --- Package Crew Plan helpers ---
eventForDay(day: CrewPlanDay) {
  return this.booking?.event_days?.find(e => e.event_name === day.event_type);
}

roleStatus(day: CrewPlanDay, role: { role: string; quantity: number }): 'done' | 'left' {
  return this.assignedCount(day, role.role) >= role.quantity ? 'done' : 'left';
}

roleProgress(day: CrewPlanDay, role: { role: string; quantity: number }): number {
  if (!role.quantity) return 0;
  return Math.min(100, Math.round((this.assignedCount(day, role.role) / role.quantity) * 100));
}

get totalCrewSlots(): number {
  if (!this.booking?.package_crew_plan) return 0;
  return this.booking.package_crew_plan.reduce(
    (sum, day) => sum + day.roles.reduce((s, r) => s + r.quantity, 0), 0
  );
}

get pendingCrewSlots(): number {
  if (!this.booking?.package_crew_plan) return 0;
  let pending = 0;
  for (const day of this.booking.package_crew_plan) {
    for (const role of day.roles) {
      pending += Math.max(0, role.quantity - this.assignedCount(day, role.role));
    }
  }
  return pending;
}

// --- Actions (STUBBED — wire up to real service calls once endpoints confirmed) ---
onAddDay(): void {
  // TODO: open add-day modal / call bookingService
}

onRemoveDay(event: BookingEvent): void {
  // TODO: confirm + call bookingService
}

onAssignRole(day: CrewPlanDay, role: string): void {
  // TODO: open assign-crew modal scoped to this day+role
}

onAssignCrew(): void {
  // TODO: open general assign-crew modal
}

onVerifyFiles(assignment: CrewAssignment): void {
  // TODO: call bookingService
}

onRemoveAssignment(assignment: CrewAssignment): void {
  // TODO: confirm + call bookingService
}

}
