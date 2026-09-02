import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Booking, BookingService } from '../../../services/booking.service';

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

  constructor(
    private route: ActivatedRoute,
    private bookingService: BookingService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
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
  }

  formatDate(value: string): string {
    return new Date(value).toLocaleDateString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric'
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
}
