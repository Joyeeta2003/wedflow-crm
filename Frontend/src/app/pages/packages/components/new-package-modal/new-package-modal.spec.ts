import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewPackageModal } from './new-package-modal';

describe('NewPackageModal', () => {
  let component: NewPackageModal;
  let fixture: ComponentFixture<NewPackageModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewPackageModal],
    }).compileComponents();

    fixture = TestBed.createComponent(NewPackageModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
