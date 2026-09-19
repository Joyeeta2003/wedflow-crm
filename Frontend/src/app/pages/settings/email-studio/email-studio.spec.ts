import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmailStudio } from './email-studio';

describe('EmailStudio', () => {
  let component: EmailStudio;
  let fixture: ComponentFixture<EmailStudio>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmailStudio],
    }).compileComponents();

    fixture = TestBed.createComponent(EmailStudio);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
