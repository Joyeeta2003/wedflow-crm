import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Booking, BookingEvent, CrewAssignment, StaffMember } from '../../../../../services/booking.service';

export interface NewAssignmentData {
  eventDayId: string;
  eventName: string;
  eventDate: string | null;
  venue: string | null;
  shift: 'full_day' | 'first_half' | 'second_half';
  role: string;
  staffId: string;
  staffName: string;
  reportTime: string;
  reportLocation: string;
}

@Component({
  selector: 'app-assign-crew-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './assign-crew-modal.html',
  styleUrl: './assign-crew-modal.scss',
})
export class AssignCrewModal implements OnChanges {
  @Input({ required: true }) booking!: Booking;
  @Input() initialEventDayId: string | null = null;
  @Input() initialRole: string | null = null;

  @Output() closeModal = new EventEmitter<void>();
  @Output() create = new EventEmitter<NewAssignmentData>();

  // ASSUMPTION: mock staff directory — replace with real staff service once backend confirmed
  allStaff: StaffMember[] = [
    { id: 's1', name: 'Rohan Gupta', role: 'Photographer' },
    { id: 's2', name: 'Akash Sarkar', role: 'Photographer' },
    { id: 's3', name: 'ytewtywty', role: 'Photographer' },
    { id: 's4', name: 'Kathakali Mondal', role: 'Cinematographer' },
    { id: 's5', name: 'fjdfjhjd', role: 'Cinematographer' },
    { id: 's6', name: 'Suman Das', role: 'Drone Operator' },
    { id: 's7', name: 'Priya Roy', role: 'Videographer' },
    { id: 's8', name: 'Arjun Nair', role: 'Photo Editor' },
    { id: 's9', name: 'Meera Iyer', role: 'Video Editor' },
  ];

  roles = ['Photographer', 'Cinematographer', 'Videographer', 'Drone Operator', 'Photo Editor', 'Video Editor'];
  shifts: { value: 'full_day' | 'first_half' | 'second_half'; label: string }[] = [
    { value: 'full_day', label: 'Full Day' },
    { value: 'first_half', label: 'First Half (Morning)' },
    { value: 'second_half', label: 'Second Half (Evening)' },
  ];

  selectedEventDayId = '';
  shift: 'full_day' | 'first_half' | 'second_half' = 'full_day';
  role = '';
  staffId = '';
  reportTime = '';
  reportLocation = '';

  isSubmitting = false;

  isEventOpen = false;
  isShiftOpen = false;
  isRoleOpen = false;
  isStaffOpen = false;
  staffTouched = false;
  roleTouched = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['initialEventDayId'] || changes['initialRole']) {
      this.selectedEventDayId = this.initialEventDayId ?? (this.booking?.event_days?.[0]?.id ?? '');
      this.role = this.initialRole ?? (this.roles[0] ?? '');
      this.reportLocation = this.selectedEventDay?.venue ?? '';
    }
  }

  get selectedEventDay(): BookingEvent | undefined {
    return this.booking?.event_days?.find((e) => e.id === this.selectedEventDayId);
  }

  get shiftLabel(): string {
    return this.shifts.find((s) => s.value === this.shift)?.label ?? 'Select shift';
  }

  get availabilityLabel(): string {
    const d = this.selectedEventDay;
    if (!d) return '';
    const dateLabel = d.event_date ?? 'Date TBD';
    return `Showing availability for ${dateLabel} · ${this.shiftLabel}`;
  }

  get staffForRole(): (StaffMember & { alreadyAssigned: boolean })[] {
    const day = this.selectedEventDay;
    const assignedNamesForDay = (this.booking?.crew_assignments ?? [])
      .filter((a: CrewAssignment) => a.event_name === day?.event_name)
      .map((a) => a.staff_name);

    return this.allStaff
      .filter((s) => s.role === this.role)
      .map((s) => ({ ...s, alreadyAssigned: assignedNamesForDay.includes(s.name) }));
  }

  get availableStaff() {
    return this.staffForRole.filter((s) => !s.alreadyAssigned);
  }

  get unavailableStaff() {
    return this.staffForRole.filter((s) => s.alreadyAssigned);
  }

  get selectedStaff(): StaffMember | undefined {
    return this.allStaff.find((s) => s.id === this.staffId);
  }

  get staffInvalid(): boolean {
    return this.staffTouched && !this.staffId;
  }

  get roleInvalid(): boolean {
    return this.roleTouched && !this.role;
  }

  toggleEventDropdown(): void {
    this.isEventOpen = !this.isEventOpen;
    this.isShiftOpen = false;
    this.isRoleOpen = false;
    this.isStaffOpen = false;
  }

  toggleShiftDropdown(): void {
    this.isShiftOpen = !this.isShiftOpen;
    this.isEventOpen = false;
    this.isRoleOpen = false;
    this.isStaffOpen = false;
  }

  toggleRoleDropdown(): void {
    this.isRoleOpen = !this.isRoleOpen;
    this.isEventOpen = false;
    this.isShiftOpen = false;
    this.isStaffOpen = false;
    if (!this.isRoleOpen) this.roleTouched = true;
  }

  toggleStaffDropdown(): void {
    this.isStaffOpen = !this.isStaffOpen;
    this.isEventOpen = false;
    this.isShiftOpen = false;
    this.isRoleOpen = false;
    if (!this.isStaffOpen) this.staffTouched = true;
  }

  closeAllDropdowns(): void {
    this.isEventOpen = false;
    this.isShiftOpen = false;
    this.isRoleOpen = false;
    this.isStaffOpen = false;
  }

  selectEventDay(id: string): void {
    this.selectedEventDayId = id;
    this.reportLocation = this.selectedEventDay?.venue ?? '';
    this.isEventOpen = false;
  }

  selectShift(value: 'full_day' | 'first_half' | 'second_half'): void {
    this.shift = value;
    this.isShiftOpen = false;
  }

  selectRole(r: string): void {
    this.role = r;
    this.isRoleOpen = false;
  }

  selectStaff(id: string): void {
    this.staffId = id;
    this.isStaffOpen = false;
    this.staffTouched = true;
  }

  onCancel(): void {
    if (this.isSubmitting) return;
    this.closeModal.emit();
  }

  onSubmit(form: NgForm): void {
    this.staffTouched = true;
    this.roleTouched = true;
    if (!this.staffId || !this.selectedEventDayId || !this.role) return;

    this.isSubmitting = true;

    // ASSUMPTION: simulated delay — replace with real API call once endpoint confirmed
    setTimeout(() => {
      const day = this.selectedEventDay;
      const staff = this.selectedStaff;
      this.create.emit({
        eventDayId: this.selectedEventDayId,
        eventName: day?.event_name ?? '',
        eventDate: day?.event_date ?? null,
        venue: day?.venue ?? null,
        shift: this.shift,
        role: this.role,
        staffId: this.staffId,
        staffName: staff?.name ?? '',
        reportTime: this.reportTime,
        reportLocation: this.reportLocation,
      });
      this.isSubmitting = false;
    }, 800);
  }
}