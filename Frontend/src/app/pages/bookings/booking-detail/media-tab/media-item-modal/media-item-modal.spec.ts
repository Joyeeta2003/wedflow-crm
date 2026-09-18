import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MediaItemModal } from './media-item-modal';

describe('MediaItemModal', () => {
  let component: MediaItemModal;
  let fixture: ComponentFixture<MediaItemModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MediaItemModal],
    }).compileComponents();

    fixture = TestBed.createComponent(MediaItemModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
