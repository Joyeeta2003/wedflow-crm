import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StudioBranding } from './studio-branding/studio-branding';
import { AutomationRules } from './automation-rules/automation-rules';
import { EmailStudio } from './email-studio/email-studio';


interface SettingsCard {
  key: string;
  icon: 'branding' | 'automation' | 'email' | 'whatsapp';
  title: string;
  description: string;
  badgeLabel: string;
  disabled?: boolean;
}

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, StudioBranding, AutomationRules, EmailStudio],
  templateUrl: './settings.html',
  styleUrl: './settings.scss',
})
export class Settings {
  studioName = 'DRV Studios';
  studioLogoUrl: string | null = '/assests/images/drv.jpg';
  crewAssignmentDays = 10;

  activeView: 'branding' | 'automation' | 'email' | null = null;

  cards: SettingsCard[] = [
    {
      key: 'branding',
      icon: 'branding',
      title: 'Studio Branding',
      description: 'Update the company logo used throughout the portal and notifications.',
      badgeLabel: 'Logo configured',
    },
    {
      key: 'automation',
      icon: 'automation',
      title: 'Automation Rules',
      description: 'Set operational lead times for crew assignment.',
      badgeLabel: '10 days before event',
    },
    {
      key: 'email',
      icon: 'email',
      title: 'Email Studio',
      description: 'Edit one premium email format at a time with its own banner.',
      badgeLabel: '16 formats',
    },
    {
      key: 'whatsapp',
      icon: 'whatsapp',
      title: 'WhatsApp Studio',
      description: 'Enable WhatsApp for this company from Superadmin first.',
      badgeLabel: 'Not enabled',
      disabled: true,
    },
  ];

  onCardClick(card: SettingsCard): void {
    if (card.disabled) return;
    if (card.key === 'branding' || card.key === 'automation' || card.key === 'email') {
      this.activeView = card.key;
    }
  }

  onBackToGrid(): void {
    this.activeView = null;
  }

  onBrandingSaved(newLogoUrl: string | null): void {
    this.studioLogoUrl = newLogoUrl;
    this.activeView = null;
  }

  onAutomationSaved(newDays: number): void {
    this.crewAssignmentDays = newDays;
    this.cards = this.cards.map((c) =>
      c.key === 'automation' ? { ...c, badgeLabel: `${newDays} days before event` } : c,
    );
    this.activeView = null;
  }

  onEmailStudioSaved(): void {
    this.activeView = null;
  }
}