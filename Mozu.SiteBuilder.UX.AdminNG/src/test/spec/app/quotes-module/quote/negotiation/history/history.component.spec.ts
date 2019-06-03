import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QuoteNegotiationHistoryComponent } from 'app/quotes-module/quote/negotiation/history/history.component';

describe('QuoteNegotiationHistoryComponent', () => {
  let component: QuoteNegotiationHistoryComponent;
  let fixture: ComponentFixture<QuoteNegotiationHistoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QuoteNegotiationHistoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuoteNegotiationHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
