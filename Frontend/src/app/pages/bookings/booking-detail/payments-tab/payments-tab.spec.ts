import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentsTab } from './payments-tab';

describe('PaymentsTab', () => {
  let component: PaymentsTab;
  let fixture: ComponentFixture<PaymentsTab>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaymentsTab],
    }).compileComponents();

    fixture = TestBed.createComponent(PaymentsTab);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
