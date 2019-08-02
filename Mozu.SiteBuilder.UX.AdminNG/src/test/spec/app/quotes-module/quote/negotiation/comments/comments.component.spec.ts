import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { QuoteNegotiationCommentsComponent } from 'app/quotes-module/quote/negotiation/comments/comments.component';
import { TranslateModule } from '@ngx-translate/core';
describe('QuoteNegotiationCommentsComponent', () => {
  let component: QuoteNegotiationCommentsComponent;
  let fixture: ComponentFixture<QuoteNegotiationCommentsComponent>;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      declarations: [QuoteNegotiationCommentsComponent]
    })
      .compileComponents();
  }));
  beforeEach(() => {
    fixture = TestBed.createComponent(QuoteNegotiationCommentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
  it('should create', () => {
    expect(component).toBeTruthy();
  });
});