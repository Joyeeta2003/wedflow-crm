import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeliveriesTab } from './deliveries-tab';

describe('DeliveriesTab', () => {
  let component: DeliveriesTab;
  let fixture: ComponentFixture<DeliveriesTab>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeliveriesTab],
    }).compileComponents();

    fixture = TestBed.createComponent(DeliveriesTab);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
