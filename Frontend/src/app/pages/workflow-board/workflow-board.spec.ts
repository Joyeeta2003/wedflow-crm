import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkflowBoard } from './workflow-board';

describe('WorkflowBoard', () => {
  let component: WorkflowBoard;
  let fixture: ComponentFixture<WorkflowBoard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkflowBoard],
    }).compileComponents();

    fixture = TestBed.createComponent(WorkflowBoard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
