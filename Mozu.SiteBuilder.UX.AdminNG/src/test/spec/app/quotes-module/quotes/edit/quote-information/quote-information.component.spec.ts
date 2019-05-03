import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QuoteInformationComponent } from 'app/quotes-module/quotes/edit/quote-information/quote-information.component';

describe('QuoteInformationComponent', () => {
  let component: QuoteInformationComponent;
  let fixture: ComponentFixture<QuoteInformationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QuoteInformationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuoteInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
