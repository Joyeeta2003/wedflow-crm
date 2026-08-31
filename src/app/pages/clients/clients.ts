import { Component, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ClientModal, NewClientData } from './client-modal/client-modal';
import { ClientService, Client } from '../../services/client.service';
import { Auth } from '../../services/auth';

interface DisplayClient {
  id: string;
  name: string;
  customerId: string;
  phone: string;
  email: string;
  address: string;
  createdAt: string;
}

@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [CommonModule, FormsModule, ClientModal],
  templateUrl: './clients.html',
  styleUrl: './clients.scss',
})
export class Clients implements OnInit, OnDestroy {
  showNewClientModal = false;
  clients: DisplayClient[] = [];
  loading = false;
  error: string | null = null;

  searchTerm = '';
  dateFrom = '';
  dateTo = '';

  private readonly handleWindowFocus = () => {
    this.loadClients();
  };

  constructor(
    private clientService: ClientService,
    private auth: Auth,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadClients();
    window.addEventListener('focus', this.handleWindowFocus);
  }

  ngOnDestroy(): void {
    window.removeEventListener('focus', this.handleWindowFocus);
  }

  loadClients(): void {
    this.loading = true;
    this.error = null;
    this.cdr.detectChanges(); // Force immediate UI update

    this.clientService.getClients().subscribe({
      next: (response) => {
        this.clients = (response?.clients ?? []).map((client) => this.mapToDisplayClient(client));
        this.loading = false;
        this.cdr.detectChanges(); // Force UI update
      },
      error: (err) => {
        console.error('Error loading clients:', err);

        if (err?.status === 401 || err?.status === 403) {
          this.auth.clearSession();
          this.router.navigate(['/login']);
          return;
        }

        this.error = 'Failed to load clients';
        this.loading = false;
        this.cdr.detectChanges(); // Force UI update
      },
    });
  }

  private mapToDisplayClient(client: Client): DisplayClient {
    return {
      id: client.id,
      name: client.name,
      customerId: `DRVSTU-CUS-${client.id.slice(0, 8).toUpperCase()}`,
      phone: client.phone || '',
      email: client.email || '',
      address: client.address || '',
      createdAt: client.created_at.slice(0, 10),
    };
  }

  get filteredClients(): DisplayClient[] {
    const term = this.searchTerm.trim().toLowerCase();
    const fromDate = this.parseDDMMYYYY(this.dateFrom);
    const toDate = this.parseDDMMYYYY(this.dateTo);

    return this.clients.filter((c) => {
      const matchesSearch =
        !term ||
        c.name.toLowerCase().includes(term) ||
        c.phone.toLowerCase().includes(term) ||
        c.email.toLowerCase().includes(term) ||
        c.customerId.toLowerCase().includes(term);

      const createdDate = new Date(c.createdAt);
      const matchesFrom = !fromDate || createdDate >= fromDate;
      const matchesTo = !toDate || createdDate <= toDate;

      return matchesSearch && matchesFrom && matchesTo;
    });
  }

  private parseDDMMYYYY(value: string): Date | null {
    if (!value || value.length !== 10) return null;
    const [dd, mm, yyyy] = value.split('-').map(Number);
    if (!dd || !mm || !yyyy) return null;
    return new Date(yyyy, mm - 1, dd);
  }

  onTemplate(): void {
    // TODO: download blank Excel template
  }

  onImportExcel(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    input.value = '';
  }

  onExportExcel(): void {
    // TODO: export filteredClients as Excel/CSV
  }

  onNewClient(): void {
    this.showNewClientModal = true;
  }

  onEdit(client: DisplayClient): void {
    // TODO: edit form/modal
  }

  onDelete(client: DisplayClient): void {
    if (confirm(`Are you sure you want to delete ${client.name}?`)) {
      this.clientService.deleteClient(client.id).subscribe({
        next: () => {
          this.clients = this.clients.filter((c) => c.id !== client.id);
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error deleting client:', err);
          alert('Failed to delete client');
        },
      });
    }
  }

  onModalClose(): void {
    this.showNewClientModal = false;
    this.loadClients();
  }

  onClientCreate(data: NewClientData): void {
    // Check for duplicate phone number
    if (data.phone && data.phone.trim()) {
      const existingPhone = this.clients.find(c => c.phone === data.phone.trim());
      if (existingPhone) {
        alert('A client with this phone number already exists');
        return;
      }
    }

    // Check for duplicate email
    if (data.email && data.email.trim()) {
      const existingEmail = this.clients.find(c => c.email === data.email.trim());
      if (existingEmail) {
        alert('A client with this email already exists');
        return;
      }
    }

    this.clientService.createClient({
      name: data.name,
      phone: data.phone,
      email: data.email,
      address: data.address,
      status: 'active'
    }).subscribe({
      next: (response) => {
        this.clients = [...this.clients, this.mapToDisplayClient(response.client)];
        this.showNewClientModal = false;
        this.cdr.detectChanges();
        this.loadClients();
      },
      error: (err) => {
        console.error('Error creating client:', err);
        if (err.status === 401 || err.status === 403) {
          this.auth.clearSession();
          this.router.navigate(['/login']);
          return;
        }

        if (err.status === 409) {
          alert(err.error?.error || 'A client with this phone number or email already exists');
        } else {
          alert('Failed to create client');
        }
      },
    });
  }
}