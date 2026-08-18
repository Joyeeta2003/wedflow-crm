import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface CrewMember {
  role: string;
  count: number;
}

interface DayCrew {
  dayLabel: string; // "Day 1: Pre-wedding"
  crew: CrewMember[]; // empty hole "No crew defined for this day"
}

interface PaymentTerm {
  label: string; // "Advance", "Balance", "Installment 3"
  percent: number;
  timing: string; // "At Booking", "On Event Day"
}

interface EditorAssignment {
  role: string; // "1x Photo Editor"
  task: string; // "Photo Editing - 7d"
}

interface Package {
  id: string;
  name: string;
  status: 'Active' | 'Inactive';
  durationDays: number;
  price: string;
  description: string;
  crewPerDay: DayCrew[];
  paymentSchedule: PaymentTerm[];
  reminderNote: string;
  editorPlan: EditorAssignment[];
  deliverables: string[];
}

@Component({
  selector: 'app-packages',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './packages.html',
  styleUrl: './packages.scss',
})
export class Packages {
  // TODO: real API theke fetch hobe
  packages: Package[] = [
    {
      id: '1',
      name: 'ROYAL WEDDING PACKAGE',
      status: 'Active',
      durationDays: 5,
      price: '₹2,20,000',
      description: '4 Days Full Coverage + Pre-wedding (Photo & Video – Both Sides) Drone Shoot (Wedding + Pre-wedding)',
      crewPerDay: [
        { dayLabel: 'Day 1: Pre-wedding', crew: [{ role: 'Photographer', count: 1 }, { role: 'Videographer', count: 1 }, { role: 'Drone Operator', count: 1 }] },
        { dayLabel: 'Day 2: Mehendi/Aiburobhat', crew: [{ role: 'Photographer', count: 1 }, { role: 'Videographer', count: 1 }] },
        { dayLabel: 'Day 3: Wedding', crew: [{ role: 'Photographer', count: 3 }, { role: 'Cinematographer', count: 2 }, { role: 'Drone Operator', count: 1 }] },
        { dayLabel: 'Day 4: Vidai/Baran', crew: [{ role: 'Photographer', count: 1 }, { role: 'Cinematographer', count: 1 }] },
        { dayLabel: 'Day 5: Reception', crew: [{ role: 'Photographer', count: 2 }, { role: 'Cinematographer', count: 1 }] },
      ],
      paymentSchedule: [
        { label: 'Advance', percent: 50, timing: 'At Booking' },
        { label: 'On Event Day', percent: 40, timing: 'On Event Day' },
        { label: 'On Final Delivery', percent: 10, timing: 'Days After Event' },
      ],
      reminderNote: 'Reminders use Day 3; crew details mail: 7 days before each event day.',
      editorPlan: [],
      deliverables: [
        '2 Royal Look Albums (12×36 size) (60 Pages per Album)',
        '180–200 Edited Photos',
        '2 Mini Albums',
      ],
    },
    {
      id: '2',
      name: 'EXCLUSIVE WEDDING PACKAGE',
      status: 'Active',
      durationDays: 4,
      price: '₹15,00,000',
      description: '3 Days Coverage + Pre-wedding (Photo & Video Both Sides)',
      crewPerDay: [
        { dayLabel: 'Day 1: Pre-wedding', crew: [{ role: 'Photographer', count: 1 }, { role: 'Cinematographer', count: 1 }, { role: 'Drone Operator', count: 1 }] },
        { dayLabel: 'Day 2: Wedding', crew: [{ role: 'Photographer', count: 3 }, { role: 'Cinematographer', count: 2 }] },
        { dayLabel: 'Day 3: Vidai/Baran', crew: [{ role: 'Photographer', count: 1 }, { role: 'Cinematographer', count: 1 }] },
        { dayLabel: 'Day 4: Reception', crew: [{ role: 'Photographer', count: 2 }, { role: 'Cinematographer', count: 1 }] },
      ],
      paymentSchedule: [
        { label: 'Advance', percent: 50, timing: 'At Booking' },
        { label: 'On Event', percent: 40, timing: 'On Event Day' },
        { label: 'On Final Delivery', percent: 10, timing: 'Days After Event' },
      ],
      reminderNote: 'Reminders use Day 2; crew details mail: 7 days before each event day.',
      editorPlan: [],
      deliverables: [
        '2 Exclusive Albums (12×36 size) (60 Pages per Album)',
        '180–200 Edited Photos',
        '2 Mini Albums',
      ],
    },
    {
      id: '3',
      name: 'STANDARD WEDDING PACKAGE',
      status: 'Active',
      durationDays: 3,
      price: '₹1,00,000',
      description: '3 Days Wedding Coverage',
      crewPerDay: [
        { dayLabel: 'Day 1: Wedding', crew: [{ role: 'Photographer', count: 2 }, { role: 'Cinematographer', count: 1 }] },
        { dayLabel: 'Day 2: Vidai/Baran', crew: [{ role: 'Photographer', count: 1 }, { role: 'Cinematographer', count: 1 }] },
        { dayLabel: 'Day 3: Reception', crew: [{ role: 'Photographer', count: 2 }, { role: 'Cinematographer', count: 1 }] },
      ],
      paymentSchedule: [
        { label: 'Advance', percent: 50, timing: 'At Booking' },
        { label: 'On Event Day', percent: 40, timing: 'On Event Day' },
        { label: 'On Final Delivery', percent: 10, timing: 'Days After Event' },
      ],
      reminderNote: 'Reminders use Day 1; crew details mail: 7 days before each event day.',
      editorPlan: [],
      deliverables: [
        '2 Standard Plus Albums (12×36 size) (40 Pages per Album)',
        '120–130 Edited Photos for each album',
        '4K Wedding Film (20–25 mins)',
      ],
    },
  ];

  // ----- Deliverables: prothom 3 ta dekhabe, baki count-e "+X more..." -----
  visibleDeliverables(pkg: Package): string[] {
    return pkg.deliverables.slice(0, 3);
  }

  remainingCount(pkg: Package): number {
    return pkg.deliverables.length - 3;
  }

  onNewPackage(): void {
    // TODO: new package form/modal
  }

  onEdit(pkg: Package): void {
    // TODO: edit form/modal
  }

  onDelete(pkg: Package): void {
    // TODO: confirm dialog + delete API call
  }
}