import { Component,signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { EnquiryModal } from './components/enquiry-modal/enquiry-modal';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet,EnquiryModal],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
    enquiryModalOpen = signal(false);

  openEnquiryModal(): void {
    this.enquiryModalOpen.set(true);
  }
}
