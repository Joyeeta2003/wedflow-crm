import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface WorkRequest {
  id: string;
  project: string;
  professionalRole: string;
  professionalName: string;
  professionalEmail: string;
  professionalPhone: string;
  eventDate: string;
  venue: string;
  budget: number;
  status: 'Accepted' | 'Pending' | 'Declined' | 'Completed';
}

export interface Booking {
  id: string;
  booking_number: string;
  client_name: string;
  package_name: string;
  booking_date: string;
  event_date: string;
  venue: string;
}

export interface EventDay {
  id: string;
  event_name: string;
  event_date: string;
  venue: string;
}

export interface AssignmentData {
  bookingId: string;
  eventDayId: string;
  reportTime: string;
  assignmentRole: string;
}

@Component({
  selector: 'app-work-assignment-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './work-assignment-modal.html',
  styleUrl: './work-assignment-modal.scss'
})
export class WorkAssignmentModal {
  @Input() isOpen = false;
  @Input() workRequest: WorkRequest | null = null;
  @Output() closeModal = new EventEmitter<void>();
  @Output() assignmentConfirmed = new EventEmitter<AssignmentData>();

  private apiUrl = 'http://localhost:5001/api';

  bookings: Booking[] = [];
  eventDays: EventDay[] = [];
  isLoadingBookings = false;
  isLoadingEventDays = false;
  isSubmitting = false;

  assignmentData: AssignmentData = {
    bookingId: '',
    eventDayId: '',
    reportTime: '',
    assignmentRole: ''
  };

  assignmentRoles = [
    'Wedding Photographer',
    'Cinematographer',
    'Videographer',
    'Drone Operator',
    'Photo Editor',
    'Video Editor',
    'Album Designer',
    'Lighting Technician',
    'Sound Engineer',
    'Other'
  ];

  private http = inject(HttpClient);

  ngOnChanges() {
    if (this.isOpen && this.workRequest) {
      this.loadBookings();
      this.assignmentData.assignmentRole = this.workRequest.professionalRole;
    }
  }

  loadBookings() {
    this.isLoadingBookings = true;
    this.http.get<{ success: boolean; bookings: Booking[] }>(`${this.apiUrl}/bookings`).subscribe({
      next: (response) => {
        this.bookings = response.bookings;
        this.isLoadingBookings = false;
      },
      error: (error) => {
        console.error('Error loading bookings:', error);
        this.isLoadingBookings = false;
      }
    });
  }

  onBookingChange() {
    if (this.assignmentData.bookingId) {
      this.loadEventDays(this.assignmentData.bookingId);
    } else {
      this.eventDays = [];
      this.assignmentData.eventDayId = '';
    }
  }

  loadEventDays(bookingId: string) {
    this.isLoadingEventDays = true;
    this.http.get<{ success: boolean; booking: any }>(`${this.apiUrl}/bookings/${bookingId}`).subscribe({
      next: (response) => {
        const eventDays = response.booking.event_days || [];
        this.eventDays = eventDays.map((event: any) => ({
          id: event.id || `${bookingId}-${event.event_name}`,
          event_name: event.event_name,
          event_date: event.event_date,
          venue: event.venue
        }));
        this.isLoadingEventDays = false;
      },
      error: (error) => {
        console.error('Error loading event days:', error);
        this.isLoadingEventDays = false;
      }
    });
  }

  onCancel() {
    this.resetForm();
    this.closeModal.emit();
  }

  onSubmit(form: NgForm) {
    if (form.invalid) return;

    this.isSubmitting = true;

    const staffData = {
      name: this.workRequest?.professionalName,
      email: this.workRequest?.professionalEmail,
      phone: this.workRequest?.professionalPhone,
      role: 'freelancer',
      availability: 'available',
      status: 'active',
      notes: `Added from marketplace: ${this.workRequest?.project}`
    };

    this.http.post(`${this.apiUrl}/staff`, staffData).subscribe({
      next: (staffResponse: any) => {
        const staffId = staffResponse.member?.id;

        const crewAssignmentData = {
          booking_event_id: this.assignmentData.eventDayId,
          staff_id: staffId,
          assigned_role: this.assignmentData.assignmentRole,
          assignment_date: new Date().toISOString().slice(0, 10),
          start_time: this.assignmentData.reportTime,
          status: 'assigned',
          notes: `Assigned from marketplace request: ${this.workRequest?.project}`
        };

        this.http.post(`${this.apiUrl}/crew-assignments`, crewAssignmentData).subscribe({
          next: (assignmentResponse) => {
            this.isSubmitting = false;
            this.assignmentConfirmed.emit(this.assignmentData);
            this.resetForm();
            this.closeModal.emit();
            alert('Assignment confirmed successfully! Professional has been notified.');
          },
          error: (assignmentError) => {
            this.isSubmitting = false;
            console.error('Error creating assignment:', assignmentError);
            alert('Failed to create assignment. Please try again.');
          }
        });
      },
      error: (staffError) => {
        this.isSubmitting = false;
        console.error('Error creating staff member:', staffError);
        alert('Failed to create staff member. Please try again.');
      }
    });
  }

  private resetForm() {
    this.assignmentData = {
      bookingId: '',
      eventDayId: '',
      reportTime: '',
      assignmentRole: this.workRequest?.professionalRole || ''
    };
    this.eventDays = [];
  }

  get selectedBooking(): Booking | undefined {
    return this.bookings.find(b => b.id === this.assignmentData.bookingId);
  }

  get selectedEventDay(): EventDay | undefined {
    return this.eventDays.find(e => e.id === this.assignmentData.eventDayId);
  }
}
