import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { BookingModal , NewBookingData } from './booking-modal/booking-modal';
import { BookingService, Booking as ApiBooking } from '../../services/booking.service';
import { ClientService } from '../../services/client.service';
import { PackageService } from '../../services/package.service';

type WorkflowStage = 'Booking Confirmed' | 'Advance Received' | 'Full Payment Received';

interface Booking {
  id: string;
  bookingId: string;
  clientName: string;
  eventDate: string; // ISO date
  venue: string;
  packageName: string;
  workflowStage: WorkflowStage;
  amount: number;
  amountPaid?: number; // optional — thakle "Rs. X paid" sub-line dekhabe
}

@Component({
  selector: 'app-bookings',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink,BookingModal],
  templateUrl: './bookings.html',
  styleUrl: './bookings.scss',
})
export class Bookings implements OnInit {
  showNewBookingModal = false;
  bookings: Booking[] = [];
  isLoading = false;

  clientOptions: { id: string; label: string }[] = [];
  packageOptions: { id: string; label: string }[] = [];

  constructor(
    private bookingService: BookingService,
    private clientService: ClientService,
    private packageService: PackageService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadBookings();
    this.loadOptions();
  }

  private loadBookings(): void {
    this.isLoading = true;
    this.cdr.detectChanges();

    this.bookingService.getBookings().subscribe({
      next: (response) => {
        this.bookings = (response?.bookings ?? []).map((booking) => this.mapBooking(booking));
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading bookings:', error);
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  private loadOptions(): void {
    this.clientService.getClients().subscribe({
      next: (response) => {
        this.clientOptions = response.clients.map((client) => ({
          id: client.id,
          label: `${client.name}${client.phone ? ` - ${client.phone}` : ''}`,
        }));
        this.cdr.detectChanges();
      },
      error: (error) => console.error('Error loading booking clients:', error),
    });

    this.packageService.getPackages().subscribe({
      next: (response) => {
        this.packageOptions = response.packages.map((pkg) => ({
          id: pkg.id,
          label: `${pkg.name} - Rs. ${Number(pkg.price).toLocaleString('en-IN')}`,
        }));
        this.cdr.detectChanges();
      },
      error: (error) => console.error('Error loading booking packages:', error),
    });
  }

  private mapBooking(booking: ApiBooking): Booking {
    const stageMap: Record<string, WorkflowStage> = {
      booking: 'Booking Confirmed',
      completed: 'Full Payment Received',
    };

    return {
      id: booking.id,
      bookingId: booking.booking_number,
      clientName: booking.client_name,
      eventDate: booking.event_date || booking.booking_date,
      venue: booking.venue || '',
      packageName: booking.package_name,
      workflowStage: stageMap[booking.current_workflow_stage] || 'Advance Received',
      amount: Number(booking.total_amount),
    };
  }

  searchTerm = '';
  dateFrom = ''; // DD-MM-YYYY
  dateTo = '';
  selectedEvent = 'all'; // TODO: "All Events" dropdown-er real options confirm kor
  selectedStage: 'all' | WorkflowStage = 'all';

  get filteredBookings(): Booking[] {
    const term = this.searchTerm.trim().toLowerCase();
    const fromDate = this.parseDDMMYYYY(this.dateFrom);
    const toDate = this.parseDDMMYYYY(this.dateTo);

    return this.bookings.filter((b) => {
      const matchesSearch =
        !term ||
        b.clientName.toLowerCase().includes(term) ||
        b.bookingId.toLowerCase().includes(term) ||
        b.venue.toLowerCase().includes(term);

      const eventDate = new Date(b.eventDate);
      const matchesFrom = !fromDate || eventDate >= fromDate;
      const matchesTo = !toDate || eventDate <= toDate;

      const matchesStage = this.selectedStage === 'all' || b.workflowStage === this.selectedStage;

      return matchesSearch && matchesFrom && matchesTo && matchesStage;
    });
  }

  private parseDDMMYYYY(value: string): Date | null {
    if (!value || value.length !== 10) return null;
    const [dd, mm, yyyy] = value.split('-').map(Number);
    if (!dd || !mm || !yyyy) return null;
    return new Date(yyyy, mm - 1, dd);
  }

  formatDate(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  formatAmount(n: number): string {
    return 'Rs. ' + n.toLocaleString('en-IN');
  }

  badgeClass(stage: WorkflowStage): string {
    switch (stage) {
      case 'Full Payment Received':
        return 'badge--success';
      case 'Booking Confirmed':
        return 'badge--info';
      case 'Advance Received':
        return 'badge--warning';
    }
  }

  onTemplate(): void {
    // TODO: blank Excel template download
  }

  onImportExcel(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    // TODO: parse & merge into bookings[]
    input.value = '';
  }

  onExportExcel(): void {
    // TODO: export filteredBookings
  }

  onNewBooking(): void {
    this.showNewBookingModal = true;
  }
    onModalClose(): void {
    this.showNewBookingModal = false;
  }

  onBookingCreate(data: NewBookingData): void {
    if (data.clientMode !== 'existing' || data.packageMode !== 'existing') {
      alert('Please select an existing client and package to create a database booking.');
      return;
    }

    this.bookingService.createBooking({
      clientId: data.clientId,
      packageId: data.packageId,
      bookingDate: this.toIsoDate(data.bookingDate),
      eventDate: this.toIsoDate(data.mainEventDate),
      totalAmount: Number(data.totalAmount),
      venue: data.venue.trim(),
      eventType: data.eventType || 'Other',
      notes: [data.notes, data.remarks].filter(Boolean).join('\n'),
    }).subscribe({
      next: () => {
        this.showNewBookingModal = false;
        this.loadBookings();
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error creating booking:', error);
        const message = error?.error?.error || error?.message || 'Failed to create booking';
        alert(message);
      },
    });
  }

  private toIsoDate(value: string): string {
    const [day, month, year] = value.split('-');
    return year && month && day ? `${year}-${month}-${day}` : value;
  }
}
