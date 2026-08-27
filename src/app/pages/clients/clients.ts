import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Client {
  id: string;
  name: string;
  customerId: string;
  phone: string;
  email: string;
  address: string;
  createdAt: string; // ISO date string — "customers created from/to" filter-er jonno
}

@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './clients.html',
  styleUrl: './clients.scss',
})
export class Clients {
  // TODO: real API theke fetch hobe
  clients: Client[] = [
    {
      id: '1',
      name: 'Sample Customer',
      customerId: 'DRVSTU-CUS-000010',
      phone: '9876543210',
      email: 'customer@example.com',
      address: 'Full postal address',
      createdAt: '2026-01-10',
    },
    {
      id: '2',
      name: 'Soumik & Shrya',
      customerId: 'DRVSTU-CUS-000012',
      phone: '+91 7439452394',
      email: 'arnab.bera@tnu.in',
      address: 'kolkata',
      createdAt: '2026-02-15',
    },
    {
      id: '3',
      name: 'Swagatam & Swagata',
      customerId: 'DRVSTU-CUS-000016',
      phone: '9876543210',
      email: 'swagatam.jana@tnu.in',
      address: 'Salt Lake',
      createdAt: '2026-03-05',
    },
    {
      id: '4',
      name: 'Arnab',
      customerId: 'DRVSTU-CUS-000011',
      phone: '+91 9330550475',
      email: 'arnabb319@gmail.com',
      address: 'kolkata',
      createdAt: '2026-01-28',
    },
  ];

  searchTerm = '';
  dateFrom = ''; // DD-MM-YYYY string
  dateTo = '';   // DD-MM-YYYY string

  get filteredClients(): Client[] {
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

  // ---------- Header actions ----------
  onTemplate(): void {
    // TODO: download blank Excel template
  }

  onImportExcel(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    // TODO: parse .xlsx/.xls/.csv and merge into clients[]
    input.value = ''; // same file abar select korলেও (change) event fire korার jonno reset
  }

  onExportExcel(): void {
    // TODO: export filteredClients as Excel/CSV
  }

  onNewClient(): void {
    // TODO: new client form/modal, jerokom "New Package" modal chilo
  }

  onEdit(client: Client): void {
    // TODO: edit form/modal
  }

  onDelete(client: Client): void {
    // TODO: confirm dialog + delete API call
    this.clients = this.clients.filter((c) => c.id !== client.id);
  }
}