import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Booking, BookingEvent, CrewPlanDay, CrewAssignment } from '../../../../services/booking.service';

@Component({
  selector: 'app-crew-tab',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './crew-tab.html',
  styleUrl: './crew-tab.scss',
})
export class CrewTab {
  @Input({ required: true }) booking!: Booking;

  @Output() addDay = new EventEmitter<void>();
  @Output() removeDay = new EventEmitter<BookingEvent>();
  @Output() assignRole = new EventEmitter<{ day: CrewPlanDay; role: string }>();
  @Output() assignCrew = new EventEmitter<void>();
  @Output() verifyFiles = new EventEmitter<CrewAssignment>();
  @Output() removeAssignment = new EventEmitter<CrewAssignment>();

  formatDate(value: string | null): string {
    if (!value) return '—';
    return new Date(value).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  eventForDay(day: CrewPlanDay) {
    return this.booking.event_days?.find(e => e.event_name === day.event_type);
  }

  assignedCount(day: CrewPlanDay, role: string): number {
    if (!this.booking.crew_assignments) return 0;
    return this.booking.crew_assignments.filter(
      (a: CrewAssignment) => a.event_name === day.event_type && a.assigned_role === role
    ).length;
  }

  roleStatus(day: CrewPlanDay, role: { role: string; quantity: number }): 'done' | 'left' {
    return this.assignedCount(day, role.role) >= role.quantity ? 'done' : 'left';
  }

  roleProgress(day: CrewPlanDay, role: { role: string; quantity: number }): number {
    if (!role.quantity) return 0;
    return Math.min(100, Math.round((this.assignedCount(day, role.role) / role.quantity) * 100));
  }

  get totalCrewSlots(): number {
    if (!this.booking.package_crew_plan) return 0;
    return this.booking.package_crew_plan.reduce((sum, d) => sum + d.roles.reduce((s, r) => s + r.quantity, 0), 0);
  }

  get pendingCrewSlots(): number {
    if (!this.booking.package_crew_plan) return 0;
    let pending = 0;
    for (const day of this.booking.package_crew_plan) {
      for (const role of day.roles) pending += Math.max(0, role.quantity - this.assignedCount(day, role.role));
    }
    return pending;
  }
  trackByAssignmentId(index: number, item: CrewAssignment): string {
  return item.id;
}
}