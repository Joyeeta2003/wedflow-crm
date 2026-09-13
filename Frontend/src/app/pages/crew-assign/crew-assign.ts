import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { BookingService, Booking } from '../../services/booking.service';
import { CrewAssignmentService, CrewAssignment, Staff } from '../../services/crew-assignment.service';

interface CrewMember {
  id: string;
  name: string;
  shift: string;
}

interface RoleAssignment {
  role: string;
  required: number;
  assigned: CrewMember[];
}

interface EventStage {
  id: string;
  name: string;
  date: string;
  venue: string;
  done: boolean;
  overdue: boolean;
  filled: boolean;
  roles: RoleAssignment[];
}

interface BookingQueueItem {
  id: string;
  clientName: string;
  packageName: string;
  date: string;
  venue: string;
  pendingCount: number;
  overdue: boolean;
  stages: EventStage[];
}

@Component({
  selector: 'app-crew-assign',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './crew-assign.html',
  styleUrl: './crew-assign.scss',
})
export class CrewAssign implements OnInit {
  pendingRoles = 0;
  filledPercent = 0;
  totalBookings = 0;

  searchTerm = '';
  roleFilter = 'all';
  pendingOnly = true;
  dateFrom = '';
  dateTo = '';
  eventFilter = 'all';

  bookingQueue: BookingQueueItem[] = [];
  selectedBookingId: string | null = null;
  allStaff: Staff[] = [];
  crewAssignments: CrewAssignment[] = [];
  isLoading = false;
  error: string | null = null;

  constructor(
    private http: HttpClient,
    private bookingService: BookingService,
    private crewAssignmentService: CrewAssignmentService
  ) {}

  ngOnInit(): void {
    this.loadCrewAssignments();
  }

  loadCrewAssignments(): void {
    this.isLoading = true;
    this.error = null;

    forkJoin({
      bookings: this.bookingService.getBookings(),
      crewAssignments: this.crewAssignmentService.getCrewAssignments(),
      staff: this.crewAssignmentService.getStaff()
    }).subscribe({
      next: ({ bookings, crewAssignments, staff }) => {
        this.allStaff = staff.staff || [];
        this.crewAssignments = crewAssignments.crewAssignments || [];
        this.bookingQueue = this.transformBookingsToQueue(bookings.bookings || []);
        this.updateStats();
        this.isLoading = false;
        
        // Select first booking if available
        if (this.bookingQueue.length > 0) {
          this.selectedBookingId = this.bookingQueue[0].id;
        }
      },
      error: (err) => {
        console.error('Error loading crew assignments:', err);
        this.error = 'Failed to load crew assignments. Please try again.';
        this.isLoading = false;
      }
    });
  }

  transformBookingsToQueue(bookings: Booking[]): BookingQueueItem[] {
    return bookings.map(booking => {
      const eventStages = this.extractEventStages(booking);
      const pendingCount = this.calculatePendingCount(eventStages);
      const isOverdue = this.isBookingOverdue(booking);
      
      return {
        id: booking.id,
        clientName: booking.client_name || 'Unknown Client',
        packageName: booking.package_name || 'Unknown Package',
        date: this.formatDate(booking.booking_date),
        venue: booking.venue || 'Unknown Venue',
        pendingCount,
        overdue: isOverdue,
        stages: eventStages
      };
    });
  }

  extractEventStages(booking: Booking): EventStage[] {
    const eventDays = booking.event_days || [];
    const assignments = this.crewAssignments.filter(ca => 
      eventDays.some(ed => ed.event_name === ca.event_name && ed.event_date === ca.event_date)
    );

    return eventDays.map(eventDay => {
      const eventAssignments = assignments.filter(ca => 
        ca.event_name === eventDay.event_name && ca.event_date === eventDay.event_date
      );
      
      const roleGroups = this.groupAssignmentsByRole(eventAssignments);
      const crewPlan = this.getCrewPlanForEvent(booking, eventDay);
      
      const roles = Object.keys(roleGroups).map(role => {
        const crewRequirement = crewPlan?.roles?.find((r: any) => r.role === role);
        const required = crewRequirement?.quantity || roleGroups[role].length;
        const assigned = roleGroups[role].map(member => ({
          id: member.staff_id,
          name: member.staff_name,
          shift: this.formatShift(member.start_time, member.end_time)
        }));

        return {
          role,
          required,
          assigned
        };
      });

      const isFilled = roles.every(r => r.assigned.length >= r.required);
      const isOverdue = this.isEventOverdue(eventDay.event_date);
      const isDone = this.isEventDone(eventDay.event_date);

      return {
        id: `${booking.id}-${eventDay.event_name}-${eventDay.event_date}`,
        name: eventDay.event_name,
        date: this.formatDate(eventDay.event_date),
        venue: eventDay.venue || booking.venue || 'Unknown',
        done: isDone,
        overdue: isOverdue,
        filled: isFilled,
        roles
      };
    });
  }

  groupAssignmentsByRole(assignments: CrewAssignment[]): Record<string, CrewAssignment[]> {
    return assignments.reduce((groups, assignment) => {
      const role = assignment.assigned_role;
      if (!groups[role]) {
        groups[role] = [];
      }
      groups[role].push(assignment);
      return groups;
    }, {} as Record<string, CrewAssignment[]>);
  }

