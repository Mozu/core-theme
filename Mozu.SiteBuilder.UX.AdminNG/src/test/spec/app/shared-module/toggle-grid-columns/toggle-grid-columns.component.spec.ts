import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ToggleGridColumnsComponent } from '@shared/toggle-grid-columns/toggle-grid-columns.component';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { TranslateModule } from '@ngx-translate/core';
describe('ToggleGridColumnsComponent', () => {
  let component: ToggleGridColumnsComponent;
  let fixture: ComponentFixture<ToggleGridColumnsComponent>;
  class DummyCol {
    header: string;
    checked: Boolean;
  }
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        OverlayPanelModule,
        TranslateModule.forRoot()
      ],
      declarations: [ToggleGridColumnsComponent]
    })
      .compileComponents();
  }));
  beforeEach(() => {
    fixture = TestBed.createComponent(ToggleGridColumnsComponent);
    component = fixture.componentInstance;
    component.gridColumnHeader = [{ header: 'Name', checked: false } as DummyCol];
  });
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should add new column to toggleGridColumns if passed column not exist already', () => {
    const col: DummyCol = { header: 'AccountUser', checked: false };
    const event = { currentTarget: {} };
    const spy = spyOn(component.toggledGridColumn, 'emit');
    fixture.detectChanges();
    component.toggleGridColumns(event, col);
    expect(spy).toHaveBeenCalledWith(component.gridColumnHeader);
    expect(component.gridColumnHeader[1]).toBe(col);
  });
  it('should toggle grid column and update the column if passed column exist already', () => {
    const col: DummyCol = { header: 'Name', checked: false };
    const event = { currentTarget: { checked: true } };
    const spy = spyOn(component.toggledGridColumn, 'emit');
    fixture.detectChanges();
    component.toggleGridColumns(event, col);
    expect(spy).toHaveBeenCalledWith(component.gridColumnHeader);
    expect(component.gridColumnHeader[0].checked).toBe(event.currentTarget.checked);
  });
});