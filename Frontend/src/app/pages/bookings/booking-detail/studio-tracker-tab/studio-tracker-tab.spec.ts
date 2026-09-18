import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudioTrackerTab } from './studio-tracker-tab';

describe('StudioTrackerTab', () => {
  let component: StudioTrackerTab;
  let fixture: ComponentFixture<StudioTrackerTab>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudioTrackerTab],
    }).compileComponents();

    fixture = TestBed.createComponent(StudioTrackerTab);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
