import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-toast',
  standalone: true,
  templateUrl: './toast.html',
  styleUrl: './toast.scss'
})
export class Toast {
  visible = input(false);
  title = input('Enquiry submitted');
  message = input('Our team will contact you soon.');
  variant = input<'success' | 'error'>('success');
  closed = output<void>();

  onClose(): void {
    this.closed.emit();
  }
}