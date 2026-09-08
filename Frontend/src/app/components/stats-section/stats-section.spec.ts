import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatsSection } from './stats-section';

describe('StatsSection', () => {
  let component: StatsSection;
  let fixture: ComponentFixture<StatsSection>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatsSection],
    }).compileComponents();

    fixture = TestBed.createComponent(StatsSection);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
