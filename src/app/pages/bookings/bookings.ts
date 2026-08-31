import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

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
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './bookings.html',
  styleUrl: './bookings.scss',
})
export class Bookings {
  // TODO: real API theke fetch hobe
  bookings: Booking[] = [
    { id: '1', bookingId: 'DRVSTU-BKG-000009', clientName: 'Arnab', eventDate: '2026-06-13', venue: 'ITC', packageName: 'Royal Wedding Package', workflowStage: 'Full Payment Received', amount: 350000, amountPaid: 665000 },
    { id: '2', bookingId: 'DRVSTU-BKG-000010', clientName: 'Swagatam & Swagata', eventDate: '2026-06-30', venue: 'Kolkata', packageName: 'ROYAL WEDDING', workflowStage: 'Full Payment Received', amount: 220000, amountPaid: 220000 },
    { id: '3', bookingId: 'DRVSTU-BKG-000012', clientName: 'Subha', eventDate: '2026-07-08', venue: 'ITC', packageName: 'ROYAL WEDDING', workflowStage: 'Booking Confirmed', amount: 220000 },
    { id: '4', bookingId: 'DRVSTU-BKG-000018', clientName: 'Swagatam & Swagata', eventDate: '2026-07-21', venue: 'kolkata', packageName: 'STANDARD WEDDING', workflowStage: 'Booking Confirmed', amount: 100000 },
    { id: '5', bookingId: 'DRVSTU-BKG-000017', clientName: 'Soham Biswas', eventDate: '2026-07-24', venue: 'ITC', packageName: 'Demo Testing', workflowStage: 'Booking Confirmed', amount: 150000 },
    { id: '6', bookingId: 'DRVSTU-BKG-000019', clientName: 'Jason', eventDate: '2026-07-31', venue: 'Kolkata', packageName: 'Om Photography', workflowStage: 'Booking Confirmed', amount: 76000 },
    { id: '7', bookingId: 'DRVSTU-BKG-000013', clientName: 'Aniket', eventDate: '2026-08-01', venue: 'kolkata', packageName: 'Om Photography', workflowStage: 'Booking Confirmed', amount: 76000 },
    { id: '8', bookingId: 'DRVSTU-BKG-000014', clientName: 'Soumik & Shrya', eventDate: '2026-11-24', venue: 'PC Chandra Garden', packageName: 'Ultimate Wedding', workflowStage: 'Booking Confirmed', amount: 350000 },
    { id: '9', bookingId: 'DRVSTU-BKG-000015', clientName: 'Subha', eventDate: '2027-12-12', venue: 'Venue', packageName: 'ROYAL WEDDING', workflowStage: 'Advance Received', amount: 220000, amountPaid: 88000 },
  ];

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
    // TODO: New Booking modal (screenshot lagবে form fields dekhার jonno)
  }
}
