import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RemindersTab } from './reminders-tab';

describe('RemindersTab', () => {
  let component: RemindersTab;
  let fixture: ComponentFixture<RemindersTab>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RemindersTab],
    }).compileComponents();

    fixture = TestBed.createComponent(RemindersTab);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
