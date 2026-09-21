import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-automation-rules',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './automation-rules.html',
  styleUrl: './automation-rules.scss',
})
export class AutomationRules {
  @Input() crewAssignmentDays = 10;

  @Output() back = new EventEmitter<void>();
  @Output() save = new EventEmitter<number>();

  daysValue = 10;
  isSaving = false;
  errorMessage = '';

  ngOnInit(): void {
    this.daysValue = this.crewAssignmentDays;
  }

  onBack(): void {
    this.back.emit();
  }

  onSaveAndBack(): void {
    if (this.daysValue < 1 || this.daysValue > 365) {
      this.errorMessage = 'Days must be between 1 and 365';
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';

    // Emit the value and let parent handle the API call and navigation
    this.save.emit(this.daysValue);
  }

  onDaysChange(): void {
    this.errorMessage = '';
  }
}