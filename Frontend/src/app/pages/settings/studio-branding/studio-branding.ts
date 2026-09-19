import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

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

  ngOnInit(): void {
    this.logoPreviewUrl = this.logoUrl;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      this.logoPreviewUrl = reader.result as string;
    };
    reader.readAsDataURL(file);

    input.value = '';
  }

  onRemoveLogo(): void {
    this.logoPreviewUrl = null;
  }

  onBack(): void {
    this.back.emit();
  }

  onSaveAndBack(): void {
    this.isSaving = true;

    // TODO: real API call once logo-upload endpoint confirmed — mock success for now
    setTimeout(() => {
      this.isSaving = false;
      this.save.emit(this.logoPreviewUrl);
    }, 500);
  }
}