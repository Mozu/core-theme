import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, DebugElement, SimpleChange } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { NGXLoggerHttpService, CustomNGXLoggerService } from 'ngx-logger';
import { TranslateLoader, TranslateModule, TranslatePipe, TranslateService } from '@ngx-translate/core';
import { LoggerService, UtilityService, EnvironmentConfig, AuthService, HttpClientService, httpClientServiceCreator } from '@core';
import { GlobalModule } from '@global/global.module';
import { QuoteSummaryComponent } from 'app/quotes-module/quote/summary/summary.component';

describe('QuoteSummaryComponent', () => {
  let component: QuoteSummaryComponent;
  let fixture: ComponentFixture<QuoteSummaryComponent>;
  let element;
  let loggerService: LoggerService;
  let loggerServiceSpy: any;
  let dummyQuote = {
    "id": "0da178726c6b9e27784ebfec0000432a",
    "name": "TestQuote1",
    "siteId": 21127,
    "tenantId": 17194,
    "number": 1,
    "items": [],
    "auditInfo": {
     "updateDate": "2019-03-31T19:52:25.091Z",
     "createDate": "2019-03-31T19:52:25.091Z",
     "updateBy": "1",
     "createBy": "1"
    },
    "destinations": [],
    "isTaxExempt": false,
    "currencyCode": "USD",
    "customerInteractionType": "Unknown",
    "orderDiscounts": [],
    "subTotal": 0,
    "itemLevelProductDiscountTotal": 0,
    "orderLevelProductDiscountTotal": 0,
    "itemTaxTotal": 0,
    "itemTotal": 0,
    "total": 0,
    "shippingDiscounts": [],
    "itemLevelShippingDiscountTotal": 0,
    "orderLevelShippingDiscountTotal": 0,
    "shippingAmount": 0,
    "shippingSubTotal": 0,
    "shippingTaxTotal": 0,
    "shippingTotal": 0,
    "handlingDiscounts": [],
    "itemLevelHandlingDiscountTotal": 0,
    "orderLevelHandlingDiscountTotal": 0,
    "handlingSubTotal": 0,
    "handlingTaxTotal": 0,
    "handlingTotal": 0,
    "dutyTotal": 0,
    "feeTotal": 0
   };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), HttpClientTestingModule, GlobalModule ],
      declarations: [ QuoteSummaryComponent ],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [TranslateService, LoggerService,NGXLoggerHttpService, CustomNGXLoggerService, UtilityService, EnvironmentConfig, AuthService,
        {
          provide: HttpClientService,
          useFactory: httpClientServiceCreator,
          deps: [HttpClient, UtilityService, AuthService]
      }]
    })
    .compileComponents();

    loggerService = TestBed.get(LoggerService);
    loggerServiceSpy = spyOn(loggerService, 'info').and.callThrough();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuoteSummaryComponent);
    component = fixture.componentInstance;
    element = fixture.nativeElement;    
    component.quote = dummyQuote;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render quote from ngOnChange()', () => {
    component.quote = dummyQuote;
    fixture.detectChanges(); 
    component.ngOnChanges({
      quote: new SimpleChange(null, component.quote, true)
    });
    
    expect(loggerServiceSpy).toHaveBeenCalledWith("QuoteSummaryComponent : ngOnChanges");
  });
});
