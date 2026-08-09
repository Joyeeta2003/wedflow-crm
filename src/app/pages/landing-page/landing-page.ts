import { Component,signal } from '@angular/core';
import { Navbar } from '../../components/navbar/navbar';
import { Hero } from '../../components/hero/hero';
import { StatsSection } from '../../components/stats-section/stats-section';
import { Pricing } from '../../components/pricing/pricing';
import { Features } from '../../components/features/features';
import { Cta } from '../../components/cta/cta';
import { Footer } from '../../components/footer/footer';
import { EnquiryModal } from '../../components/enquiry-modal/enquiry-modal';

@Component({
  selector: 'app-landing-page',
  imports: [Navbar,Hero,StatsSection,Pricing,Features,Cta,Footer,EnquiryModal],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.scss',
})
export class LandingPage {
    enquiryModalOpen = signal(false);

  openEnquiryModal(): void {
    this.enquiryModalOpen.set(true);
    document.body.style.overflow = 'hidden';
  }
}
