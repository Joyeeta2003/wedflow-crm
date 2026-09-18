import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookingDetailsModal } from './booking-details-modal';

describe('BookingDetailsModal', () => {
  let component: BookingDetailsModal;
  let fixture: ComponentFixture<BookingDetailsModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookingDetailsModal],
    }).compileComponents();

    fixture = TestBed.createComponent(BookingDetailsModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
