import { async, 
  ComponentFixture, 
  TestBed } from '@angular/core/testing';
import { DebugElement, 
  NO_ERRORS_SCHEMA }    from '@angular/core';
import { HttpClientModule, 
  HttpClient, 
  HttpHandler } from '@angular/common/http';
import { HttpTestingController, 
  HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterModule } from '@angular/router';
import { CustomNGXLoggerService, 
  NGXLoggerHttpService } from 'ngx-logger';
import { LoggerService } from '@core';
import { UtilityService, 
  EnvironmentConfig } from '@core/infrastructure/utility.service';
import { HttpClientService, 
  httpClientServiceCreator } from '@core/extensions/http-client.service';
import { AuthService } from '@core/extensions/auth.service';
import { GlobalModule } from "@global/global.module";
import { QuoteComponent } from 'app/quotes-module/quote/quote.component';

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
      "id": "0dd322d1429fe45778112b5b00004c44",
      "name": "TestQuote1",
      "siteId": 24299,
      "tenantId": 19524,
      "status": "Cancelled",
      "submittedDate": "2019-05-9T12:00:40.914Z",
      "number": 2,
      "items": [],
      "auditInfo": {
        "updateDate": "2019-05-08T12:00:40.914Z",
        "createDate": "2019-05-08T12:00:40.914Z",
        "updateBy": "Sam",
        "createBy": "Sam"
      },
      "expirationDate": "2019-05-18T12:00:40.914Z",
      "userId": "4588be576b7f4416a70b6d810219680e",
      "destinations": [],
      "customerAccountId": 1033,
      "isTaxExempt": false,
      "currencyCode": "USD",
      "customerInteractionType": "Unknown",
      "orderDiscounts": [],
      "subTotal": 5,
      "itemLevelProductDiscountTotal": 0,
      "orderLevelProductDiscountTotal": 0,
      "itemTaxTotal": 0,
      "itemTotal": 5,
      "total": 5,
      "shippingDiscounts": [],
      "itemLevelShippingDiscountTotal": 0,
      "orderLevelShippingDiscountTotal": 0,
      "shippingAmount": 0,
      "shippingSubTotal": 0,
      "shippingTax": 0,
      "shippingTaxTotal": 0,
      "shippingTotal": 0,
      "handlingDiscounts": [],
      "itemLevelHandlingDiscountTotal": 0,
      "orderLevelHandlingDiscountTotal": 0,
      "handlingSubTotal": 0,
      "handlingTax": 0,
      "handlingTaxTotal": 0,
      "handlingTotal": 0,
      "dutyTotal": 0,
      "feeTotal": 0
    }]
  };

   beforeEach(async(() => {
     
    TestBed.configureTestingModule({
      imports: [HttpClientModule,
        HttpClientTestingModule, 
        GlobalModule, 
        RouterModule.forRoot([]) ],
      declarations: [ QuoteComponent ],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [LoggerService,
        NGXLoggerHttpService, 
        CustomNGXLoggerService, 
        UtilityService, 
        EnvironmentConfig, 
        AuthService,
        {
          provide: HttpClientService,
          useFactory: httpClientServiceCreator,
          deps: [HttpClient, 
            UtilityService, 
            AuthService]
      }
    ]})
    .compileComponents();

    loggerService = TestBed.get(LoggerService);
    loggerServiceSpy = spyOn(loggerService, 'info').and.callThrough();
  }));

  beforeEach(async(() => {
    
    var respData = {
      items: {
        "ctTaContext": {
          "masterCatalogs": [{
            "sites": [{
              "id": "1234"
            }]
          }]
        }
      }};

    httpMock = TestBed.get(HttpTestingController);
    const req = httpMock.expectOne(`./assets/json/user-data.json`);
    expect(req.request.method).toBe("GET");
    req.flush(respData);
    httpMock.verify();

    fixture = TestBed.createComponent(QuoteComponent);
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
    component.quoteId = "0dd322d1429fe45778112b5b00004c44";
    component.populateQuote(component.quoteId);
    const req = httpMock.expectOne(`/assets/json/quote-list.json`);
    expect(req.request.method).toBe("GET");
    req.flush(dummyQuoteList);
    httpMock.verify();
    
    expect(loggerServiceSpy).toHaveBeenCalledWith("QuoteComponent : _quotesListService.fetchAllQuotes_quotesResponse");
  });

  it('should call service to get failure response from mock http json (quote-list)', () => {
    component.quoteId = "0dd322d1429fe45778112b5b00004c44";
    fixture.detectChanges();
    const req = httpMock.expectOne(`/assets/json/quote-list.json`);
    expect(req.request.method).toBe("GET");
    req.flush(dummyQuoteList, mockErrorResponse);
    httpMock.verify();
    fixture.detectChanges();
    expect(loggerServiceSpy).toHaveBeenCalledWith("QuoteComponent : _quotesListService.fetchAllQuotes_errResponse");
  });
});

