import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WorkAssignmentModal } from './work-assignment-modal';

describe('WorkAssignmentModal', () => {
  let component: WorkAssignmentModal;
  let fixture: ComponentFixture<WorkAssignmentModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkAssignmentModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkAssignmentModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
