import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QuoteNegotiationComponent } from 'app/quotes-module/quote/negotiation/negotiation.component';

describe('QuoteNegotiationComponent', () => {
  let component: QuoteNegotiationComponent;
  let fixture: ComponentFixture<QuoteNegotiationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QuoteNegotiationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuoteNegotiationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
