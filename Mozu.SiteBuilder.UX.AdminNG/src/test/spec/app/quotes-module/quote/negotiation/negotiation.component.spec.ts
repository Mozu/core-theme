import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { QuoteNegotiationComponent } from 'app/quotes-module/quote/negotiation/negotiation.component';
import { TranslateModule } from '@ngx-translate/core';
import { TabViewModule } from 'primeng/tabview';
import { QuoteNegotiationCommentsComponent } from 'app/quotes-module/quote/negotiation';
import { AuditLogComponent } from '@shared/audit-log/audit-log.component';
import { TableModule } from 'primeng/table';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { HttpClientService, httpClientServiceCreator, UtilityService, AuthService, LoggerService, EnvironmentConfig } from '@core';
import { CustomNGXLoggerService, NGXLoggerHttpService } from 'ngx-logger';
describe('QuoteNegotiationComponent', () => {
  let component: QuoteNegotiationComponent;
  let fixture: ComponentFixture<QuoteNegotiationComponent>;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule, TranslateModule.forRoot(), TabViewModule, TableModule],
      declarations: [QuoteNegotiationComponent, QuoteNegotiationCommentsComponent, AuditLogComponent],
      providers: [
        UtilityService,
        EnvironmentConfig,
        LoggerService,
        CustomNGXLoggerService,
        NGXLoggerHttpService,
        AuthService,
        {
          provide: HttpClientService,
          useFactory: httpClientServiceCreator,
          deps: [HttpClient,
            UtilityService,
            AuthService]
        },]
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