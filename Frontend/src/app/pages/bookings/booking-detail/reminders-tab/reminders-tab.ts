import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Booking, ReminderLog } from '../../../../services/booking.service';
import { ReminderService, CreateReminderRequest } from '../../../../services/reminder.service';

export interface NewReminderData {
  reminder_type: string;
  days_before_event: number;
  scheduled_date: string;
  scheduled_time: string;
  recipient_email: string;
  subject?: string;
  message_content?: string;
}

@Component({
  selector: 'app-reminders-tab',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reminders-tab.html',
  styleUrl: './reminders-tab.scss',
})
export class RemindersTab {
  @Input({ required: true }) booking!: Booking;
  @Output() reminderCreated = new EventEmitter<void>();
  @Output() reminderDeleted = new EventEmitter<void>();

  private reminderService = inject(ReminderService);
  showCreateModal = false;
  confirmDeleteTarget: ReminderLog | null = null;
  isCreating = false;
  isDeleting = false;

  newReminder: NewReminderData = {
    reminder_type: 'client_reminder',
    days_before_event: 7,
    scheduled_date: '',
    scheduled_time: '09:00',
    recipient_email: '',
    subject: '',
    message_content: ''
  };

  reminderTypes = [
    { value: 'client_reminder', label: 'Client Reminder' },
    { value: 'crew_details_customer', label: 'Crew Details Customer' },
    { value: 'payment_reminder', label: 'Payment Reminder' },
    { value: 'event_reminder', label: 'Event Reminder' }
  ];

  formatDate(value: string): string {
    return new Date(value).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  formatDateTime(date: string, time: string | null): string {
    if (!date) return '—';
    const dateStr = new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const timeStr = time ? time : '';
    return timeStr ? `${dateStr} at ${timeStr} IST` : dateStr;
  }

  trackByReminderId(index: number, item: ReminderLog): string {
    return item.id;
  }

  statusClass(status: string): string {
    switch (status) {
      case 'sent': return 'badge-success';
      case 'pending': return 'badge-neutral';
      case 'skipped': return 'badge-neutral';
      case 'failed': return 'badge-destructive';
      default: return 'badge-neutral';
    }
  }

  reminderTypeLabel(type: string): string {
    const found = this.reminderTypes.find(r => r.value === type);
    return found?.label || type;
  }

  onOpenCreateModal(): void {
    // Set default scheduled date based on event date
    if (this.booking.event_date) {
      const eventDate = new Date(this.booking.event_date);
      eventDate.setDate(eventDate.getDate() - 7); // Default 7 days before
      this.newReminder.scheduled_date = eventDate.toISOString().split('T')[0];
    }
    // Default time is already set to '09:00' in the initialization
    this.showCreateModal = true;
  }

  onCloseCreateModal(): void {
    this.showCreateModal = false;
    this.resetForm();
  }

  onCreateReminder(): void {
    if (!this.newReminder.scheduled_date || !this.newReminder.recipient_email) {
      alert('Please fill in all required fields');
      return;
    }

    this.isCreating = true;

    const reminderRequest: CreateReminderRequest = {
      booking_id: this.booking.id,
      ...this.newReminder
    };

    // Use the actual ReminderService to create the reminder
    this.reminderService.createReminder(reminderRequest).subscribe({
      next: (response) => {
        console.log('Reminder created successfully:', response);
        this.isCreating = false;
        this.showCreateModal = false;
        this.resetForm();
        this.reminderCreated.emit();
      },
      error: (error) => {
        console.error('Error creating reminder:', error);
        this.isCreating = false;
        alert('Failed to create reminder. Please try again.');
      }
    });
  }

  onDeleteClick(reminder: ReminderLog): void {
    this.confirmDeleteTarget = reminder;
  }

  onCancelDelete(): void {
    this.confirmDeleteTarget = null;
  }

  onConfirmDelete(): void {
    if (!this.confirmDeleteTarget) return;

    this.isDeleting = true;

    // Use the actual ReminderService to delete the reminder
    this.reminderService.deleteReminder(this.confirmDeleteTarget.id).subscribe({
      next: (response) => {
        console.log('Reminder deleted successfully:', response);
        this.isDeleting = false;
        this.confirmDeleteTarget = null;
        this.reminderDeleted.emit();
      },
      error: (error) => {
        console.error('Error deleting reminder:', error);
        this.isDeleting = false;
        alert('Failed to delete reminder. Please try again.');
      }
    });
  }

  private resetForm(): void {
    this.newReminder = {
      reminder_type: 'client_reminder',
      days_before_event: 7,
      scheduled_date: '',
      scheduled_time: '09:00',
      recipient_email: '',
      subject: '',
      message_content: ''
    };
  }
}