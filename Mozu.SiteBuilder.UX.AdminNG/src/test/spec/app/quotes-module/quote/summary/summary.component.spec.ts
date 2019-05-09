import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QuoteSummaryComponent } from 'app/quotes-module/quote/summary/summary.component';

describe('QuoteSummaryComponent', () => {
  let component: QuoteSummaryComponent;
  let fixture: ComponentFixture<QuoteSummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QuoteSummaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuoteSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
