import { Component, model, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';

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
  submitted = output<void>();

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

  onSubmit(form: NgForm): void {
    if (form.invalid) {
      return;
    }

    this.isSubmitting.set(true);

    console.log('Enquiry submitted:', {
      fullName: this.fullName(),
      phone: this.phone(),
      studioName: this.studioName(),
      email: this.email(),
      message: this.message()
    });

    // TODO: আসল API কল এখানে বসাও, সফল হলে নিচের কোড রান করবে
    setTimeout(() => {
      this.isSubmitting.set(false);
      this.resetForm(form);
      this.closeModal();
      this.submitted.emit();
    }, 800);
  }

  private resetForm(form: NgForm): void {
    form.resetForm();
    this.fullName.set('');
    this.phone.set('');
    this.studioName.set('');
    this.email.set('');
    this.message.set('');
  }
}