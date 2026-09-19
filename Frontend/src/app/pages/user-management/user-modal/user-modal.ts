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

export interface EditUserData extends NewUserData {
  id: string;
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
  @Input() isSubmitting = false;
  @Input() editUser: EditUserData | null = null;
  @Output() closeModal = new EventEmitter<void>();
  @Output() create = new EventEmitter<NewUserData>();
  @Output() update = new EventEmitter<EditUserData>();

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

  get isEditMode(): boolean {
    return this.editUser !== null;
  }

  get modalTitle(): string {
    return this.isEditMode ? 'Edit User' : 'Create New User';
  }

  get submitButtonText(): string {
    return this.isEditMode ? 'Update User' : 'Create User';
  }

  ngOnChanges() {
    if (this.editUser) {
      this.newUser = {
        name: this.editUser.name,
        email: this.editUser.email,
        phone: this.editUser.phone,
        role: this.editUser.role,
        address: this.editUser.address
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

    if (this.isEditMode && this.editUser) {
      this.update.emit({ ...this.newUser, id: this.editUser.id });
    } else {
      this.create.emit({ ...this.newUser });
    }
  }

  resetForm() {
    this.newUser = { name: '', email: '', phone: '', role: 'photographer', address: '' };
  }
}