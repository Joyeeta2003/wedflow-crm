import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface StorageFile {
  id: string;
  name: string;
  customer: string;
  bookingId: string;
  sizeLabel: string;
  badge: string; // e.g. "Album" | "Deep Archive" — UNCONFIRMED full set of values
  action: 'download' | 'restore';
}

interface BookingOption {
  id: string;
  label: string;
}

type FileTypeOption = { value: string; label: string };

@Component({
  selector: 'app-storage',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './storage.html',
  styleUrl: './storage.scss',
})
export class Storage {
  // ==== stats ====
  usedBytes = signal(193 * 1024); // 193.0 KB
  usedLabel = signal('193.0 KB');
  uploadingLabel = signal('0 B');
  availableLabel = signal('1024.00 GB');
  totalLabel = signal('1.00 TB');
  filesCount = signal(2);

  // percentage — real calculation (1TB = 1024*1024*1024*1024 bytes... using GB-based approx here for simplicity)
  usagePercent = computed(() => {
    const totalBytes = 1024 * 1024 * 1024 * 1024; // 1 TB in bytes (approx, binary)
    const pct = (this.usedBytes() / totalBytes) * 100;
    return Math.max(pct, 0.05); // floor so a sliver is always visible
  });

  archiveEligibleDays = signal(30);

  // ==== upload form ====
  bookingOptions = signal<BookingOption[]>([
    { id: 'DRVSTU-BKG-000009', label: 'DRVSTU-BKG-000009 - Arnab' },
    { id: 'DRVSTU-BKG-000010', label: 'DRVSTU-BKG-000010 - Swagatam & Swagata' },
    { id: 'DRVSTU-BKG-000012', label: 'DRVSTU-BKG-000012 - Subha' },
    { id: 'DRVSTU-BKG-000018', label: 'DRVSTU-BKG-000018 - Swagatam & Swagata' },
    { id: 'DRVSTU-BKG-000017', label: 'DRVSTU-BKG-000017 - Soham Biswas' },
    { id: 'DRVSTU-BKG-000019', label: 'DRVSTU-BKG-000019 - Jason' },
    { id: 'DRVSTU-BKG-000013', label: 'DRVSTU-BKG-000013 - Aniket' },
    { id: 'DRVSTU-BKG-000014', label: 'DRVSTU-BKG-000014 - Soumik & Shrya' }, // UNCONFIRMED — cut off in screenshot, name guessed from file-list row
  ]);
  selectedBookingId = signal<string | null>(null);
  isChooseFileDisabled = computed(() => !this.selectedBookingId());

  rawTypeOptions: FileTypeOption[] = [
    { value: 'raw', label: 'Raw' },
    { value: 'edited', label: 'Edited' },
    { value: 'album', label: 'Album' },
    { value: 'final', label: 'Final' },
    { value: 'other', label: 'Other' },
  ];
  selectedRawType = signal('raw');

mediaTypeOptions: FileTypeOption[] = [
  { value: 'photo', label: 'Photo' },
  { value: 'video', label: 'Video' },
  { value: 'document', label: 'Document' },
  { value: 'archive', label: 'Archive' },
  { value: 'other', label: 'Other' }
];
  selectedMediaType = signal('photo');

  isBookingMenuOpen = signal(false);
  isRawTypeMenuOpen = signal(false);
  isMediaTypeMenuOpen = signal(false);

  // ==== files list + filters ====
  searchTerm = signal('');

categoryOptions: FileTypeOption[] = [
  { value: 'all', label: 'All categories' },
  { value: 'raw', label: 'Raw' },
  { value: 'edited', label: 'Edited' },
  { value: 'album', label: 'Album' },
  { value: 'final', label: 'Final' },
  { value: 'other', label: 'Other' }
];

  selectedCategory = signal('all');
  isCategoryMenuOpen = signal(false);