  getCrewPlanForEvent(booking: Booking, eventDay: any): any {
    const crewPlan = booking.package_crew_plan || [];
    const matchingDay = crewPlan.find((day: any) => 
      day.event_type.toLowerCase() === eventDay.event_name.toLowerCase()
    );
    return matchingDay;
  }

  calculatePendingCount(stages: EventStage[]): number {
    return stages.reduce((total, stage) => {
      return total + stage.roles.reduce((roleTotal, role) => {
        return roleTotal + Math.max(0, role.required - role.assigned.length);
      }, 0);
    }, 0);
  }

  isBookingOverdue(booking: Booking): boolean {
    const bookingDate = new Date(booking.booking_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return bookingDate < today;
  }

  isEventOverdue(eventDate: string): boolean {
    const date = new Date(eventDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  }

  isEventDone(eventDate: string): boolean {
    const date = new Date(eventDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return 'Unknown Date';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  formatShift(startTime: string | null, endTime: string | null): string {
    if (!startTime && !endTime) return 'Full Day';
    if (startTime && endTime) {
      return `${this.formatTime(startTime)} - ${this.formatTime(endTime)}`;
    }
    if (startTime) return `${this.formatTime(startTime)} onwards`;
    if (endTime) return `Until ${this.formatTime(endTime)}`;
    return 'Full Day';
  }

  formatTime(timeStr: string): string {
    const [hours, minutes] = timeStr.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  }

  updateStats(): void {
    this.totalBookings = this.bookingQueue.length;
    this.pendingRoles = this.bookingQueue.reduce((total, booking) => total + booking.pendingCount, 0);
    
    const totalRequired = this.bookingQueue.reduce((total, booking) => {
      return total + booking.stages.reduce((stageTotal, stage) => {
        return stageTotal + stage.roles.reduce((roleTotal, role) => roleTotal + role.required, 0);
      }, 0);
    }, 0);
    
    const totalAssigned = this.bookingQueue.reduce((total, booking) => {
      return total + booking.stages.reduce((stageTotal, stage) => {
        return stageTotal + stage.roles.reduce((roleTotal, role) => roleTotal + role.assigned.length, 0);
      }, 0);
    }, 0);
    
    this.filledPercent = totalRequired === 0 ? 0 : Math.round((totalAssigned / totalRequired) * 100);
  }

  get selectedBooking(): BookingQueueItem | undefined {
    return this.bookingQueue.find((b) => b.id === this.selectedBookingId);
  }

  get filteredQueue(): BookingQueueItem[] {
    const term = this.searchTerm.trim().toLowerCase();
    return this.bookingQueue.filter((b) => {
      const matchesSearch =
        !term ||
        b.clientName.toLowerCase().includes(term) ||
        b.packageName.toLowerCase().includes(term) ||
        b.venue.toLowerCase().includes(term);

      const matchesPending = !this.pendingOnly || b.pendingCount > 0;

      return matchesSearch && matchesPending;
    });
  }

  get selectedRoleCards() {
    if (!this.selectedBooking) return [];
    return this.selectedBooking.stages.flatMap((stage) =>
      stage.roles.map((role) => ({
        stage,
        role,
        pending: role.required - role.assigned.length,
      }))
    );
  }

  selectBooking(id: string): void {
    this.selectedBookingId = id;
  }

  overallProgressPercent(booking: BookingQueueItem): number {
    const total = booking.stages.reduce(
      (sum, s) => sum + s.roles.reduce((rSum, r) => rSum + r.required, 0), 0
    );
    const filled = booking.stages.reduce(
      (sum, s) => sum + s.roles.reduce((rSum, r) => rSum + r.assigned.length, 0), 0
    );
    return total === 0 ? 0 : Math.round((filled / total) * 100);
  }

  daysLeft(dateStr: string): number {
    const eventDate = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    eventDate.setHours(0, 0, 0, 0);
    const diffMs = eventDate.getTime() - today.getTime();
    return Math.round(diffMs / (1000 * 60 * 60 * 24));
  }

  onRemoveCrew(stage: EventStage, role: RoleAssignment, member: CrewMember): void {
    // Find and remove the crew assignment
    const assignment = this.crewAssignments.find(ca => 
      ca.staff_id === member.id && 
      ca.assigned_role === role.role &&
      this.getEventStageId(ca) === stage.id
    );

    if (assignment) {
      this.crewAssignmentService.deleteCrewAssignment(assignment.id).subscribe({
        next: () => {
          this.loadCrewAssignments(); // Reload data
        },
        error: (err) => {
          console.error('Error removing crew assignment:', err);
          this.error = 'Failed to remove crew assignment';
        }
      });
    }
  }

  getEventStageId(assignment: CrewAssignment): string {
    // Find corresponding booking and event stage
    const booking = this.bookingQueue.find(b => 
      b.stages.some(s => s.name === assignment.event_name && s.date === this.formatDate(assignment.event_date))
    );
    if (booking) {
      const stage = booking.stages.find(s => 
        s.name === assignment.event_name && s.date === this.formatDate(assignment.event_date)
      );
      return stage?.id || '';
    }
    return '';
  }

  onAssignRole(stage: EventStage, role: RoleAssignment): void {
    // TODO: Implement crew assignment modal
    console.log('Assign role:', role.role, 'to stage:', stage.name);
    // This would open a modal to select staff member
  }

  refreshData(): void {
    this.loadCrewAssignments();
  }
}