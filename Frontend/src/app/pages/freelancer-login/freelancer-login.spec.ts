import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FreelancerLogin } from './freelancer-login';

describe('FreelancerLogin', () => {
  let component: FreelancerLogin;
  let fixture: ComponentFixture<FreelancerLogin>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FreelancerLogin],
    }).compileComponents();

    fixture = TestBed.createComponent(FreelancerLogin);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
