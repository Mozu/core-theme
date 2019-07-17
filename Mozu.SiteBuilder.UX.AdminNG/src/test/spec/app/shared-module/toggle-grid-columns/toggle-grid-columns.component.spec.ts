import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ToggleGridColumnsComponent } from '@shared/toggle-grid-columns/toggle-grid-columns.component';

describe('ToggleGridColumnsComponent', () => {
  let component: ToggleGridColumnsComponent;
  let fixture: ComponentFixture<ToggleGridColumnsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ToggleGridColumnsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ToggleGridColumnsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
