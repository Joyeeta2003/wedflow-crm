import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignCrewModal } from './assign-crew-modal';

describe('AssignCrewModal', () => {
  let component: AssignCrewModal;
  let fixture: ComponentFixture<AssignCrewModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssignCrewModal],
    }).compileComponents();

    fixture = TestBed.createComponent(AssignCrewModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
