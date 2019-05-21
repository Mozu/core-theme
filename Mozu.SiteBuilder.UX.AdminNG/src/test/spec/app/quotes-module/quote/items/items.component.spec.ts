import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QuoteItemsComponent } from 'app/quotes-module/quote/items/items.component';

describe('QuoteItemsComponent', () => {
  let component: QuoteItemsComponent;
  let fixture: ComponentFixture<QuoteItemsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QuoteItemsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuoteItemsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
