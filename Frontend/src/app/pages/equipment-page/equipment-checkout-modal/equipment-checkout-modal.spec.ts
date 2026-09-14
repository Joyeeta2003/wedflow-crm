import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EquipmentCheckoutModal } from './equipment-checkout-modal';

describe('EquipmentCheckoutModal', () => {
  let component: EquipmentCheckoutModal;
  let fixture: ComponentFixture<EquipmentCheckoutModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EquipmentCheckoutModal],
    }).compileComponents();

    fixture = TestBed.createComponent(EquipmentCheckoutModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
