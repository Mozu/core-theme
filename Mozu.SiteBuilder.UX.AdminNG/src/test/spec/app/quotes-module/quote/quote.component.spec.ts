import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By }              from '@angular/platform-browser';
import { DebugElement, NO_ERRORS_SCHEMA }    from '@angular/core';
import { LoggerService } from '@core';
import { CustomNGXLoggerService, NGXLoggerHttpService } from 'ngx-logger';
import { HttpClientModule, HttpClient, HttpHandler } from '@angular/common/http';
import { HttpTestingController, HttpClientTestingModule } from '@angular/common/http/testing';
import { UtilityService, EnvironmentConfig } from '@core/infrastructure/utility.service';
import { HttpClientService, httpClientServiceCreator } from '@core/extensions/http-client.service';

import { AuthService } from '@core/extensions/auth.service';
import { GlobalModule } from "@global/global.module";
import { QuoteComponent } from 'app/quotes-module/quote/quote.component';
import { QuoteItemModel } from 'app/quotes-module/quote/quote.model';
import { RouterModule } from '@angular/router';

describe('QuoteComponent', () => {
  let component: QuoteComponent;
  let fixture: ComponentFixture<QuoteComponent>;
  let de: DebugElement;
  let element: HTMLElement;
  let debugElement: DebugElement;
  let loggerService: LoggerService;
  let loggerServiceSpy: any;

  let httpMock: HttpTestingController;
  let quoteId: string;
  let userId: any;
  const mockErrorResponse = { status: 400, statusText: 'Bad Request' };

  var dummyQuoteList = {
    "items": [{
      "id": "0da178726c6b9e27784ebfec0000432a",
      "name": "Test Quote One",
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
    }]
  };

   beforeEach(async(() => {
     
    TestBed.configureTestingModule({
      imports: [HttpClientModule,HttpClientTestingModule, GlobalModule, RouterModule.forRoot([]) ],
      declarations: [ QuoteComponent ],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [LoggerService,NGXLoggerHttpService, CustomNGXLoggerService, UtilityService, EnvironmentConfig, AuthService,
        {
          provide: HttpClientService,
          useFactory: httpClientServiceCreator,
          deps: [HttpClient, UtilityService, AuthService]
      }
    ]})
    .compileComponents();

    loggerService = TestBed.get(LoggerService);
    loggerServiceSpy = spyOn(loggerService, 'info').and.callThrough();
  }));

  beforeEach(async(() => {
    fixture = TestBed.createComponent(QuoteComponent);

    httpMock = TestBed.get(HttpTestingController);
    
    component = fixture.debugElement.componentInstance;
   }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it("should call ngOnInit()", function () {
    fixture.detectChanges();
    expect(loggerServiceSpy).toHaveBeenCalledWith('QuoteComponent : ngOnInit');
  });

  it("should call populateQuote()", function () {
    fixture.detectChanges();
    expect(loggerServiceSpy).toHaveBeenCalledWith('QuoteComponent : populateQuote');
  });

  it('should call service to get success response from mock http json (quote-list)', () => {
    fixture.detectChanges();
    const req = httpMock.expectOne(`./assets/json/quote-list.json`);
    expect(req.request.method).toBe("GET");
    req.flush(dummyQuoteList);
    httpMock.verify();
    fixture.detectChanges();
    expect(loggerServiceSpy).toHaveBeenCalledWith("QuoteComponent : _quotesListService.fetchAllQuotes_quotesResponse");
  });

  it('should call service to get failure response from mock http json (quote-list)', () => {
    fixture.detectChanges();
    const req = httpMock.expectOne(`/assets/json/quote-list.json`);
    expect(req.request.method).toBe("GET");
    req.flush(dummyQuoteList, mockErrorResponse);
    httpMock.verify();
    fixture.detectChanges();
    expect(loggerServiceSpy).toHaveBeenCalledWith("QuoteComponent : _quotesListService.fetchAllQuotes_errResponse");
  });
});

