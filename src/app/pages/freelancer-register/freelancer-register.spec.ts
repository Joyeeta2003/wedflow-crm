import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FreelancerRegister } from './freelancer-register';

describe('FreelancerRegister', () => {
  let component: FreelancerRegister;
  let fixture: ComponentFixture<FreelancerRegister>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FreelancerRegister],
    }).compileComponents();

    fixture = TestBed.createComponent(FreelancerRegister);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
