import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AutomationRules } from './automation-rules';

describe('AutomationRules', () => {
  let component: AutomationRules;
  let fixture: ComponentFixture<AutomationRules>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AutomationRules],
    }).compileComponents();

    fixture = TestBed.createComponent(AutomationRules);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
