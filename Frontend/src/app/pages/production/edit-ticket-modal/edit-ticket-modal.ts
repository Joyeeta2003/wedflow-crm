import { Component, EventEmitter, Output, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';

export interface EditTicketData {
  id: string;
  assigneeId: string;
  status: string;
  deadline: string;
  hrNotes: string;
  materialReceived: boolean;
  delivered: boolean;
  sourceFiles?: File[];
  outputFiles?: File[];
}

interface SelectOption {
  value: string;
  label: string;
}

@Component({
  selector: 'app-edit-ticket-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-ticket-modal.html',
  styleUrl: './edit-ticket-modal.scss',
})
export class EditTicketModal {
  @Output() closeModal = new EventEmitter<void>();
  @Output() update = new EventEmitter<EditTicketData>();
  
  @Input() ticket: any = null;
  @Input() staff: any[] = [];

  assigneeId = '';
  status = 'pending';
  deadline = '';
  hrNotes = '';
  materialReceived = false;
  delivered = false;

  sourceFiles: File[] = [];
  outputFiles: File[] = [];

  statuses: SelectOption[] = [
    { value: 'pending', label: 'Pending' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'submitted', label: 'Submitted' },
    { value: 'approved', label: 'Approved' },
    { value: 'revision_needed', label: 'Revision Needed' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  ngOnChanges(): void {
    if (this.ticket) {
      this.assigneeId = this.ticket.assignee_id || '';
      this.status = this.ticket.status || 'pending';
      this.deadline = this.ticket.deadline || '';
      this.hrNotes = this.ticket.completion_notes || '';
      this.materialReceived = this.ticket.material_received || false;
      this.delivered = this.ticket.delivered || false;
    }
  }

  get staffOptions(): SelectOption[] {
    const options = [{ value: '__none__', label: 'Unassigned' }];
    if (this.staff && this.staff.length > 0) {
      const uniqueStaff = new Map();
      this.staff.forEach(s => {
        if (!uniqueStaff.has(s.id)) {
          uniqueStaff.set(s.id, s);
        }
      });

      uniqueStaff.forEach(s => {
        const name = s.staff_name || s.name || `${s.first_name || ''} ${s.last_name || ''}`.trim();
        const role = s.role || 'staff';
        options.push({
          value: s.id,
          label: `${name} (${role})`
        });
      });
    }
    return options;
  }

  get assigneeLabel(): string {
    return this.staffOptions.find((s) => s.value === this.assigneeId)?.label ?? 'Select assignee';
  }

  get statusLabel(): string {
    return this.statuses.find((s) => s.value === this.status)?.label ?? 'Select status';
  }

  isAssigneeOpen = false;
  isStatusOpen = false;

  toggleAssigneeDropdown(): void {
    this.isAssigneeOpen = !this.isAssigneeOpen;
    this.isStatusOpen = false;
  }

  toggleStatusDropdown(): void {
    this.isStatusOpen = !this.isStatusOpen;
    this.isAssigneeOpen = false;
  }

  closeAllDropdowns(): void {
    this.isAssigneeOpen = false;
    this.isStatusOpen = false;
  }

  selectAssignee(value: string): void {
    this.assigneeId = value;
    this.isAssigneeOpen = false;
  }

  selectStatus(value: string): void {
    this.status = value;
    this.isStatusOpen = false;
  }

  onCancel(): void {
    this.closeModal.emit();
  }

  onSubmit(form: NgForm): void {
    if (!this.ticket) return;

    this.update.emit({
      id: this.ticket.id,
      assigneeId: this.assigneeId !== '__none__' ? this.assigneeId : '',
      status: this.status,
      deadline: this.deadline,
      hrNotes: this.hrNotes,
      materialReceived: this.materialReceived,
      delivered: this.delivered,
      sourceFiles: this.sourceFiles,
      outputFiles: this.outputFiles,
    });
  }

  onSourceFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.sourceFiles = Array.from(input.files);
    }
  }

  onOutputFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.outputFiles = Array.from(input.files);
    }
  }

  removeSourceFile(index: number): void {
    this.sourceFiles.splice(index, 1);
  }

  removeOutputFile(index: number): void {
    this.outputFiles.splice(index, 1);
  }
}