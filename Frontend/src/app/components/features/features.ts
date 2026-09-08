import { Component } from '@angular/core';
import {
  LucideAngularModule,
  Calendar,
  Users,
  Package,
  ChartColumn,
  Zap,
  Shield,
  Lock,
  Server,
  Database,
  Sparkles
} from 'lucide-angular';
import { FeatureCard } from './feature-card/feature-card';

export interface Feature {
  icon: any;
  title: string;
  description: string;
}

@Component({
  selector: 'app-features',
  standalone: true,
  imports: [LucideAngularModule, FeatureCard],
  templateUrl: './features.html',
  styleUrl: './features.scss'
})
export class Features {
  readonly SparklesIcon = Sparkles;

  readonly features: Feature[] = [
    { icon: Calendar, title: 'Smart Booking Pipeline', description: 'Track leads from quote to delivery. Multi-installment payments with auto invoice generation.' },
    { icon: Users, title: 'Package-Aware Crew Scheduling', description: 'Define day-by-day crew needs per package. Auto conflict detection prevents double-bookings.' },
    { icon: Package, title: 'Equipment Tracking', description: 'Check equipment in/out per shoot. Real-time visibility on who has what, for how long.' },
    { icon: ChartColumn, title: 'Production Workflow', description: 'Assign editing tasks with deadlines. Editors see their tasks; HR tracks status end-to-end.' },
    { icon: Zap, title: 'Email Automation', description: 'Auto-send reminders, quotes, invoices, and crew notifications by email. Stay ahead of every event.' },
    { icon: Shield, title: 'Role-Based Access', description: 'Admin, HR, photographers, editors, drone operators - each role sees only what they need.' },
    { icon: Lock, title: 'Encrypted Data Security', description: 'Sensitive studio, client, payment and event data stays protected with encrypted transport and secure access controls.' },
    { icon: Server, title: 'Dedicated Personal Server', description: 'Every studio can run on its own isolated server environment, keeping company data separate from other businesses.' },
    { icon: Database, title: 'Automatic Backups', description: 'Regular backup support helps protect bookings, client records, invoices and production work from accidental loss.' },
  ];
}
