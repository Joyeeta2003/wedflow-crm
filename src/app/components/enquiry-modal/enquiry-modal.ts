import { Component, model, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-enquiry-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './enquiry-modal.html',
  styleUrl: './enquiry-modal.scss'
})
export class EnquiryModal {
  isOpen = model(false);
  isSubmitting = signal(false);

  fullName = signal('');
  phone = signal('');
  studioName = signal('');
  email = signal('');
  message = signal('');

  closeModal(): void {
    this.isOpen.set(false);
    document.body.style.overflow = '';
  }

  onOverlayClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.closeModal();
    }
  }

  onSubmit(): void {
    if (!this.fullName() || !this.phone() || !this.studioName()) {
      return;
    }
    this.isSubmitting.set(true);

    // TODO: এখানে API কল বসাও
    console.log('Enquiry submitted:', {
      fullName: this.fullName(),
      phone: this.phone(),
      studioName: this.studioName(),
      email: this.email(),
      message: this.message()
    });
  }
}