import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface CrewMember {
  name: string;
  shift: string; // "Full Day", "10:00 am" etc.
}

interface RoleAssignment {
  role: string;
  required: number;
  assigned: CrewMember[];
}

interface EventStage {
  name: string; // "Mehendi", "Wedding", "Reception"
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
export class CrewAssign {
  pendingRoles = 1;
  filledPercent = 91;
  totalBookings = 8;

  searchTerm = '';
  roleFilter = 'all';
  pendingOnly = true;
  dateFrom = '';
  dateTo = '';
  eventFilter = 'all';

  // TODO: real API theke fetch hobe
  bookingQueue: BookingQueueItem[] = [
    {
      id: '1',
      clientName: 'Arnab',
      packageName: 'Royal Wedding Package',
      date: '13 Jun 2026',
      venue: 'ITC',
      pendingCount: 1,
      overdue: true,
      stages: [
        {
          name: 'Mehendi',
          date: '13 Jun 2026',
          venue: 'ITC',
          done: true,
          overdue: true,
          filled: true,
          roles: [
            {
              role: 'Photographer',
              required: 2,
              assigned: [
                { name: 'Rohan Gupta', shift: 'Full Day · 10:00 am' },
                { name: 'Akash Sarkar', shift: 'Full Day' },
              ],
            },
          ],
        },
      ],
    },
    {
      id: '2',
      clientName: 'Mehendi',
      packageName: 'Mehendi',
      date: '13 Jun 2026',
      venue: 'ITC',
      pendingCount: 0,
      overdue: true,
      stages: [],
    },
    {
      id: '3',
      clientName: 'Swagatam & Swagata',
      packageName: 'ROYAL WEDDING PACKAGE',
      date: '30 Jun 2026',
      venue: 'Kolkata',
      pendingCount: 2,
      overdue: true,
      stages: [
        {
          name: 'Mehendi',
          date: '30 Jun 2026',
          venue: 'Kolkata',
          done: true,
          overdue: true,
          filled: true,
          roles: [
            {
              role: 'Cinematographer',
              required: 2,
              assigned: [
                { name: 'fjdfjhjd', shift: 'Full Day' },
                { name: 'Kathakali Mondal', shift: 'Full Day' },
              ],
            },
          ],
        },
        {
          name: 'Wedding',
          date: '14 Jun 2026',
          venue: 'ITC',
          done: true,
          overdue: true,
          filled: true,
          roles: [
            {
              role: 'Photographer',
              required: 3,
              assigned: [
                { name: 'Rohan Gupta', shift: 'Full Day' },
                { name: 'Akash Sarkar', shift: 'Full Day' },
                { name: 'ytewtywty', shift: 'Full Day' },
              ],
            },
          ],
        },
        {
          name: 'Wedding',
          date: '14 Jun 2026',
          venue: 'ITC',
          done: false,
          overdue: true,
          filled: false,
          roles: [{ role: 'Drone Operator', required: 1, assigned: [] }],
        },
        {
          name: 'Reception',
          date: '15 Jun 2026',
          venue: 'ITC',
          done: true,
          overdue: true,
          filled: true,
          roles: [
            {
              role: 'Photographer',
              required: 2,
              assigned: [
                { name: 'Akash Sarkar', shift: 'Full Day' },
                { name: 'Rohan Gupta', shift: 'Full Day' },
              ],
            },
          ],
        },
      ],
    },
    {
      id: '4',
      clientName: 'Subha',
      packageName: 'ROYAL WEDDING PACKAGE',
      date: '08 Jul 2026',
      venue: 'ITC',
      pendingCount: 11,
      overdue: false,
      stages: [],
    },
    {
      id: '5',
      clientName: 'Swagatam & Swagata',
      packageName: 'STANDARD WEDDING PACKAGE',
      date: '21 Jul 2026',
      venue: 'kolkata',
      pendingCount: 2,
      overdue: true,
      stages: [],
    },
    {
      id: '6',
      clientName: 'Soham Biswas',
      packageName: 'Demo Testing',
      date: '24 Jul 2026',
      venue: 'ITC',
      pendingCount: 0,
      overdue: false,
      stages: [],
    },
    {
      id: '7',
      clientName: 'Aniket',
      packageName: 'Om Photography Premium Package',
      date: '01 Aug 2026',
      venue: 'kolkata',
      pendingCount: 0,
      overdue: false,
      stages: [],
    },
    {
      id: '8',
      clientName: 'Soumik & Shrya',
      packageName: 'Ultimate Wedding Package',
      date: '24 Nov 2026',
      venue: 'PC Chandra Garden',
      pendingCount: 3,
      overdue: false,
      stages: [],
    },
    {
      id: '9',
      clientName: 'Subha',
      packageName: 'ROYAL WEDDING PACKAGE',
      date: '12 Dec 2027',
      venue: 'Venue',
      pendingCount: 3,
      overdue: false,
      stages: [],
    },
  ];

  progressPercent(stage: EventStage): number {
    const total = stage.roles.reduce((sum, r) => sum + r.required, 0);
    const filled = stage.roles.reduce((sum, r) => sum + r.assigned.length, 0);
    return total === 0 ? 0 : Math.round((filled / total) * 100);
  }

  onRemoveCrew(stage: EventStage, role: RoleAssignment, member: CrewMember): void {
    role.assigned = role.assigned.filter((m) => m !== member);
  }

  onAssignRole(stage: EventStage, role: RoleAssignment): void {
    // TODO: open assign-crew picker/modal
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

  overallProgressPercent(booking: BookingQueueItem): number {
  const total = booking.stages.reduce(
    (sum, s) => sum + s.roles.reduce((rSum, r) => rSum + r.required, 0), 0
  );
  const filled = booking.stages.reduce(
    (sum, s) => sum + s.roles.reduce((rSum, r) => rSum + r.assigned.length, 0), 0
  );
  return total === 0 ? 0 : Math.round((filled / total) * 100);
}

  selectedBookingId: string | null = '1';

  get selectedBooking(): BookingQueueItem | undefined {
    return this.bookingQueue.find((b) => b.id === this.selectedBookingId);
  }

  selectBooking(id: string): void {
    this.selectedBookingId = id;
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
}
