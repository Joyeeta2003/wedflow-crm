import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { BookingService, Booking as ApiBooking } from '../../services/booking.service';

interface StageBooking {
  id: string;
  bookingId: string;
  clientName: string;
  eventDate: string | null;
  packageName: string;
  venue: string | null;
}

type StageCategory =
  | 'Lead'
  | 'Sales'
  | 'Booking'
  | 'Accounts'
  | 'Planning'
  | 'Team'
  | 'Shoot'
  | 'Post Production'
  | 'Review'
  | 'Delivery'
  | 'Complete'
  | 'Archive';

interface WorkflowStageColumn {
  key: string;
  label: string;
  category: StageCategory;
  bookings: StageBooking[];
}

const STAGE_DEFS: { key: string; label: string; category: StageCategory }[] = [
  { key: 'Booking Confirmed', label: 'Booking Confirmed', category: 'Booking' },
  { key: 'Advance Received', label: 'Advance Received', category: 'Accounts' },
  { key: 'Contract Signed', label: 'Contract Signed', category: 'Booking' },
  { key: 'Planning Stage', label: 'Planning Stage', category: 'Planning' },
  { key: 'Crew Assigned', label: 'Crew Assigned', category: 'Team' },
  { key: 'Pre-Wedding Scheduled', label: 'Pre-Wedding Scheduled', category: 'Shoot' },
  { key: 'Event Completed', label: 'Event Completed', category: 'Shoot' },
  { key: 'Data Received', label: 'Data Received', category: 'Post Production' },
  { key: 'Editing Assigned', label: 'Editing Assigned', category: 'Post Production' },
  { key: 'Editing In Progress', label: 'Editing In Progress', category: 'Post Production' },
  { key: 'QC Review', label: 'QC Review', category: 'Review' },
  { key: 'Client Review', label: 'Client Review', category: 'Review' },
  { key: 'Revision Requested', label: 'Revision Requested', category: 'Review' },
  { key: 'Payment Pending', label: 'Payment Pending', category: 'Accounts' },
  { key: 'Full Payment Received', label: 'Full Payment Received', category: 'Accounts' },
  { key: 'Album Designing', label: 'Album Designing', category: 'Delivery' },
  { key: 'Album Printing', label: 'Album Printing', category: 'Delivery' },
  { key: 'Ready For Delivery', label: 'Ready For Delivery', category: 'Delivery' },
  { key: 'Delivered', label: 'Delivered', category: 'Delivery' },
  { key: 'Completed', label: 'Completed', category: 'Complete' },
  { key: 'Archived', label: 'Archived', category: 'Archive' },
    { key: 'Lead Received', label: 'Lead Received', category: 'Lead' },
  { key: 'Follow-up Pending', label: 'Follow-up Pending', category: 'Lead' },
  { key: 'Quotation Sent', label: 'Quotation Sent', category: 'Sales' },
  { key: 'Negotiation', label: 'Negotiation', category: 'Sales' },
];

@Component({
  selector: 'app-workflow-board',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './workflow-board.html',
  styleUrl: './workflow-board.scss',
})
export class WorkflowBoard implements OnInit {
  isLoading = false;
  searchTerm = '';
  columns: WorkflowStageColumn[] = [];

  constructor(private bookingService: BookingService) {}

