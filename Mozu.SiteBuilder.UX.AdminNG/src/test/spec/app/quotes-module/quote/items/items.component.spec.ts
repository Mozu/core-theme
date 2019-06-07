import { async, 
  ComponentFixture, 
  TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NO_ERRORS_SCHEMA, 
  DebugElement, 
  SimpleChange} from '@angular/core';
import { HttpClient, 
  HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule, 
  HttpTestingController } from '@angular/common/http/testing';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NGXLoggerHttpService, 
  CustomNGXLoggerService } from 'ngx-logger';
import { TranslateLoader, 
  TranslateModule, 
  TranslatePipe, 
  TranslateService } from '@ngx-translate/core';
import { LoggerService, 
  UtilityService, 
  EnvironmentConfig, 
  AuthService, 
  HttpClientService, 
  httpClientServiceCreator } from '@core';
import { GlobalModule } from '@global/global.module';
import { NotificationService } from '@global/services';
import { ConfirmationDialogService } from '@shared';
import { QuoteItemsComponent } from 'app/quotes-module/quote/items/items.component';
import { QuoteItemsService } from 'app/quotes-module/quote';

describe('QuoteItemsComponent', () => {
  let component: QuoteItemsComponent;
  let fixture: ComponentFixture<QuoteItemsComponent>;
  let element;
  let loggerService: LoggerService;
  let loggerServiceSpy: any;
  let notificationService: NotificationService;
  let httpMock: HttpTestingController;
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
      imports: [TranslateModule.forRoot(),
        HttpClientTestingModule, 
        GlobalModule,
        NgbModule.forRoot() 
      ],
      declarations: [ QuoteItemsComponent ],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [TranslateService, 
        LoggerService,
        NGXLoggerHttpService, 
        CustomNGXLoggerService, 
        UtilityService, 
        EnvironmentConfig, 
        AuthService,
        QuoteItemsService,
        ConfirmationDialogService,
        NotificationService,
        {
          provide: HttpClientService,
          useFactory: httpClientServiceCreator,
          deps: [HttpClient, 
            UtilityService, 
            AuthService]
      }]
    })
    .compileComponents();

    loggerService = TestBed.get(LoggerService);
    loggerServiceSpy = spyOn(loggerService, 'info').and.callThrough();
    httpMock = TestBed.get(HttpTestingController);
    notificationService = TestBed.get(NotificationService);
  }));

  beforeEach(() => {
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

    fixture = TestBed.createComponent(QuoteItemsComponent);
    component = fixture.componentInstance;
    element = fixture.nativeElement;
  });


  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch quoteItems from ngOnChange()',  () => {
    component.quote = dummyQuoteList;
    component.ngOnChanges({
      quote: new SimpleChange(null, component.quote, true)
    });
    component.quoteItems = component.quote;
    fixture.detectChanges(); 
    fixture.whenStable().then(() => {
      expect(component.quoteItems['items'].length).toBe(1);
    });
   });

  it('should call notification subject from ngOnInit()',  () => {
    component.ngOnInit();
  });

  //  it('should call openQuoteDeleteConfirmationDialog on click of cross icon to delete quoted item', async(() => {
  //   const spy = spyOn(component, 'openQuoteDeleteConfirmationDialog');
  //   fixture.detectChanges();

  //   component.itemId = "";
  //   component.quoteItemTobeDeleted = "";

  //   fixture.detectChanges();
  //   const cell = fixture.debugElement.query(By.css('#deleteQuoteItem'));
  //   cell.nativeElement.click();

  //   fixture.detectChanges();
  //   fixture.whenStable().then(() => {
  //     expect(spy).toHaveBeenCalled();
  //   });

  //let action = "";
  //notificationService.ConfirmationActionFromDialog.subscribe()
  // }));

  it('should call service to get success response from mock http json (quote-list)', () => {
    component.quoteId = "0dd322d1429fe45778112b5b00004c44";
    component.deleteQuoteItem();
    const req = httpMock.expectOne(`/assets/json/quote-list.json`);
    expect(req.request.method).toBe("GET");
    req.flush(dummyQuoteList);
    httpMock.verify();
    fixture.detectChanges();
    expect(loggerServiceSpy).toHaveBeenCalledWith("QuoteItemsComponent : _quoteItemsService.deleteItem_quotesResponse");
  });

  it('should call service to get failure response from mock http json (quote-list)', () => {
    component.quoteId = "0dd322d1429fe45778112b5b00004c44";
    component.deleteQuoteItem();
    const req = httpMock.expectOne(`/assets/json/quote-list.json`);
    expect(req.request.method).toBe("GET");
    req.flush(dummyQuoteList, mockErrorResponse);
    httpMock.verify();
    fixture.detectChanges();
    expect(loggerServiceSpy).toHaveBeenCalledWith("QuoteItemsComponent : _quoteItemsService.deleteItem_errResponse");
  });

});
