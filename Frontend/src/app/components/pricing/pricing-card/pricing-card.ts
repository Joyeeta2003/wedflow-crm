import { Component, Input } from '@angular/core';

export interface PricingPlan {
  id: string;
  tag: string;
  name: string;
  highlight: boolean;
  badge?: string;
  features: string[];
  buttonText: string;
}

@Component({
  selector: 'app-pricing-card',
  templateUrl: './pricing-card.html',
  styleUrl: './pricing-card.scss',
})
export class PricingCard {
  @Input({ required: true }) plan!: PricingPlan;
}
