import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QuotesEditComponent } from './edit.component';

describe('ViewComponent', () => {
  let component: QuotesEditComponent;
  let fixture: ComponentFixture<QuotesEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QuotesEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuotesEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
