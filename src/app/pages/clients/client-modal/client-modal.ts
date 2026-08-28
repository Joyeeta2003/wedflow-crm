import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';

export interface NewClientData {
  name: string;
  phone: string;
  email: string;
  address: string;
  notes: string;
}

@Component({
  selector: 'app-client-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './client-modal.html',
  styleUrl: './client-modal.scss'
})
export class ClientModal {
  @Input() isOpen = false;
  @Output() closeModal = new EventEmitter<void>();
  @Output() create = new EventEmitter<NewClientData>();

  newClient: NewClientData = {
    name: '',
    phone: '',
    email: '',
    address: '',
    notes: ''
  };

  onCancel() {
    this.resetForm();
    this.closeModal.emit();
  }

  onSubmit(form: NgForm) {
    if (form.invalid) return;

    this.create.emit({ ...this.newClient });
    this.resetForm();
  }

  private resetForm() {
    this.newClient = { name: '', phone: '', email: '', address: '', notes: '' };
  }
}