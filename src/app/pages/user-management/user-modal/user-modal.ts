import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';

export type UserRoleValue =
  | 'admin'
  | 'hr'
  | 'photographer'
  | 'cinematographer'
  | 'videographer'
  | 'drone_operator'
  | 'photo_editor'
  | 'video_editor';

export interface NewUserData {
  name: string;
  email: string;
  phone: string;
  role: UserRoleValue;
  address: string;
}

@Component({
  selector: 'app-user-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-modal.html',
  styleUrl: './user-modal.scss',
})
export class UserModal {
  @Input() isOpen = false;
  @Output() closeModal = new EventEmitter<void>();
  @Output() create = new EventEmitter<NewUserData>();

  roles: { value: UserRoleValue; label: string }[] = [
    { value: 'admin', label: 'Admin' },
    { value: 'hr', label: 'HR Manager' },
    { value: 'photographer', label: 'Photographer' },
    { value: 'cinematographer', label: 'Cinematographer' },
    { value: 'videographer', label: 'Videographer' },
    { value: 'drone_operator', label: 'Drone Operator' },
    { value: 'photo_editor', label: 'Photo Editor' },
    { value: 'video_editor', label: 'Video Editor' },
  ];

  newUser: NewUserData = {
    name: '',
    email: '',
    phone: '',
    role: 'photographer',
    address: '',
  };

  onCancel() {
    this.resetForm();
    this.closeModal.emit();
  }

  onSubmit(form: NgForm) {
    if (form.invalid) return;
    this.create.emit({ ...this.newUser });
    this.resetForm();
  }

  private resetForm() {
    this.newUser = { name: '', email: '', phone: '', role: 'photographer', address: '' };
  }
}