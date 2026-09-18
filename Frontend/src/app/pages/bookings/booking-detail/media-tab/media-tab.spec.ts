import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MediaTab } from './media-tab';

describe('MediaTab', () => {
  let component: MediaTab;
  let fixture: ComponentFixture<MediaTab>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MediaTab],
    }).compileComponents();

    fixture = TestBed.createComponent(MediaTab);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
