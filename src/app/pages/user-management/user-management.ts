import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

type Role =
  | 'Admin'
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
  staffName?: string; // Admin-der jonno thake na, baki role-e thake
  role: Role;
  joinedAt: string; // ISO date
  active: boolean;
}

interface RoleGroup {
  role: Role;
  users: AppUser[];
}

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-management.html',
  styleUrl: './user-management.scss',
})
export class UserManagement {
  // Role-order fixed rakhlam, screenshot-e ei order-e e dekhachhilo
  private roleOrder: Role[] = [
    'Admin',
    'Photographer',
    'Cinematographer',
    'Videographer',
    'Drone Operator',
    'Photo Editor',
    'Video Editor',
  ];

  // TODO: real API theke fetch hobe
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
    // TODO: New User modal (screenshot lagবে form fields dekhার jonno)
  }

  onEdit(user: AppUser): void {
    // TODO: edit form/modal
  }

  onDelete(user: AppUser): void {
    this.users = this.users.filter((u) => u.id !== user.id);
  }
}