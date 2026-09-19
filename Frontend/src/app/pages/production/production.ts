import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface ProductionTicket {
  id: string;
  title: string;
  status: 'pending' | 'in_progress' | 'submitted' | 'approved' | 'revision_needed';
  priority: 'low' | 'normal' | 'high' | 'critical';
  category: string; // 'Album Design', 'Video Editing', 'Soft Copy Delivery', 'Photo Editing'
  booking_name: string;
  assignee: string;
  deadline: string; // ISO
  is_overdue: boolean;
  escalation_level: number | null; // ASSUMPTION — null = no escalation
  escalation_role: string | null; // e.g. 'superadmin'
  material_note: string | null; // e.g. "Material received 30 Jun"
}

interface EscalationLevel {
  level: number;
  overdueHours: number;
  role: string;
}

@Component({
  selector: 'app-production',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './production.html',
  styleUrl: './production.scss',
})
export class Production {
  statusFilters: { key: string; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'in_progress', label: 'In Progress' },
    { key: 'submitted', label: 'Submitted' },
    { key: 'approved', label: 'Approved' },
    { key: 'revision_needed', label: 'Revision Needed' },
  ];
  activeStatus = 'all';

  priorities = ['low', 'normal', 'high', 'critical'];
  selectedPriority = '';
  isPriorityOpen = false;

  searchTerm = '';
  deadlineFrom = '';
  deadlineTo = '';

  isEscalationOpen = false;

  // ASSUMPTION: escalation matrix levels — not confirmed with backend, editable via "Save matrix"
  escalationLevels: EscalationLevel[] = [
    { level: 1, overdueHours: 24, role: 'HR' },
    { level: 2, overdueHours: 48, role: 'High' },
    { level: 3, overdueHours: 72, role: 'Superadmin' },
  ];

  // TEMPORARY DUMMY DATA — for UI testing only. Remove once backend confirmed working.
  tickets: ProductionTicket[] = [
    {
      id: 't1',
      title: 'video editing',
      status: 'in_progress',
      priority: 'normal',
      category: 'Album Design',
      booking_name: 'Swagatam & Swagata',
      assignee: 'Sujan Das',
      deadline: '2026-07-12T15:42:00',
      is_overdue: true,
      escalation_level: null,
      escalation_role: null,
      material_note: 'Material received 30 Jun',
    },
    {
      id: 't2',
      title: 'jakj',
      status: 'pending',
      priority: 'critical',
      category: 'Soft Copy Delivery',
      booking_name: 'Swagatam & Swagata',
      assignee: 'Abhijit Bhattacharya',
      deadline: '2026-04-19T16:30:00',
      is_overdue: true,
      escalation_level: 3,
      escalation_role: 'superadmin',
      material_note: null,
    },
    {
      id: 't3',
      title: 'Testing',
      status: 'pending',
      priority: 'normal',
      category: 'Video Editing',
      booking_name: 'Swagatam & Swagata',
      assignee: 'Srabani Dey',
      deadline: '2026-07-10T20:30:00',
      is_overdue: true,
      escalation_level: null,
      escalation_role: null,
      material_note: null,
    },
    {
      id: 't4',
      title: 'Video Edit',
      status: 'pending',
      priority: 'critical',
      category: 'Photo Editing',
      booking_name: 'Soham Biswas',
      assignee: 'Abhirup',
      deadline: '2026-08-13T05:30:00',
      is_overdue: true,
      escalation_level: 3,
      escalation_role: 'superadmin',
      material_note: null,
    },
  ];

  get counts(): Record<string, number> {
  return {
    all: this.tickets.length,
    pending: this.tickets.filter((t) => t.status === 'pending').length,
    in_progress: this.tickets.filter((t) => t.status === 'in_progress').length,
    submitted: this.tickets.filter((t) => t.status === 'submitted').length,
    approved: this.tickets.filter((t) => t.status === 'approved').length,
    revision_needed: this.tickets.filter((t) => t.status === 'revision_needed').length,
  };
}

  get filteredTickets(): ProductionTicket[] {
    return this.tickets.filter((t) => {
      if (this.activeStatus !== 'all' && t.status !== this.activeStatus) return false;
      if (this.selectedPriority && t.priority !== this.selectedPriority) return false;
      if (this.searchTerm) {
        const q = this.searchTerm.toLowerCase();
        const hay = `${t.title} ${t.booking_name} ${t.assignee}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }

  formatDeadline(value: string): string {
    return new Date(value).toLocaleString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true,
    });
  }

  statusLabel(status: string): string {
    return status.replace('_', ' ');
  }

  priorityLabel(p: string): string {
    return p.charAt(0).toUpperCase() + p.slice(1);
  }

  setStatusFilter(key: string): void {
    this.activeStatus = key;
  }

  togglePriorityDropdown(): void {
    this.isPriorityOpen = !this.isPriorityOpen;
  }

  closePriorityDropdown(): void {
    this.isPriorityOpen = false;
  }

  selectPriority(p: string): void {
    this.selectedPriority = p;
    this.isPriorityOpen = false;
  }

  toggleEscalation(): void {
    this.isEscalationOpen = !this.isEscalationOpen;
  }

  onSaveMatrix(): void {
    // TODO: real API call once endpoint confirmed
    this.isEscalationOpen = false;
  }

  onNewTicket(): void {
    // TODO: New Ticket modal — needs screenshot of the original site's form
  }

  onAcknowledge(t: ProductionTicket): void {
    // TODO: real API call once endpoint confirmed
    t.escalation_level = null;
    t.escalation_role = null;
  }

  onEditTicket(t: ProductionTicket): void {
    // TODO: Edit ticket modal — needs screenshot
  }
}