  files = signal<StorageFile[]>([
    {
      id: 'f1',
      name: 'WhatsApp Image 2026-07-17 at 17.46.17.jpeg',
      customer: 'Soumik & Shrya',
      bookingId: 'DRVSTU-BKG-000014',
      sizeLabel: '109.4 KB',
      badge: 'Album',
      action: 'download',
    },
    {
      id: 'f2',
      name: 'WhatsApp Image 2025-12-05 at 10.22.36 AM (2) - Copy.jpeg',
      customer: 'Swagatam & Swagata',
      bookingId: 'DRVSTU-BKG-000010',
      sizeLabel: '83.6 KB',
      badge: 'Deep Archive',
      action: 'restore',
    },
  ]);

  filteredFiles = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const category = this.selectedCategory();

    return this.files().filter((f) => {
      const matchesTerm =
        !term ||
        f.name.toLowerCase().includes(term) ||
        f.customer.toLowerCase().includes(term) ||
        f.bookingId.toLowerCase().includes(term);

      const matchesCategory =
        category === 'all' || f.badge.toLowerCase().replace(/\s+/g, '_') === category;

      return matchesTerm && matchesCategory;
    });
  });

  // ==== dropdown toggles ====
  toggleBookingMenu() {
    this.isBookingMenuOpen.set(!this.isBookingMenuOpen());
    this.isRawTypeMenuOpen.set(false);
    this.isMediaTypeMenuOpen.set(false);
    this.isCategoryMenuOpen.set(false);
  }

  toggleRawTypeMenu() {
    this.isRawTypeMenuOpen.set(!this.isRawTypeMenuOpen());
    this.isBookingMenuOpen.set(false);
    this.isMediaTypeMenuOpen.set(false);
    this.isCategoryMenuOpen.set(false);
  }

  toggleMediaTypeMenu() {
    this.isMediaTypeMenuOpen.set(!this.isMediaTypeMenuOpen());
    this.isBookingMenuOpen.set(false);
    this.isRawTypeMenuOpen.set(false);
    this.isCategoryMenuOpen.set(false);
  }

  toggleCategoryMenu() {
    this.isCategoryMenuOpen.set(!this.isCategoryMenuOpen());
    this.isBookingMenuOpen.set(false);
    this.isRawTypeMenuOpen.set(false);
    this.isMediaTypeMenuOpen.set(false);
  }

  selectBooking(id: string) {
    this.selectedBookingId.set(id);
    this.isBookingMenuOpen.set(false);
  }

  selectRawType(value: string) {
    this.selectedRawType.set(value);
    this.isRawTypeMenuOpen.set(false);
  }

  selectMediaType(value: string) {
    this.selectedMediaType.set(value);
    this.isMediaTypeMenuOpen.set(false);
  }

  selectCategory(value: string) {
    this.selectedCategory.set(value);
    this.isCategoryMenuOpen.set(false);
  }

  get bookingLabel(): string {
    return (
      this.bookingOptions().find((b) => b.id === this.selectedBookingId())?.label ??
      'Select booking'
    );
  }

  get rawTypeLabel(): string {
    return this.rawTypeOptions.find((o) => o.value === this.selectedRawType())?.label ?? 'Raw';
  }

  get mediaTypeLabel(): string {
    return (
      this.mediaTypeOptions.find((o) => o.value === this.selectedMediaType())?.label ?? 'Photo'
    );
  }

  get categoryLabel(): string {
    return (
      this.categoryOptions.find((o) => o.value === this.selectedCategory())?.label ??
      'All categories'
    );
  }

  onChooseFile(input: HTMLInputElement) {
    input.click();
  }

  onFileSelected(event: Event) {
    // TODO: wire up actual upload flow once booking/type selection + backend endpoint are confirmed
    const input = event.target as HTMLInputElement;
    console.log('Files chosen:', input.files);
  }

  onDownload(file: StorageFile) {
    // TODO: wire up actual download
    console.log('Download', file.id);
  }

  onRestore(file: StorageFile) {
    // TODO: wire up actual restore-from-archive flow
    console.log('Restore', file.id);
  }
}
