import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventDayModal } from './event-day-modal';

describe('EventDayModal', () => {
  let component: EventDayModal;
  let fixture: ComponentFixture<EventDayModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventDayModal],
    }).compileComponents();

    fixture = TestBed.createComponent(EventDayModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
