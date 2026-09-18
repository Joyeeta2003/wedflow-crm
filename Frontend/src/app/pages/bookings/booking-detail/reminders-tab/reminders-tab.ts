import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Booking, ReminderLog } from '../../../../services/booking.service';

@Component({
  selector: 'app-reminders-tab',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reminders-tab.html',
  styleUrl: './reminders-tab.scss',
})
export class RemindersTab {
  @Input({ required: true }) booking!: Booking;

  formatDate(value: string): string {
    return new Date(value).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  trackByReminderId(index: number, item: ReminderLog): string {
    return item.id;
  }
}