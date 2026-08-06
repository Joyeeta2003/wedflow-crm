import { Component } from '@angular/core';
import { PricingCard, PricingPlan } from './pricing-card/pricing-card';

@Component({
  selector: 'app-pricing',
  imports: [PricingCard],
  templateUrl: './pricing.html',
  styleUrl: './pricing.scss',
})
export class Pricing {
  pricingPlans: PricingPlan[] = [
    {
      id: 'essential',
      tag: 'ESSENTIAL',
      name: 'Essential Plan',
      highlight: false,
      features: [
        'Up to 5 team members',
        'Booking & client management',
        'Basic crew scheduling',
        'Payment tracking',
        'Email reminders',
      ],
      buttonText: 'Get Started',
    },
    {
      id: 'advanced',
      tag: 'ADVANCED',
      name: 'Advanced Plan',
      highlight: true,
      badge: 'Most Popular',
      features: [
        'Up to 15 team members',
        'Everything in Essential',
        'Equipment checkout tracking',
        'Production task workflow',
        'Multi-location support',
        'Advanced analytics',
      ],
      buttonText: 'Start Free Trial',
    },
    {
      id: 'ultimate',
      tag: 'ULTIMATE',
      name: 'Ultimate Plan',
      highlight: false,
      features: [
        'Unlimited team members',
        'Everything in Advanced',
        'Multi-studio / branch support',
        'Custom branding & logo',
        'Priority support',
        'API access',
      ],
      buttonText: 'Contact Sales',
    },
  ];
}