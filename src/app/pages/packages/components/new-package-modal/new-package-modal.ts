import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  AbstractControl, FormArray, FormBuilder, FormGroup,
  ReactiveFormsModule, Validators
} from '@angular/forms';

@Component({
  selector: 'app-new-package-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './new-package-modal.html',
  styleUrls: ['./new-package-modal.scss'],

})
export class NewPackageModal {
  @Input() isOpen = false;
  @Output() closeModal = new EventEmitter<void>();
  @Output() createPackage = new EventEmitter<any>();

  packageForm: FormGroup;

  // Note: ei option lists screenshot e pura visible chilo na,
  // tui project er real values diye replace kore nis
  editorRoleOptions = ['Photo Editor', 'Video Editor', 'Drone Editor'];
  taskTypeOptions = ['Photo Editing', 'Video Editing', 'Color Grading'];
whenDueOptions = ['At Booking', 'On Event Day', 'Days Before Event', 'Days After Event'];
 scheduleModeOptions = ['Percentage', 'Fixed amount'];
 private daysRequiredFor = ['Days Before Event', 'Days After Event'];

  constructor(private fb: FormBuilder) {
    this.packageForm = this.fb.group({
      name: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      durationDays: [1, [Validators.required, Validators.min(1)]],
      description: ['', Validators.required],
      coverageSide: ['single', Validators.required],
      crewDays: this.fb.array([this.createCrewDay(1)]),
      deliverables: ['', Validators.required],
      editorRows: this.fb.array([this.createEditorRow()]),
      scheduleMode: ['Percentage'],
      paymentRows: this.fb.array([
        this.createPaymentRow('Advance', 30, 'At Booking'),
        this.createPaymentRow('Balance', 70, 'On Event Day')
      ]),
      reminderDays: ['60,30,15,7,3,1'],
      reminderReferenceDay: [1],
      crewMailBeforeEvent: [3],
      availability: [true]
    });
  }

  // ---------- Crew Days ----------
  get crewDays(): FormArray {
    return this.packageForm.get('crewDays') as FormArray;
  }

  createCrewDay(dayNumber: number): FormGroup {
    return this.fb.group({
      day: [dayNumber],
      eventLabel: ['', Validators.required],
      roles: this.fb.array([])
    });
  }

  addCrewDay(): void {
    this.crewDays.push(this.createCrewDay(this.crewDays.length + 1));
  }

  removeCrewDay(index: number): void {
    this.crewDays.removeAt(index);
  }

  getRoles(dayGroup: AbstractControl): FormArray {
    return (dayGroup as FormGroup).get('roles') as FormArray;
  }

  createRole(): FormGroup {
    return this.fb.group({
      roleName: ['', Validators.required],
      count: [1, [Validators.required, Validators.min(1)]]
    });
  }

  addRole(dayIndex: number): void {
    this.getRoles(this.crewDays.at(dayIndex)).push(this.createRole());
  }

  removeRole(dayIndex: number, roleIndex: number): void {
    this.getRoles(this.crewDays.at(dayIndex)).removeAt(roleIndex);
  }

  // ---------- Editor Rows ----------
  get editorRows(): FormArray {
    return this.packageForm.get('editorRows') as FormArray;
  }

  createEditorRow(): FormGroup {
    return this.fb.group({
      editorRole: [this.editorRoleOptions[0], Validators.required],
      taskType: [this.taskTypeOptions[0], Validators.required],
      qty: [1, [Validators.required, Validators.min(1)]],
      days: [1, [Validators.required, Validators.min(1)]]
    });
  }

  addEditorRow(): void {
    this.editorRows.push(this.createEditorRow());
  }

  removeEditorRow(index: number): void {
    this.editorRows.removeAt(index);
  }

  // ---------- Payment Rows ----------
  get paymentRows(): FormArray {
    return this.packageForm.get('paymentRows') as FormArray;
  }

  createPaymentRow(label = '', percent = 0, whenDue = 'At Booking'): FormGroup {
    return this.fb.group({
      label: [label, Validators.required],
      percent: [percent, [Validators.required, Validators.min(0), Validators.max(100)]],
      whenDue: [whenDue, Validators.required],
      days: [0]
    });
  }

  addPaymentRow(): void {
    this.paymentRows.push(this.createPaymentRow());
  }

  removePaymentRow(index: number): void {
    this.paymentRows.removeAt(index);
  }

  get allocatedPercent(): number {
    return this.paymentRows.controls.reduce(
      (sum, row) => sum + (Number(row.get('percent')?.value) || 0), 0
    );
  }

  get remainingPercent(): number {
    return 100 - this.allocatedPercent;
  }

  // ---------- Modal actions ----------
  onCancel(): void {
    this.closeModal.emit();
  }

  onSubmit(): void {
    if (this.packageForm.invalid) {
      this.packageForm.markAllAsTouched();
      return;
    }
    this.createPackage.emit(this.packageForm.value);
  }

  // ei method-টা notun add koro
  needsDaysInput(whenDueValue: string): boolean {
    return this.daysRequiredFor.includes(whenDueValue);
  }
}