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
  valueColor: string;
}

interface DayEvent {
  id: string;
  name: string;
  location: string;
  packageName: string;
  needsCrew: boolean;
  colorBg: string;
}

interface CalendarDay {
  date: number;
  type: 'prev' | 'current' | 'next';
  fullDate: Date;
  events: DayEvent[];
}

interface ActionItem {
  type: 'crew' | 'payment';
  title: string;
  detail: string;
  link: string;
  urgent: boolean;
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
    {
      label: 'Total Revenue',
      value: '₹17,62,000',
      subtext: '₹9,73,000 collected',
      icon: 'trending-up',
      link: '/bookings',
      highlighted: true,
      valueColor: 'gold',
    },
    {
      label: 'Active Bookings',
      value: '9',
      subtext: '0 upcoming this month',
      icon: 'calendar',
      link: '/bookings',
      valueColor: 'white',
    },
    {
      label: 'Pending Payments',
      value: '22',
      subtext: 'Require follow up',
      icon: 'credit-card',
      link: '/bookings',
      valueColor: 'red',
    },
    {
      label: 'Need Crew',
      value: '5',
      subtext: 'Bookings unassigned',
      icon: 'users',
      link: '/crew-assignments',
      valueColor: 'gold',
    },
  ];

  // ----- Calendar -----
  today = new Date(2026, 7, 13); // TODO: production e new Date() use korte hobe
  currentMonth = signal(new Date(2026, 7, 1));
  selectedDate = signal(new Date(2026, 7, 13));
  searchTerm = signal('');

  monthLabel = computed(() => this.currentMonth().toLocaleString('en-US', { month: 'long' }));
  yearLabel = computed(() => this.currentMonth().getFullYear());
  weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // ----- Sample event data (TODO: real API theke fetch hobe) -----
  private eventsByDate: Record<string, DayEvent[]> = {
    '2026-7-31': [
      {
        id: 'jason-1',
        name: 'Jason',
        location: 'kolkata',
        packageName: 'Royal Wedding Package',
        needsCrew: false,
        colorBg: 'rgba(31, 71, 31, 0.35)',
      },
    ],
    '2026-8-1': [
      {
        id: '6a451fc8cf4d7fe2486b481e',
        name: 'Aniket',
        location: 'kolkata',
        packageName: 'Om Photography Premium Package',
        needsCrew: true,
        colorBg: 'rgba(98, 24, 24, 0.35)',
      },
    ],
  };

  private dateKey(d: Date): string {
    return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
  }

  calendarDays = computed<CalendarDay[]>(() => {
    const year = this.currentMonth().getFullYear();
    const month = this.currentMonth().getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDateOfMonth = new Date(year, month + 1, 0).getDate();
    const prevLastDate = new Date(year, month, 0).getDate();
    const startOffset = (firstDay.getDay() + 6) % 7;

    const days: CalendarDay[] = [];

    for (let i = startOffset; i > 0; i--) {
      const d = new Date(year, month - 1, prevLastDate - i + 1);
      days.push({
        date: d.getDate(),
        type: 'prev',
        fullDate: d,
        events: this.eventsByDate[this.dateKey(d)] ?? [],
      });
    }
    for (let d = 1; d <= lastDateOfMonth; d++) {
      const full = new Date(year, month, d);
      days.push({
        date: d,
        type: 'current',
        fullDate: full,
        events: this.eventsByDate[this.dateKey(full)] ?? [],
      });
    }
    const remainder = days.length % 7;
    if (remainder !== 0) {
      for (let d = 1; d <= 7 - remainder; d++) {
        const full = new Date(year, month + 1, d);
        days.push({
          date: d,
          type: 'next',
          fullDate: full,
          events: this.eventsByDate[this.dateKey(full)] ?? [],
        });
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
    this.currentMonth.set(new Date(this.today.getFullYear(), this.today.getMonth(), 1));
    this.selectedDate.set(this.today);
  }

  selectDay(day: CalendarDay): void {
    if (day.type !== 'current') return;
    this.selectedDate.set(day.fullDate);
  }

  isSelected(day: CalendarDay): boolean {
    return day.type === 'current' && this.sameDate(day.fullDate, this.selectedDate());
  }

  isToday(day: CalendarDay): boolean {
    return day.type === 'current' && this.sameDate(day.fullDate, this.today);
  }

  isOtherMonth(day: CalendarDay): boolean {
    return day.type !== 'current';
  }

  private sameDate(a: Date, b: Date): boolean {
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  }

  selectedDateEvents = computed<DayEvent[]>(() => {
  const key = this.dateKey(this.selectedDate());
  return this.eventsByDate[key] ?? [];
});

  // ----- Filtered events -----
  filteredEvents = [
    { id: '6a451fc8cf4d7fe2486b481e', name: 'Aniket', date: '01-08-2026', location: 'kolkata' },
  ];

  // ----- Action items -----
  actionItems: ActionItem[] = [
    {
      type: 'crew',
      title: 'Assign crew for Subha',
      detail: 'Event in -36 days - crew not yet assigned',
      link: '/bookings/6a43729eeff108acd01663aa',
      urgent: true,
    },
    {
      type: 'crew',
      title: 'Assign crew for Swagatam & Swagata',
      detail: 'Event in -23 days - crew not yet assigned',
      link: '/bookings/6a5b20497a427311e7ce16c2',
      urgent: true,
    },
    {
      type: 'crew',
      title: 'Assign crew for Aniket',
      detail: 'Event in -12 days - crew not yet assigned',
      link: '/bookings/6a451fc8cf4d7fe2486b481e',
      urgent: true,
    },
    {
      type: 'payment',
      title: 'Payment overdue: "Advance"',
      detail: 'Rs. 1,10,000 due - follow up needed',
      link: '/bookings',
      urgent: true,
    },
    {
      type: 'payment',
      title: 'Payment overdue: "Advance"',
      detail: 'Rs. 1,05,000 due - follow up needed',
      link: '/bookings',
      urgent: true,
    },
    {
      type: 'payment',
      title: 'Payment overdue: "On Event Day"',
      detail: 'Rs. 88,000 due - follow up needed',
      link: '/bookings',
      urgent: true,
    },
    {
      type: 'payment',
      title: 'Payment overdue: "Advance"',
      detail: 'Rs. 22,800 due - follow up needed',
      link: '/bookings',
      urgent: true,
    },
    {
      type: 'payment',
      title: 'Payment overdue: "Installment 3"',
      detail: 'Rs. 7,600 due - follow up needed',
      link: '/bookings',
      urgent: true,
    },
    {
      type: 'payment',
      title: 'Payment overdue: "Balance"',
      detail: 'Rs. 15,200 due - follow up needed',
      link: '/bookings',
      urgent: true,
    },
    {
      type: 'payment',
      title: 'Payment overdue: "Balance"',
      detail: 'Rs. 1,05,000 due - follow up needed',
      link: '/bookings',
      urgent: true,
    },
    {
      type: 'payment',
      title: 'Payment overdue: "Advance"',
      detail: 'Rs. 30,000 due - follow up needed',
      link: '/bookings',
      urgent: true,
    },
    {
      type: 'payment',
      title: 'Payment overdue: "Installment 3"',
      detail: 'Rs. 15,000 due - follow up needed',
      link: '/bookings',
      urgent: true,
    },
    {
      type: 'payment',
      title: 'Payment overdue: "On Event Day"',
      detail: 'Rs. 40,000 due - follow up needed',
      link: '/bookings',
      urgent: true,
    },
    {
      type: 'payment',
      title: 'Payment overdue: "Advance"',
      detail: 'Rs. 50,000 due - follow up needed',
      link: '/bookings',
      urgent: true,
    },
    {
      type: 'crew',
      title: 'Assign crew for Soumik & Shrya',
      detail: 'Event in 103 days - crew not yet assigned',
      link: '/bookings',
      urgent: false,
    },
    {
      type: 'crew',
      title: 'Assign crew for Subha',
      detail: 'Event in 486 days - crew not yet assigned',
      link: '/bookings',
      urgent: false,
    },
  ];
}