  // TEMPORARY DUMMY DATA — for UI testing only. Remove once backend confirmed working.
  private mockBookings: StageBooking[] = [
    {
      id: 'mock-1',
      bookingId: 'DRVSTU-BKG-000009',
      clientName: 'Arnab',
      eventDate: '2026-06-13',
      packageName: 'Royal Wedding Package',
      venue: 'ITC',
    },
    {
      id: 'mock-2',
      bookingId: 'DRVSTU-BKG-000010',
      clientName: 'Swagatam & Swagata',
      eventDate: '2026-06-30',
      packageName: 'ROYAL WEDDING PACKAGE',
      venue: 'Kolkata',
    },
    {
      id: 'mock-3',
      bookingId: 'DRVSTU-BKG-000012',
      clientName: 'Subha',
      eventDate: '2026-07-08',
      packageName: 'ROYAL WEDDING PACKAGE',
      venue: 'ITC',
    },
    {
      id: 'mock-4',
      bookingId: 'DRVSTU-BKG-000015',
      clientName: 'Subha',
      eventDate: '2027-12-12',
      packageName: 'ROYAL WEDDING PACKAGE',
      venue: 'Venue',
    },
    {
      id: 'mock-5',
      bookingId: 'DRVSTU-BKG-000018',
      clientName: 'Swagatam & Swagata',
      eventDate: '2026-07-21',
      packageName: 'STANDARD WEDDING PACKAGE',
      venue: 'kolkata',
    },
    {
      id: 'mock-6',
      bookingId: 'DRVSTU-BKG-000017',
      clientName: 'Soham Biswas',
      eventDate: '2026-07-24',
      packageName: 'Demo Testing',
      venue: 'ITC',
    },
    {
      id: 'mock-7',
      bookingId: 'DRVSTU-BKG-000019',
      clientName: 'Jason',
      eventDate: '2026-07-31',
      packageName: 'Om Photography Premium Package',
      venue: 'Kolkata',
    },
    {
      id: 'mock-8',
      bookingId: 'DRVSTU-BKG-000013',
      clientName: 'Aniket',
      eventDate: '2026-08-01',
      packageName: 'Om Photography Premium Package',
      venue: 'kolkata',
    },
    {
      id: 'mock-9',
      bookingId: 'DRVSTU-BKG-000014',
      clientName: 'Soumik & Shrya',
      eventDate: '2026-11-24',
      packageName: 'Ultimate Wedding Package',
      venue: 'PC Chandra Garden',
    },
  ];

  // মক ডেটার প্রতিটা booking কোন স্টেজে পড়বে (Image অনুযায়ী মেলানো)
  private mockStageMap: Record<string, string> = {
    'mock-1': 'Crew Assigned',
    'mock-2': 'Booking Confirmed',
    'mock-3': 'Booking Confirmed',
    'mock-4': 'Advance Received',
    'mock-5': 'Booking Confirmed',
    'mock-6': 'Booking Confirmed',
    'mock-7': 'Booking Confirmed',
    'mock-8': 'Booking Confirmed',
    'mock-9': 'Booking Confirmed',
  };

  ngOnInit(): void {
    // TEMPORARY — bypasses real API for UI testing. Restore loadBoard() once backend confirmed.
    this.buildColumnsFromMock();
    return;

    /* ORIGINAL — uncomment when ready to test against real backend
    this.loadBoard();
    */
  }

  private buildColumnsFromMock(): void {
    this.columns = STAGE_DEFS.map((def) => ({
      ...def,
      bookings: this.mockBookings.filter((b) => this.mockStageMap[b.id] === def.key),
    }));
  }

  private loadBoard(): void {
    this.isLoading = true;

    this.bookingService.getBookings().subscribe({
      next: (response) => {
        const bookings = response?.bookings ?? [];
        this.columns = STAGE_DEFS.map((def) => ({
          ...def,
          bookings: bookings
            .filter((b) => b.current_workflow_stage === def.key)
            .map((b) => this.mapBooking(b)),
        }));
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading workflow board:', error);
        this.isLoading = false;
      },
    });
  }

  private mapBooking(b: ApiBooking): StageBooking {
    return {
      id: b.id,
      bookingId: b.booking_number,
      clientName: b.client_name,
      eventDate: b.event_date || b.booking_date,
      packageName: b.package_name,
      venue: b.venue,
    };
  }

  get activeBookingCount(): number {
    return this.columns.reduce((sum, col) => sum + col.bookings.length, 0);
  }

  get filteredColumns(): WorkflowStageColumn[] {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) return this.columns;

    return this.columns.map((col) => ({
      ...col,
      bookings: col.bookings.filter(
        (b) =>
          b.clientName.toLowerCase().includes(term) ||
          b.bookingId.toLowerCase().includes(term),
      ),
    }));
  }

  formatDate(value: string | null): string {
    if (!value) return '—';
    return new Date(value).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  countBadgeClass(count: number): string {
    return count > 0 ? 'badge-count-active' : 'badge-count-empty';
  }

  trackByStageKey(index: number, item: WorkflowStageColumn): string {
    return item.key;
  }

  trackByBookingId(index: number, item: StageBooking): string {
    return item.id;
  }
}