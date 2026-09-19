import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudioBranding } from './studio-branding';

describe('StudioBranding', () => {
  let component: StudioBranding;
  let fixture: ComponentFixture<StudioBranding>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudioBranding],
    }).compileComponents();

    fixture = TestBed.createComponent(StudioBranding);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
