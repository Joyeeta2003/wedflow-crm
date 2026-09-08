import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EnquiryModal } from './enquiry-modal';

describe('EnquiryModal', () => {
  let component: EnquiryModal;
  let fixture: ComponentFixture<EnquiryModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EnquiryModal],
    }).compileComponents();

    fixture = TestBed.createComponent(EnquiryModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
