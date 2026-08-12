import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

interface StatCard {
  label: string;
  value: string;
  subtext: string;
  icon: string;
  link: string;
  highlighted?: boolean;
}

interface CalendarDay {
  date: number;
  type: 'prev' | 'current' | 'next';
  hasEvent?: boolean;
}

interface ActionItem {
  type: 'crew' | 'payment';
  title: string;
  detail: string;
  link: string;
  urgent: boolean; // true => red/danger icon
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  // ----- Attention banner -----
  bookingsNeedingCrew = signal(5);
  paymentsNeedingFollowUp = signal(22);

  // ----- Stat cards -----
  statCards: StatCard[] = [
    { label: 'Total Revenue', value: '₹17,62,000', subtext: '₹9,73,000 collected', icon: 'trending-up', link: '/app/bookings', highlighted: true },
    { label: 'Active Bookings', value: '9', subtext: '0 upcoming this month', icon: 'calendar', link: '/app/bookings' },
    { label: 'Pending Payments', value: '22', subtext: 'Require follow up', icon: 'credit-card', link: '/app/bookings' },
    { label: 'Need Crew', value: '5', subtext: 'Bookings unassigned', icon: 'users', link: '/app/crew-assignments' },
  ];

  // ----- Calendar -----
  currentMonth = signal(new Date(2026, 7, 1));
  selectedDate = signal(new Date(2026, 7, 12));
  searchTerm = signal('');

  monthLabel = computed(() => this.currentMonth().toLocaleString('en-US', { month: 'long' }));
  yearLabel = computed(() => this.currentMonth().getFullYear());
  weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  calendarDays = computed<CalendarDay[]>(() => {
    const year = this.currentMonth().getFullYear();
    const month = this.currentMonth().getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDateOfMonth = new Date(year, month + 1, 0).getDate();
    const prevLastDate = new Date(year, month, 0).getDate();
    const startOffset = (firstDay.getDay() + 6) % 7;

    const days: CalendarDay[] = [];
    for (let i = startOffset; i > 0; i--) {
      days.push({ date: prevLastDate - i + 1, type: 'prev' });
    }
    for (let d = 1; d <= lastDateOfMonth; d++) {
      days.push({ date: d, type: 'current' });
    }
    const remainder = days.length % 7;
    if (remainder !== 0) {
      for (let d = 1; d <= 7 - remainder; d++) {
        days.push({ date: d, type: 'next' });
      }
    }
    return days;
  });

  prevMonth(): void {
    const d = this.currentMonth();
    this.currentMonth.set(new Date(d.getFullYear(), d.getMonth() - 1, 1));
  }

  nextMonth(): void {
    const d = this.currentMonth();
    this.currentMonth.set(new Date(d.getFullYear(), d.getMonth() + 1, 1));
  }

  goToToday(): void {
    const today = new Date();
    this.currentMonth.set(new Date(today.getFullYear(), today.getMonth(), 1));
    this.selectedDate.set(today);
  }

  selectDay(day: CalendarDay): void {
    if (day.type !== 'current') return;
    this.selectedDate.set(new Date(this.currentMonth().getFullYear(), this.currentMonth().getMonth(), day.date));
  }

  isSelected(day: CalendarDay): boolean {
    return (
      day.type === 'current' &&
      day.date === this.selectedDate().getDate() &&
      this.currentMonth().getMonth() === this.selectedDate().getMonth()
    );
  }

  isPast(day: CalendarDay): boolean {
    return day.type !== 'current';
  }

  // ----- Filtered events (TODO: real API data) -----
  filteredEvents = [
    { id: '6a451fc8cf4d7fe2486b481e', name: 'Aniket', date: '01-08-2026', location: 'kolkata' },
  ];

  // ----- Action items -----
  actionItems: ActionItem[] = [
    { type: 'crew', title: 'Assign crew for Subha', detail: 'Event in -35 days - crew not yet assigned', link: '/app/bookings/6a43729eeff108acd01663aa', urgent: true },
    { type: 'crew', title: 'Assign crew for Swagatam & Swagata', detail: 'Event in -22 days - crew not yet assigned', link: '/app/bookings/6a5b20497a427311e7ce16c2', urgent: true },
    { type: 'crew', title: 'Assign crew for Aniket', detail: 'Event in -11 days - crew not yet assigned', link: '/app/bookings/6a451fc8cf4d7fe2486b481e', urgent: true },
    { type: 'payment', title: 'Payment overdue: "Advance"', detail: 'Rs. 1,10,000 due - follow up needed', link: '/app/bookings', urgent: true },
    { type: 'payment', title: 'Payment overdue: "Advance"', detail: 'Rs. 1,05,000 due - follow up needed', link: '/app/bookings', urgent: true },
    { type: 'payment', title: 'Payment overdue: "On Event Day"', detail: 'Rs. 88,000 due - follow up needed', link: '/app/bookings', urgent: true },
  ];
}