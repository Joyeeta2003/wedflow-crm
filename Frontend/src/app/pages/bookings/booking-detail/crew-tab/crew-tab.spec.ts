import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrewTab } from './crew-tab';

describe('CrewTab', () => {
  let component: CrewTab;
  let fixture: ComponentFixture<CrewTab>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrewTab],
    }).compileComponents();

    fixture = TestBed.createComponent(CrewTab);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
