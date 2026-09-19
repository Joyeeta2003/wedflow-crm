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

  ngOnInit(): void {
    this.daysValue = this.crewAssignmentDays;
  }

  onBack(): void {
    this.back.emit();
  }

  onSaveAndBack(): void {
    this.isSaving = true;

    // TODO: real API call once automation-rules endpoint confirmed — mock success for now
    setTimeout(() => {
      this.isSaving = false;
      this.save.emit(this.daysValue);
    }, 500);
  }
}