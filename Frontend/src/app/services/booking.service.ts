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
  project_division?: string | null; // ASSUMPTION
  event_type?: string | null; // ASSUMPTION
  client_manager?: string | null; // ASSUMPTION
  selection_upload_process?: string | null; // ASSUMPTION
  review_notes?: string | null; // ASSUMPTION
  map_link?: string | null; // ASSUMPTION
  remarks?: string | null; // ASSUMPTION
  deliveries?: DeliveryItem[]; // ASSUMPTION — new field, not in original interface
}

export interface BookingEvent {
  id: string; // ASSUMPTION — needed to uniquely target a day for delete (duplicate event_names possible)
  event_name: string;
  event_date: string | null; // ASSUMPTION — null when date is pending
  venue: string | null;
  notes?: string | null; // ASSUMPTION
  date_pending?: boolean; // ASSUMPTION
}

export interface PaymentSchedule {
  id: string; // ASSUMPTION — delete/update-er jonno lagবে
  installment_name: string;
  amount: number; // ASSUMPTION — percentage-er bodole direct amount, screenshot onujayi
  percentage?: number; // rakhলাম, jodi kothaও ব্যবহার hocche
  due_date: string | null; // ASSUMPTION
  paid_date: string | null; // ASSUMPTION
  status: string; // ASSUMPTION — 'approved' | 'pending' etc.
  notes?: string | null; // ASSUMPTION
}

export interface CrewPlanDay {
  day_number: number;
  event_type: string;
  roles: { role: string; quantity: number }[];
}

export interface CrewAssignment {
  id: string; // ASSUMPTION — needed for delete/verify actions
  staff_name: string;
  assigned_role: string;
  event_name: string;
  event_date: string;
  event_time?: string; // ASSUMPTION — "10:00 am" screenshot-e dekha gele, sob row-e nei
  venue: string | null;
  status: string;
  is_full_day?: boolean; // ASSUMPTION
  is_notified?: boolean; // ASSUMPTION
  handover_status?: 'submitted' | 'pending'; // ASSUMPTION
  files_status?: 'submitted' | 'pending'; // ASSUMPTION
  submitted_at?: string | null; // ASSUMPTION
}

export interface DeliveryItem {
  id: string;
  type: string; // 'Album Design' | 'Album Print' | 'Video Edit' | etc.
  description: string;
  due_date: string | null;
  status: 'Pending' | 'In Progress' | 'Delivered'; // ASSUMPTION
  delivered_date: string | null;
  notes?: string | null;
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

export interface StaffMember {
  id: string;
  name: string;
  role: string; // matches CrewPlanDay role names — 'Photographer', 'Cinematographer', etc.
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
