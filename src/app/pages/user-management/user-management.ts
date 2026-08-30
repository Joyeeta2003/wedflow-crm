import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserModal, NewUserData } from './user-modal/user-modal'; // 👈 1. NOTUN IMPORT ADD KOR

type Role =
  | 'Admin'
  | 'HR Manager'
  | 'Photographer'
  | 'Cinematographer'
  | 'Videographer'
  | 'Drone Operator'
  | 'Photo Editor'
  | 'Video Editor';

interface AppUser {
  id: string;
  name: string;
  email: string;
  staffName?: string;
  role: Role;
  joinedAt: string;
  active: boolean;
}

interface RoleGroup {
  role: Role;
  users: AppUser[];
}

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, UserModal], // 👈 2. IMPORTS ARRAY-E UserModal ADD KOR
  templateUrl: './user-management.html',
  styleUrl: './user-management.scss',
})
export class UserManagement {
  showNewUserModal = false; // 👈 3. NOTUN PROPERTY ADD KOR

  private roleOrder: Role[] = [
    'Admin',
    'HR Manager',
    'Photographer',
    'Cinematographer',
    'Videographer',
    'Drone Operator',
    'Photo Editor',
    'Video Editor',
  ];

  users: AppUser[] = [
    { id: '1', name: 'Joyeeta Das', email: 'joyeetadas597@gmail.com', role: 'Admin', joinedAt: '2026-07-18', active: true },
    { id: '2', name: 'Piyush Agarwal', email: 'zackagarwal@gmail.com', role: 'Admin', joinedAt: '2026-06-02', active: true },
    { id: '3', name: 'Preetam', email: 'preetamchakrabortty610@gmail.com', role: 'Admin', joinedAt: '2026-08-06', active: true },
    { id: '4', name: 'Preetam', email: 'mr.pritam420@gmail.com', role: 'Admin', joinedAt: '2026-08-08', active: true },

    { id: '5', name: 'Akash Sarkar', email: 'akash.sribridhi@gmail.com', staffName: 'Akash Sarkar', role: 'Photographer', joinedAt: '2026-06-09', active: true },
    { id: '6', name: 'Rohan Gupta', email: 'arnab.bera@tnu.in', staffName: 'Rohan Gupta', role: 'Photographer', joinedAt: '2026-06-10', active: true },
    { id: '7', name: 'ytewtywty', email: 'nsh@gmail.com', staffName: 'ytewtywty', role: 'Photographer', joinedAt: '2026-07-18', active: true },

    { id: '8', name: 'Kathakali Mondal', email: 'kathakali.sribridhi@gmail.com', staffName: 'Kathakali Mondal', role: 'Cinematographer', joinedAt: '2026-06-02', active: true },
    { id: '9', name: 'fjdfjhjd', email: 'xyz@gmail.com', staffName: 'fjdfjhjd', role: 'Cinematographer', joinedAt: '2026-06-30', active: true },

    { id: '10', name: 'Sujan Das', email: 'sujan.sribridhi@gmail.com', staffName: 'Sujan Das', role: 'Videographer', joinedAt: '2026-06-09', active: true },
    { id: '11', name: 'srijon chakrabortty', email: 'acd@gmail.com', staffName: 'srijon chakrabortty', role: 'Videographer', joinedAt: '2026-06-30', active: true },

    { id: '12', name: 'Abhijit Bhattacharya', email: 'abhijit.sribridhi@gmail.com', staffName: 'Abhijit Bhattacharya', role: 'Drone Operator', joinedAt: '2026-06-09', active: true },

    { id: '13', name: 'Putul Sarkar', email: 'putul.sribridhi@gmail.com', staffName: 'Putul Sarkar', role: 'Photo Editor', joinedAt: '2026-06-09', active: true },
    { id: '14', name: 'Rajib', email: 'ad@gmail.com', staffName: 'Rajib', role: 'Photo Editor', joinedAt: '2026-07-01', active: true },

    { id: '15', name: 'Abhirup', email: 'abcdre@gmail.com', staffName: 'Abhirup', role: 'Video Editor', joinedAt: '2026-07-15', active: true },
    { id: '16', name: 'Srabani Dey', email: 'srabani.sribridhi@gmail.com', staffName: 'Srabani Dey', role: 'Video Editor', joinedAt: '2026-06-09', active: true },
  ];

  private roleLabelMap: Record<string, Role> = {
    admin: 'Admin',
    hr: 'HR Manager',
    photographer: 'Photographer',
    cinematographer: 'Cinematographer',
    videographer: 'Videographer',
    drone_operator: 'Drone Operator',
    photo_editor: 'Photo Editor',
    video_editor: 'Video Editor',
  };

  get totalUsers(): number {
    return this.users.length;
  }

  get activeUsers(): number {
    return this.users.filter((u) => u.active).length;
  }

  get groupedUsers(): RoleGroup[] {
    return this.roleOrder
      .map((role) => ({
        role,
        users: this.users.filter((u) => u.role === role),
      }))
      .filter((group) => group.users.length > 0);
  }

  formatDate(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  onNewUser(): void {
    this.showNewUserModal = true; // 👈 4. PURONO TODO REPLACE KORLAM
  }

  onModalClose(): void {
    // 👈 5. NOTUN METHOD ADD KOR
    this.showNewUserModal = false;
  }

  onUserCreate(data: NewUserData): void {
    // 👈 6. NOTUN METHOD ADD KOR
    const roleLabel = this.roleLabelMap[data.role];

    const newUser: AppUser = {
      id: String(this.users.length + 1),
      name: data.name,
      email: data.email,
      staffName: data.role === 'admin' ? undefined : data.name,
      role: roleLabel,
      joinedAt: new Date().toISOString().slice(0, 10),
      active: true,
    };

    this.users = [...this.users, newUser];
    this.showNewUserModal = false;
  }

  onEdit(user: AppUser): void {
    // TODO: edit form/modal
  }

  onDelete(user: AppUser): void {
    this.users = this.users.filter((u) => u.id !== user.id);
  }
}