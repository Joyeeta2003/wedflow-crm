import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WorkAssignmentModal, WorkRequest } from './work-assignment-modal/work-assignment-modal';

interface Professional {
  id: string;
  initials: string;
  name: string;
  verified: boolean;
  type: 'Individual' | 'Team';
  experienceYears: number;
  city: string;
  state: string;
  skills: string[];
  summary: string;
  availableRate: number;
  email: string;
  phone: string;
}

type ServiceFilter =
  | 'all'
  | 'photographer'
  | 'cinematographer'
  | 'videographer'
  | 'drone_operator'
  | 'photo_editor'
  | 'video_editor'
  | 'album_designer'
  | 'live_streaming_team'
  | 'lighting_team'
  | 'other';
  
  type TypeFilter = 'all' | 'individual' | 'team';

@Component({
  selector: 'app-marketplace',
  standalone: true,
  imports: [CommonModule, FormsModule, WorkAssignmentModal],
  templateUrl: './marketplace.html',
  styleUrl: './marketplace.scss'
})
export class Marketplace {
  activeTab = signal<'browse' | 'requests'>('browse');

  searchTerm = signal('');
  serviceFilter = signal<ServiceFilter>('all');
  typeFilter = signal<TypeFilter>('all');
  cityTerm = signal('');

  isServiceMenuOpen = signal(false);
  isTypeMenuOpen = signal(false);

  showAssignmentModal = signal(false);
  selectedWorkRequest = signal<WorkRequest | null>(null);

 serviceOptions: { value: ServiceFilter; label: string }[] = [
  { value: 'all', label: 'All services' },
  { value: 'photographer', label: 'Wedding Photographer' },
  { value: 'cinematographer', label: 'Cinematographer' },
  { value: 'videographer', label: 'Traditional Videographer' },
  { value: 'drone_operator', label: 'Drone Operator' },
  { value: 'photo_editor', label: 'Photo Editor' },
  { value: 'video_editor', label: 'Video Editor' },
  { value: 'album_designer', label: 'Album Designer' }, 
  { value: 'live_streaming_team', label: 'Live Streaming Team' },
  { value: 'lighting_team', label: 'Lighting Team' },
  { value: 'other', label: 'Other' }
];

  typeOptions: { value: TypeFilter; label: string }[] = [
    { value: 'all', label: 'Individuals & teams' },
    { value: 'individual', label: 'Individuals only' },
    { value: 'team', label: 'Teams only' }
  ];

  professionals = signal<Professional[]>([
    {
      id: 'p1',
      initials: 'ZP',
      name: 'Zack P',
      verified: true,
      type: 'Individual',
      experienceYears: 12,
      city: 'Kolkata',
      state: 'West Bengal',
      skills: [
        'Wedding Photographer',
        'Cinematographer',
        'Traditional Videographer',
        'Drone Operator',
        'Photo Editor',
        'Video Editor'
      ],
      summary: 'summary of my work, my life,',
      availableRate: 1500,
      email: 'zackagarwal@gmail.com',
      phone: '8296100911'
    }
  ]);

  workRequests = signal<WorkRequest[]>([
    {
      id: 'wr1',
      project: 'Wedding coverage for 1L users',
      professionalRole: 'Wedding Photographer',
      professionalName: 'Zack P',
      professionalEmail: 'zackagarwal@gmail.com',
      professionalPhone: '8296100911',
      eventDate: '29/6/2026',
      venue: 'Venue',
      budget: 20000,
      status: 'Accepted'
    },
    {
      id: 'wr2',
      project: 'Corporate event photography',
      professionalRole: 'Cinematographer',
      professionalName: 'Rohan Gupta',
      professionalEmail: 'rohan@example.com',
      professionalPhone: '9876543210',
      eventDate: '15/7/2026',
      venue: 'Taj Bengal',
      budget: 15000,
      status: 'Pending'
    },
    {
      id: 'wr3',
      project: 'Birthday celebration',
      professionalRole: 'Photo Editor',
      professionalName: 'Akash Sarkar',
      professionalEmail: 'akash@example.com',
      professionalPhone: '8765432109',
      eventDate: '20/8/2026',
      venue: 'ITC Sonar',
      budget: 8000,
      status: 'Completed'
    }
  ]);

