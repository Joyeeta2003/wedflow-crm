import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

interface TrackerField {
  label: string;
  value: string | null;
}

@Component({
  selector: 'app-studio-tracker-tab',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './studio-tracker-tab.html',
  styleUrl: './studio-tracker-tab.scss',
})
export class StudioTrackerTab {
  @Output() editTracker = new EventEmitter<void>();

  // ASSUMPTION/UNCONFIRMED: tracker data model not yet confirmed with backend —
  // showing '-' placeholder for every field until real Booking tracker fields exist.
  // Replace `value: null` with actual booking.tracker.<field> once API confirmed.

  bookingOperationsFields: TrackerField[] = [
    { label: 'Booking Date', value: null },
    { label: 'Project / Division', value: null },
    { label: 'Event Type', value: null },
    { label: 'Client Manager', value: null },
    { label: 'Payment Method', value: null },
    { label: 'Final Payment', value: null },
    { label: 'Selection Upload', value: null },
    { label: 'Review', value: null },
  ];

  albumPhotoTimelineFields: TrackerField[] = [
    { label: 'Album Type', value: null },
    { label: 'Album Status', value: null },
    { label: 'Page Quality', value: null },
    { label: 'Editor', value: null },
    { label: 'Photo Selection', value: null },
    { label: 'Handover', value: null },
    { label: '1st Review', value: null },
    { label: '1st Change', value: null },
    { label: '2nd Review', value: null },
    { label: '2nd Change', value: null },
    { label: 'Final Preview', value: null },
    { label: 'Confirmation', value: null },
    { label: 'Printing', value: null },
    { label: 'Delivery', value: null },
  ];

  videoReelsSocialTimelineFields: TrackerField[] = [
    { label: 'Video Status', value: null },
    { label: 'Song Selection', value: null },
    { label: 'Reels Editor', value: null },
    { label: 'Reels Sent', value: null },
    { label: 'Trailer Editor', value: null },
    { label: 'Trailer Preview', value: null },
    { label: 'Trailer Confirmation', value: null },
    { label: 'Video Handover', value: null },
    { label: 'Video Editor', value: null },
    { label: 'Sent For Review', value: null },
    { label: '1st Change', value: null },
    { label: '2nd Review', value: null },
    { label: '2nd Change', value: null },
    { label: 'Confirmation', value: null },
    { label: 'Delivery', value: null },
    { label: 'Meta', value: null },
    { label: 'YouTube', value: null },
  ];

  trackBySection = (_: number, field: TrackerField): string => field.label;

  onEditTracker(): void {
    this.editTracker.emit();
  }
}