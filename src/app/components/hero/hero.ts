import { Component, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './hero.html',
  styleUrl: './hero.scss'
})
export class Hero {
  openEnquiryRequested = output<void>();

  openEnquiryModal(): void {
    this.openEnquiryRequested.emit();
  }
}