import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Auth } from '../../../services/auth';

@Component({
  selector: 'app-studio-branding',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './studio-branding.html',
  styleUrl: './studio-branding.scss',
})
export class StudioBranding {
  @Input() logoUrl: string | null = null;

  @Output() back = new EventEmitter<void>();
  @Output() save = new EventEmitter<string | null>();

  logoPreviewUrl: string | null = null;
  isSaving = false;
  errorMessage = '';

  private auth = inject(Auth);

  ngOnInit(): void {
    this.logoPreviewUrl = this.logoUrl;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.match(/image\/(jpeg|jpg|png|gif|webp)/)) {
      this.errorMessage = 'Please select a valid image file (JPEG, PNG, GIF, or WebP)';
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      this.errorMessage = 'File size must be less than 2MB';
      return;
    }

    this.errorMessage = '';

    const reader = new FileReader();
    reader.onload = () => {
      this.logoPreviewUrl = reader.result as string;
    };
    reader.readAsDataURL(file);

    input.value = '';
  }

  onRemoveLogo(): void {
    this.logoPreviewUrl = null;
    this.errorMessage = '';
  }

  onBack(): void {
    this.back.emit();
  }

  async onSaveAndBack(): Promise<void> {
    this.isSaving = true;
    this.errorMessage = '';

    try {
      // For now, we'll just emit the URL as a data URL
      // In a real implementation, you would upload the file to a server
      // and get back a URL to store in the database
      this.save.emit(this.logoPreviewUrl);
    } catch (error) {
      console.error('Error saving logo:', error);
      this.errorMessage = 'Failed to save logo. Please try again.';
      this.isSaving = false;
    }
  }
}