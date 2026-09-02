import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Booking {
  id: string;
  booking_number: string;
  booking_date: string;
  event_date: string | null;
  client_id: string;
  client_name: string;
  package_id: string;
  package_name: string;
  total_amount: number;
  status: string;
  current_workflow_stage: string;
  venue: string | null;
  notes: string | null;
  amount_paid?: number;
  event_days?: BookingEvent[];
  payment_schedule?: PaymentSchedule[];
  package_crew_plan?: CrewPlanDay[];
  crew_assignments?: CrewAssignment[];
}

export interface BookingEvent {
  event_name: string;
  event_date: string;
  venue: string | null;
}

export interface PaymentSchedule {
  installment_name: string;
  percentage: number;
  timing: string | null;
}

export interface CrewPlanDay {
  day_number: number;
  event_type: string;
  roles: { role: string; quantity: number }[];
}

export interface CrewAssignment {
  staff_name: string;
  assigned_role: string;
  event_name: string;
  event_date: string;
  venue: string | null;
  status: string;
}

export interface CreateBookingRequest {
  clientId: string;
  packageId: string;
  bookingDate?: string;
  eventDate: string;
  eventType?: string;
  totalAmount: number;
  venue: string;
  status?: string;
  currentWorkflowStage?: string;
  notes?: string;
}

export interface BookingListResponse {
  success: boolean;
  bookings: Booking[];
  count: number;
}

export interface BookingResponse {
  success: boolean;
  booking: Booking;
}

@Injectable({ providedIn: 'root' })
export class BookingService {
  private readonly apiUrl = 'http://localhost:5001/api/bookings';

  constructor(private http: HttpClient) {}

  getBookings(): Observable<BookingListResponse> {
    return this.http.get<BookingListResponse>(this.apiUrl);
  }

  getBookingById(id: string): Observable<BookingResponse> {
    return this.http.get<BookingResponse>(`${this.apiUrl}/${id}`);
  }

  createBooking(booking: CreateBookingRequest): Observable<BookingResponse> {
    return this.http.post<BookingResponse>(this.apiUrl, booking);
  }
}