import { Component, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WorkAssignmentModal, WorkRequest } from './work-assignment-modal/work-assignment-modal';
import { MarketplaceService } from '../../services/marketplace.service';
import type { Professional as ServiceProfessional } from '../../services/marketplace.service';

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

// Local interface for the component to match the service interface
interface Professional extends ServiceProfessional {}

@Component({
  selector: 'app-marketplace',
  standalone: true,
  imports: [CommonModule, FormsModule, WorkAssignmentModal],
  templateUrl: './marketplace.html',
  styleUrl: './marketplace.scss'
})
export class Marketplace implements OnInit {
  activeTab = signal<'browse' | 'requests'>('browse');

  searchTerm = signal('');
  serviceFilter = signal<ServiceFilter>('all');
  typeFilter = signal<TypeFilter>('all');
  cityTerm = signal('');

  isServiceMenuOpen = signal(false);
  isTypeMenuOpen = signal(false);

  showAssignmentModal = signal(false);
  selectedWorkRequest = signal<WorkRequest | null>(null);

  isLoading = signal(false);
  error = signal<string | null>(null);

  constructor(private marketplaceService: MarketplaceService) {}

  ngOnInit() {
    this.loadMarketplaceData();
  }

  loadMarketplaceData() {
    this.isLoading.set(true);
    this.error.set(null);

    this.marketplaceService.getProfessionals().subscribe({
      next: (response) => {
        if (response.success) {
          this.professionals.set(response.professionals);
        } else {
          this.error.set('Failed to load professionals');
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading professionals:', err);
        this.error.set('Failed to load professionals');
        this.isLoading.set(false);
      }
    });

    this.marketplaceService.getWorkRequests().subscribe({
      next: (response) => {
        if (response.success) {
          const transformedRequests = response.workRequests.map(req => ({
            id: req.id,
            project: req.project,
            professionalRole: req.professionalRole,
            professionalName: req.professionalName,
            professionalEmail: req.professionalEmail,
            professionalPhone: req.professionalPhone,
            eventDate: req.eventDate,
            venue: req.venue,
            budget: req.budget,
            status: req.status as 'Pending' | 'Accepted' | 'Declined' | 'Completed'
          }));
          this.workRequests.set(transformedRequests);
        } else {
          this.error.set('Failed to load work requests');
        }
      },
      error: (err) => {
        console.error('Error loading work requests:', err);
        this.error.set('Failed to load work requests');
      }
    });
  }

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

  professionals = signal<Professional[]>([]);
  workRequests = signal<WorkRequest[]>([]);

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
    // Convert status to proper case for service
    const properStatus = newStatus.charAt(0).toUpperCase() + newStatus.slice(1).toLowerCase() as 'Pending' | 'Accepted' | 'Declined' | 'Completed';

    this.marketplaceService.updateWorkRequest(request.id, { status: properStatus }).subscribe({
      next: (response) => {
        if (response.success) {
          this.workRequests.update(requests =>
            requests.map(r => r.id === request.id ? { ...r, status: properStatus } : r)
          );
        }
      },
      error: (err) => {
        console.error('Error updating work request status:', err);
        this.error.set('Failed to update work request status');
      }
    });
  }

  onAssignmentModalClose() {
    this.showAssignmentModal.set(false);
    this.selectedWorkRequest.set(null);
  }

  onAssignmentConfirmed(data: any) {
    // Update the work request status to 'Accepted' when assignment is confirmed
    const requestId = this.selectedWorkRequest()?.id;
    if (requestId) {
      this.marketplaceService.updateWorkRequest(requestId, { status: 'Accepted' }).subscribe({
        next: (response) => {
          if (response.success) {
            this.workRequests.update(requests =>
              requests.map(r => r.id === requestId ? { ...r, status: 'Accepted' } : r)
            );
            this.hiredCount.update(count => count + 1);
          }
        },
        error: (err) => {
          console.error('Error confirming assignment:', err);
          this.error.set('Failed to confirm assignment');
        }
      });
    }
    this.showAssignmentModal.set(false);
    this.selectedWorkRequest.set(null);
  }
}
