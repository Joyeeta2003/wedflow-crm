import { Component } from '@angular/core';
import { Navbar } from '../../components/navbar/navbar';
import { Hero } from '../../components/hero/hero';
import { Dashboard } from '../../components/dashboard/dashboard';
import { StatsSection } from '../../components/stats-section/stats-section';
import { Pricing } from '../../components/pricing/pricing';
import { Features } from '../../components/features/features';
import { Cta } from '../../components/cta/cta';
import { Footer } from '../../components/footer/footer';

@Component({
  selector: 'app-landing-page',
  imports: [Navbar,Hero,Dashboard,StatsSection,Pricing,Features,Cta,Footer],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.scss',
})
export class LandingPage {}