  statusOptions = [
    { value: 'Pending', label: 'Pending' },
    { value: 'Accepted', label: 'Accepted' },
    { value: 'Declined', label: 'Declined' },
    { value: 'Completed', label: 'Completed' }
  ];

  filteredProfessionals = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const service = this.serviceFilter();
    const type = this.typeFilter();
    const city = this.cityTerm().trim().toLowerCase();

    return this.professionals().filter(p => {
      const matchesTerm =
        !term || p.name.toLowerCase().includes(term) || p.skills.some(s => s.toLowerCase().includes(term));

      const matchesService =
        service === 'all' || p.skills.some(s => s.toLowerCase().replace(/\s+/g, '_').includes(service));

      const matchesType =
        type === 'all' ||
        (type === 'individual' && p.type === 'Individual') ||
        (type === 'team' && p.type === 'Team');

      const matchesCity = !city || p.city.toLowerCase().includes(city) || p.state.toLowerCase().includes(city);

      return matchesTerm && matchesService && matchesType && matchesCity;
    });
  });

  hasActiveFilters = computed(
    () => !!this.searchTerm() || this.serviceFilter() !== 'all' || this.typeFilter() !== 'all' || !!this.cityTerm()
  );

  verifiedCount = computed(() => this.professionals().filter(p => p.verified).length);
  hiredCount = signal(0); // TODO: no "hired" data source wired up yet

  setTab(tab: 'browse' | 'requests') {
    this.activeTab.set(tab);
  }

  toggleServiceMenu() {
    this.isServiceMenuOpen.set(!this.isServiceMenuOpen());
    this.isTypeMenuOpen.set(false);
  }

  toggleTypeMenu() {
    this.isTypeMenuOpen.set(!this.isTypeMenuOpen());
    this.isServiceMenuOpen.set(false);
  }

  selectService(value: ServiceFilter) {
    this.serviceFilter.set(value);
    this.isServiceMenuOpen.set(false);
  }

  selectType(value: TypeFilter) {
    this.typeFilter.set(value);
    this.isTypeMenuOpen.set(false);
  }

  get serviceLabel(): string {
    return this.serviceOptions.find(o => o.value === this.serviceFilter())?.label ?? 'All services';
  }

  get typeLabel(): string {
    return this.typeOptions.find(o => o.value === this.typeFilter())?.label ?? 'Individuals & teams';
  }

  resetFilters() {
    this.searchTerm.set('');
    this.serviceFilter.set('all');
    this.typeFilter.set('all');
    this.cityTerm.set('');
  }

  visibleSkills(p: Professional): string[] {
    return p.skills.slice(0, 3);
  }

  extraSkillsCount(p: Professional): number {
    return Math.max(0, p.skills.length - 3);
  }

  onAssignWork(request: WorkRequest) {
    this.selectedWorkRequest.set(request);
    this.showAssignmentModal.set(true);
  }

  onStatusChange(request: WorkRequest, newStatus: string) {
    this.workRequests.update(requests =>
      requests.map(r => r.id === request.id ? { ...r, status: newStatus as any } : r)
    );
  }

  onAssignmentModalClose() {
    this.showAssignmentModal = signal(false);
    this.selectedWorkRequest.set(null);
  }

  onAssignmentConfirmed(data: any) {
    // Update the work request status or remove it from the list
    this.workRequests.update(requests =>
      requests.filter(r => r.id !== this.selectedWorkRequest()?.id)
    );
    this.hiredCount.update(count => count + 1);
  }
}
