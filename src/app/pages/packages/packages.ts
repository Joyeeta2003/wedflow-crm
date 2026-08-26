import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NewPackageModal } from './components/new-package-modal/new-package-modal';

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
  imports: [CommonModule, NewPackageModal],
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
      description:
        '4 Days Full Coverage + Pre-wedding (Photo & Video – Both Sides) Drone Shoot (Wedding + Pre-wedding)',
      crewPerDay: [
        {
          dayLabel: 'Day 1: Pre-wedding',
          crew: [
            { role: 'Photographer', count: 1 },
            { role: 'Videographer', count: 1 },
            { role: 'Drone Operator', count: 1 },
          ],
        },
        {
          dayLabel: 'Day 2: Mehendi/Aiburobhat',
          crew: [
            { role: 'Photographer', count: 1 },
            { role: 'Videographer', count: 1 },
          ],
        },
        {
          dayLabel: 'Day 3: Wedding',
          crew: [
            { role: 'Photographer', count: 3 },
            { role: 'Cinematographer', count: 2 },
            { role: 'Drone Operator', count: 1 },
          ],
        },
        {
          dayLabel: 'Day 4: Vidai/Baran',
          crew: [
            { role: 'Photographer', count: 1 },
            { role: 'Cinematographer', count: 1 },
          ],
        },
        {
          dayLabel: 'Day 5: Reception',
          crew: [
            { role: 'Photographer', count: 2 },
            { role: 'Cinematographer', count: 1 },
          ],
        },
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
        {
          dayLabel: 'Day 1: Pre-wedding',
          crew: [
            { role: 'Photographer', count: 1 },
            { role: 'Cinematographer', count: 1 },
            { role: 'Drone Operator', count: 1 },
          ],
        },
        {
          dayLabel: 'Day 2: Wedding',
          crew: [
            { role: 'Photographer', count: 3 },
            { role: 'Cinematographer', count: 2 },
          ],
        },
        {
          dayLabel: 'Day 3: Vidai/Baran',
          crew: [
            { role: 'Photographer', count: 1 },
            { role: 'Cinematographer', count: 1 },
          ],
        },
        {
          dayLabel: 'Day 4: Reception',
          crew: [
            { role: 'Photographer', count: 2 },
            { role: 'Cinematographer', count: 1 },
          ],
        },
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
        {
          dayLabel: 'Day 1: Wedding',
          crew: [
            { role: 'Photographer', count: 2 },
            { role: 'Cinematographer', count: 1 },
          ],
        },
        {
          dayLabel: 'Day 2: Vidai/Baran',
          crew: [
            { role: 'Photographer', count: 1 },
            { role: 'Cinematographer', count: 1 },
          ],
        },
        {
          dayLabel: 'Day 3: Reception',
          crew: [
            { role: 'Photographer', count: 2 },
            { role: 'Cinematographer', count: 1 },
          ],
        },
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
    {
      id: '4',
      name: 'BASIC PRE-WEDDING PACKAGE',
      status: 'Active',
      durationDays: 1,
      price: '₹20,000',
      description: '1 DAY SHOOT 2/3 LOCATION PHOTO + VIDEO COVERAGE',
      crewPerDay: [
        {
          dayLabel: 'Day 1: Pre-Wedding',
          crew: [
            { role: 'Photographer', count: 1 },
            { role: 'Cinematographer', count: 1 },
          ],
        },
      ],
      paymentSchedule: [
        { label: 'Advance', percent: 60, timing: 'At Booking' },
        { label: 'Advance', percent: 40, timing: 'On Event Day' },
        { label: 'On Final Delivery', percent: 10, timing: 'days After Event' },
      ],
      reminderNote: 'Reminders use Day 1; crew details mail: 2 days before each event day.',
      editorPlan: [],
      deliverables: [
        '25–30 Special Edited Photos',
        '1 Cinematic Teaser (3–4 mins)',
        'All Raw Photos (Soft Copy)',
      ],
    },
    {
      id: '5',
      name: 'PREMIUM PRE-WEDDING PACKAGE',
      status: 'Active',
      durationDays: 2,
      price: '₹35,000',
      description: '2 DAYS SHOOT MULTIPLE LOCATIONS',
      crewPerDay: [
        {
          dayLabel: 'Day 1: Pre-Wedding',
          crew: [
            { role: 'Photographer', count: 1 },
            { role: 'Cinematographer', count: 1 },
            { role: 'Drone Operator', count: 1 },
          ],
        },
        {
          dayLabel: 'Day 2: Pre-Wedding',
          crew: [
            { role: 'Photographer', count: 1 },
            { role: 'Cinematographer', count: 1 },
            { role: 'Drone Operator', count: 1 },
          ],
        },
      ],
      paymentSchedule: [
        { label: 'Advance', percent: 60, timing: 'At Booking' },
        { label: 'Advance', percent: 40, timing: 'On Event Day' },
        { label: 'On Final Delivery', percent: 10, timing: 'days After Event' },
      ],
      reminderNote: 'Reminders use Day 1; crew details mail: 5 days before each event day.',
      editorPlan: [],
      deliverables: [
        '40–50 Edited Photos',
        '1 Cinematic Pre-Wedding Film (3–4 mins)',
        'Teaser (1 min)',
      ],
    },
    {
      id: '6',
      name: 'ABC PACKAGE',
      status: 'Active',
      durationDays: 2,
      price: '₹50,000',
      description: 'Full Package',
      crewPerDay: [
        {
          dayLabel: 'Day 1: Wedding',
          crew: [
            { role: 'Photographer', count: 1 },
            { role: 'Cinematographer', count: 1 },
          ],
        },
        {
          dayLabel: 'Day 2: Reception',
          crew: [
            { role: 'Photographer', count: 1 },
            { role: 'Cinematographer', count: 1 },
          ],
        },
      ],
      paymentSchedule: [
        { label: 'Advance', percent: 50, timing: 'At Booking' },
        { label: 'On Final Delivery', percent: 50, timing: 'Days After Event' },
      ],
      reminderNote: 'Reminders use Day 1; crew details mail: 3 days before each event day.',
      editorPlan: [],
      deliverables: ['Video'],
    },
    {
      id: '7',
      name: 'ROYAL WEDDING PACKAGE',
      status: 'Active',
      durationDays: 3,
      price: '₹35,000',
      description:
        'Complete Royal Wedding Coverage including Pre-Wedding Shoot, Haldi Ceremony, Mehendi.',
      crewPerDay: [
        {
          dayLabel: 'Day 1: Mehendi',
          crew: [
            { role: 'Photographer', count: 2 },
            { role: 'Cinematographer', count: 2 },
          ],
        },
        {
          dayLabel: 'Day 2: Wedding',
          crew: [
            { role: 'Photographer', count: 2 },
            { role: 'Cinematographer', count: 2 },
            { role: 'Drone Operator', count: 1 },
          ],
        },
        {
          dayLabel: 'Day 3: Reception',
          crew: [{ role: 'Photographer', count: 2 }],
        },
      ],
      paymentSchedule: [
        { label: 'Advance', percent: 30, timing: 'At Booking' },
        { label: 'Advance', percent: 30, timing: 'On Event Day' },
        { label: 'Advance', percent: 30, timing: 'Days After Event 1d' },
        { label: 'Advance', percent: 100, timing: 'At Booking' },
      ],
      reminderNote: 'Reminders use Day 1; crew details mail: 3 days before each event day.',
      editorPlan: [],
      deliverables: [
        'Pre-Wedding Photoshoot (1 Day)',
        '100+ Professionally Edited Photos',
        '15–20 Minute Cinematic Wedding Film',
      ],
    },
    {
      id: '8',
      name: 'ULTIMATE WEDDING PACKAGE',
      status: 'Active',
      durationDays: 4,
      price: '₹3,50,000',
      description: 'Wedding Package',
      crewPerDay: [
        {
          dayLabel: 'Day 1: Sangeet/Haldi',
          crew: [
            { role: 'Photographer', count: 2 },
            { role: 'Cinematographer', count: 2 },
            { role: 'Drone Operator', count: 1 },
          ],
        },
        {
          dayLabel: 'Day 2: Mehendi',
          crew: [
            { role: 'Photographer', count: 2 },
            { role: 'Photo Editor', count: 2 },
          ],
        },
        {
          dayLabel: 'Day 3: Wedding',
          crew: [{ role: 'Photographer', count: 3 }],
        },
        {
          dayLabel: 'Day 4: Reception',
          crew: [{ role: 'Photographer', count: 2 }],
        },
      ],
      paymentSchedule: [
        { label: 'Advance', percent: 30, timing: 'At Booking' },
        { label: 'Advance', percent: 20, timing: 'On Event Day' },
        { label: 'Advance', percent: 50, timing: 'On Final Delivery' },
      ],
      reminderNote: 'Reminders use Day 1; crew details mail: 3 days before each event day.',
      editorPlan: [],
      deliverables: ['ghghgh'],
    },
    {
      id: '9',
      name: 'CM PHOTOGRAPHY PREMIUM PACKAGE',
      status: 'Active',
      durationDays: 5,
      price: '₹76,000',
      description: 'sdgfhdf',
      crewPerDay: [
        {
          dayLabel: 'Day 1: Wedding',
          crew: [],
        },
        {
          dayLabel: 'Day 2: Haldi',
          crew: [],
        },
        {
          dayLabel: 'Day 3: Wedding',
          crew: [],
        },
        {
          dayLabel: 'Day 4: Reception',
          crew: [],
        },
      ],
      paymentSchedule: [
        { label: 'Advance', percent: 20, timing: 'At Booking' },
        { label: 'Balance', percent: 20, timing: 'On Event Day' },
        { label: 'Installment 2', percent: 60, timing: 'On Final Delivery' },
      ],
      reminderNote: 'Reminders use Day 1; crew details mail: 3 days before each event day.',
      editorPlan: [],
      deliverables: ['heheheww'],
    },
    {
      id: '10',
      name: 'DEMO TESTING',
      status: 'Active',
      durationDays: 4,
      price: '₹1,50,000',
      description: 'Full Coverage',
      crewPerDay: [
        { dayLabel: 'Day 1: Wedding', crew: [] },
        { dayLabel: 'Day 2: Reception', crew: [] },
        { dayLabel: 'Day 3: Haldi', crew: [] },
        { dayLabel: 'Day 4: Sangeet', crew: [] },
      ],
      paymentSchedule: [
        { label: 'Advance', percent: 20, timing: 'At Booking' },
        { label: 'Balance', percent: 20, timing: 'On Event Day' },
        { label: 'Installment 2', percent: 60, timing: 'On Final Delivery' },
      ],
      reminderNote: 'Reminders use Day 1; crew details mail: 3 days before each event day.',
      editorPlan: [],
      deliverables: ['Album will be delivered'],
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

  showModal = false;

  onPackageCreated(data: any) {
    console.log(data);
    this.showModal = false;
  }
}
