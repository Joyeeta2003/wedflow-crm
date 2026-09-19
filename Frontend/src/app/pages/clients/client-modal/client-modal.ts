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

export interface EditClientData extends NewClientData {
  id: string;
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
  @Input() editClient: EditClientData | null = null;
  @Output() closeModal = new EventEmitter<void>();
  @Output() create = new EventEmitter<NewClientData>();
  @Output() update = new EventEmitter<EditClientData>();

  newClient: NewClientData = {
    name: '',
    phone: '',
    email: '',
    address: '',
    notes: ''
  };

  get isEditMode(): boolean {
    return this.editClient !== null;
  }

  get modalTitle(): string {
    return this.isEditMode ? 'Edit Client' : 'New Client';
  }

  get submitButtonText(): string {
    return this.isEditMode ? 'Update' : 'Create';
  }

  ngOnChanges() {
    if (this.editClient) {
      this.newClient = {
        name: this.editClient.name,
        phone: this.editClient.phone,
        email: this.editClient.email,
        address: this.editClient.address,
        notes: this.editClient.notes
      };
    } else {
      this.resetForm();
    }
  }

  onCancel() {
    this.resetForm();
    this.closeModal.emit();
  }

  onSubmit(form: NgForm) {
    if (form.invalid) return;

    if (this.isEditMode && this.editClient) {
      this.update.emit({ ...this.newClient, id: this.editClient.id });
    } else {
      this.create.emit({ ...this.newClient });
    }
    this.resetForm();
  }

  private resetForm() {
    this.newClient = { name: '', phone: '', email: '', address: '', notes: '' };
  }
}