import { async,
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick} from '@angular/core/testing';
import { DebugElement,
  NO_ERRORS_SCHEMA }    from '@angular/core';
import { HttpClientModule,
  HttpClient,
  HttpHandler } from '@angular/common/http';
import { HttpTestingController,
  HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterModule, ActivatedRoute, convertToParamMap } from '@angular/router';
import { CustomNGXLoggerService,
  NGXLoggerHttpService } from 'ngx-logger';
import { LoggerService } from '@core';
import { UtilityService,
  EnvironmentConfig } from '@core/infrastructure/utility.service';
import { HttpClientService,
  httpClientServiceCreator } from '@core/extensions/http-client.service';
import { AuthService } from '@core/extensions/auth.service';
import { GlobalModule } from '@global/global.module';
import { QuoteComponent } from 'app/quotes-module/quote/quote.component';
import { environment } from '@env';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NotificationService } from '@global/services';
import { Observable } from 'rxjs';

describe('QuoteComponent', () => {
  let component: QuoteComponent;
  let fixture: ComponentFixture<QuoteComponent>;
  let de: DebugElement;
  let element: HTMLElement;
  let debugElement: DebugElement;
  let loggerService: LoggerService;
  let loggerServiceSpy: any;
  let notificationService: NotificationService;
  let notificationServiceSpy: any;

  let httpMock: HttpTestingController;
  const mockErrorResponse = { status: 400, statusText: 'Bad Request' };

  const dummyQuoteList = {
    'items': [{
    'id': '4d8eab972bcb7441af46e03a000053d0',
    'quoteNumber': 101,
    'name': 'Updated Quote',
    'siteId': 24299,
    'tenantId': 19524,
    'status': 'Null',
    'number': 1,
    'items': [
      {
        'id': '9ac9cd822c6843899d81aa47012134e5',
        'fulfillmentMethod': 'Ship',
        'lineId': 1,
        'product': {
          'options': [],
          'properties': [],
          'categories': [],
          'price': {},
          'bundledProducts': [],
          'productCode': 'new-1002',
          'name': 'New Product 2!',
          'goodsType': 'Physical',
          'isPackagedStandAlone': false,
          'fulfillmentStatus': 'Pending'
        },
        'quantity': 2,
        'subtotal': 1.0,
        'extendedTotal': 0.0,
        'discountTotal': 0.0,
        'discountedTotal': 1.0,
        'feeTotal': 0.0,
        'total': 0.0,
        'productDiscounts': [],
        'shippingDiscounts': [],
        'auditInfo': {
          'createDate': '2019-05-08T12:00:29.912Z',
          'updateBy': 'UNKNOWN',
          'createBy': 'UNKNOWN'
        }
      }
    ],
    'auditInfo': {
      'updateDate': '2019-05-08T12:10:46.573Z',
      'createDate': '2019-05-08T12:00:29.912Z',
      'updateBy': 'UNKNOWN',
      'createBy': 'UNKNOWN'
    },
    'comments': [
      'This is from update!'
    ],
    'destinations': [
      {
        'id': '74214a287fea408cb6f2aa4600a6e3d3',
        'destinationContact': {
          'firstName': 'Sam',
          'lastNameOrSurname': 'Billing',
          'phoneNumbers': {
            'home': '8773503866'
          },
          'address': {
            'address1': '1845 Kramer Ln',
            'cityOrTown': 'Austin',
            'stateOrProvince': 'TX',
            'postalOrZipCode': '78758',
            'countryCode': 'US',
            'addressType': 'Residential',
            'isValidated': false
          }
        }
      }
    ],
    'userId': '4588be576b7f4416a70b6d810219680e',
    'customerAccountId': 1012,
    'isTaxExempt': false,
    'currencyCode': '',
    'customerInteractionType': 'Unknown',
    'orderDiscounts': [],
    'subTotal': 1.0,
    'itemLevelProductDiscountTotal': 0.00,
    'orderLevelProductDiscountTotal': 0.00,
    'itemTaxTotal': 0.0,
    'itemTotal': 1.00,
    'total': 1.00,
    'dutyTotal': 0.0,
    'feeTotal': 0.0,
    'accountName': 'Walmart',
    'accountUser': 'Sam',
    'submitDate': '2019-05-08T12:10:46.573Z',
    'projectName': 'Roadmap'
  }]
  }
  ;

   beforeEach(async(() => {

    TestBed.configureTestingModule({
      imports: [HttpClientModule,
        HttpClientTestingModule,
        GlobalModule,
        RouterModule.forRoot([]),
        TranslateModule.forRoot() ],
      declarations: [ QuoteComponent ],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [LoggerService,
        NGXLoggerHttpService,
        CustomNGXLoggerService,
        UtilityService,
        EnvironmentConfig,
        AuthService,
        NotificationService,
        TranslateService,
        {
          provide: HttpClientService,
          useFactory: httpClientServiceCreator,
          deps: [HttpClient,
            UtilityService,
            AuthService]
      },
      {
        provide: ActivatedRoute,
        useValue: {
          snapshot: {
            paramMap: convertToParamMap({
              quoteId: '4d8eab972bcb7441af46e03a000053d0'
            })
          }
        }
      }
    ]})
    .compileComponents();

    loggerService = TestBed.get(LoggerService);
    loggerServiceSpy = spyOn(loggerService, 'info').and.callThrough();
    notificationService = TestBed.get(NotificationService);
  }));

  beforeEach(async(() => {
    const respData = {
      items: {
        'ctTaContext': {
          'masterCatalogs': [{
            'sites': [{
              'id': '1234'
            }]
          }]
        }
      }};

    httpMock = TestBed.get(HttpTestingController);
    const req = httpMock.expectOne(`./assets/json/user-data.json`);
    expect(req.request.method).toBe('GET');
    req.flush(respData);
    httpMock.verify();

    fixture = TestBed.createComponent(QuoteComponent);
    component = fixture.debugElement.componentInstance;
   }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call ngOnInit()', function () {
    fixture.detectChanges();
    expect(loggerServiceSpy).toHaveBeenCalledWith('QuoteComponent : ngOnInit');
  });

  it('should call populateQuote()', function () {
    fixture.detectChanges();
    expect(loggerServiceSpy).toHaveBeenCalledWith('QuoteComponent : populateQuote');
  });

  it('should handle quote header value notification on populateQuote()', fakeAsync(() => {
    notificationServiceSpy = spyOn(notificationService, 'notifyQuoteHeaderValuesReceived').and.callThrough();
    fixture.detectChanges();
    const req = httpMock.expectOne(environment.appUrl + `/assets/json/quote-list.json`);
    expect(req.request.method).toBe('GET');
    req.flush(dummyQuoteList);
    httpMock.verify();

    component.model.quoteNumber = 101;
    component.model.status = 'Null';

    fixture.whenStable().then(() => {
      expect(notificationServiceSpy).toHaveBeenCalledWith(component.model.quoteNumber, component.model.status);
    });
  }));

  it('should get quote data from service', async(() => {
    fixture.detectChanges();
    const req = httpMock.expectOne(environment.appUrl + `/assets/json/quote-list.json`);
    expect(req.request.method).toBe('GET');
    req.flush(dummyQuoteList);
    httpMock.verify();

    fixture.detectChanges();
    component.populateQuote(component.quoteId);
    fixture.whenStable().then(() => {
      expect(component.model.userId).toBe('4588be576b7f4416a70b6d810219680e');
    });
  }));

  it('should call service to get success response from mock http json (quote-list)', () => {
    fixture.detectChanges();
    const req = httpMock.expectOne(environment.appUrl + `/assets/json/quote-list.json`);
    expect(req.request.method).toBe('GET');
    req.flush(dummyQuoteList);
    httpMock.verify();
    fixture.detectChanges();
    expect(loggerServiceSpy).toHaveBeenCalledWith('QuoteComponent : _quoteService.fetchAllQuotes_quotesResponse');
  });

  it('should call service to get failure response from mock http json (quote-list)', () => {
    fixture.detectChanges();
    const req = httpMock.expectOne(environment.appUrl + `/assets/json/quote-list.json`);
    expect(req.request.method).toBe('GET');
    req.flush(dummyQuoteList, mockErrorResponse);
    httpMock.verify();
    expect(loggerServiceSpy).toHaveBeenCalledWith('QuoteComponent : _quoteService.fetchAllQuotes_errResponse');
  });
});

