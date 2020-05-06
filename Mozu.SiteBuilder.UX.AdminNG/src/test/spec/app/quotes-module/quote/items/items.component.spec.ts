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
import { TableModule } from 'primeng/components/table/table';

describe('QuoteItemsComponent', () => {
  let component: QuoteItemsComponent;
  let fixture: ComponentFixture<QuoteItemsComponent>;
  let element;
  let loggerService: LoggerService;
  let loggerServiceSpy: any;
  let confirmationDialogService: ConfirmationDialogService;
  let confirmationDialogServiceSpy: any;
  let notificationService: NotificationService;
  let httpMock: HttpTestingController;
  const mockErrorResponse = { status: 400, statusText: 'Bad Request' };

  let dummyQuoteList = {
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
  };

  let dummyQuoteArray = [
    {
      'id': '185bdb4fd2a744bda227aa4700736f2c',
      'destinationId': '74214a287fea408cb6f2aa4600a6e3d3',
      'fulfillmentLocationCode': '1',
      'fulfillmentMethod': 'Ship',
      'lineId': 1,
      'product': {
        'fulfillmentTypesSupported': [
          'DirectShip'
        ],
        'options': [],
        'properties': [],
        'categories': [],
        'price': {
          'price': 5
        },
        'discountsRestricted': false,
        'isTaxable': true,
        'productType': 'Product Type',
        'productUsage': 'S',
        'bundledProducts': [],
        'productCode': 'test-1001',
        'name': 'Test Product 1',
        'goodsType': 'Green',
        'isPackagedStandAlone': false,
        'measurements': {},
        'fulfillmentStatus': 'Pending'
      },
      'quantity': 1,
      'subtotal': 5,
      'extendedTotal': 5,
      'taxableTotal': 5,
      'discountTotal': 0,
      'discountedTotal': 5,
      'itemTaxTotal': 0,
      'shippingTaxTotal': 0,
      'shippingTotal': 0,
      'feeTotal': 0,
      'total': 5,
      'unitPrice': {},
      'productDiscounts': [],
      'shippingDiscounts': [],
      'auditInfo': {
        'createDate': '2019-05-08T12:00:40.914Z',
        'updateBy': '1',
        'createBy': '1'
      }
    }];

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(),
        HttpClientTestingModule,
        GlobalModule,
        TableModule,
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
    confirmationDialogService = TestBed.get(ConfirmationDialogService);
    httpMock = TestBed.get(HttpTestingController);
  }));

  beforeEach(() => {
    let respData = {
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

    fixture = TestBed.createComponent(QuoteItemsComponent);
    component = fixture.componentInstance;
    element = fixture.nativeElement;
  });


  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch quoteItems from ngOnChange()',  () => {
    component.quote = dummyQuoteArray;
    component.ngOnChanges({
      quote: new SimpleChange(null, component.quote, true)
    });
    component.quoteItems = component.quote;
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      expect(component.quoteItems.length).toBe(1);
    });
   });

  // it('should call notification subject from ngOnInit()',  () => {
  //   component.ngOnInit();
  //let action = "";
  //notificationService.ConfirmationActionFromDialog.subscribe()
  // });

  it('should call openQuoteDeleteConfirmationDialog on clicking of cross icon to delete quoted item', async(() => {
    component.quoteItems = dummyQuoteArray;
    const spy = spyOn(component, 'openQuoteDeleteConfirmationDialog');
    component.itemId = '';
    component.quoteItemTobeDeleted = '';
    fixture.detectChanges();
    const cell = fixture.debugElement.query(By.css('button#deleteQuoteItem'));
    //cell.triggerEventHandler('click', {'id': component.itemId, 'row': component.quoteItemTobeDeleted})
    cell.nativeElement.click();

    fixture.detectChanges();
    fixture.whenStable().then(() => {
      expect(spy).toHaveBeenCalledWith(component.itemId, component.quoteItemTobeDeleted);
    });
  }));

  it('should call service to get success response from mock http json (quote-list)', () => {
    component.quoteId = '0dd322d1429fe45778112b5b00004c44';
    component.deleteQuoteItem();
    const req = httpMock.expectOne(`/assets/json/quote-list.json`);
    expect(req.request.method).toBe('GET');
    req.flush(dummyQuoteList);
    httpMock.verify();
    fixture.detectChanges();
    expect(loggerServiceSpy).toHaveBeenCalledWith('QuoteItemsComponent : _quoteItemsService.deleteItem_quotesResponse');
  });

  it('should call service to get failure response from mock http json (quote-list)', () => {
    component.quoteId = '0dd322d1429fe45778112b5b00004c44';
    component.deleteQuoteItem();
    const req = httpMock.expectOne(`/assets/json/quote-list.json`);
    expect(req.request.method).toBe('GET');
    req.flush(dummyQuoteList, mockErrorResponse);
    httpMock.verify();
    fixture.detectChanges();
    expect(loggerServiceSpy).toHaveBeenCalledWith('QuoteItemsComponent : _quoteItemsService.deleteItem_errResponse');
  });

});
