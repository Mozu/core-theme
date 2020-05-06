import { async, ComponentFixture, TestBed, inject, tick, fakeAsync } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, DebugElement, ElementRef } from '@angular/core';
import { By } from '@angular/platform-browser';
import { HttpClientModule, HttpClient, HttpHandler } from '@angular/common/http';
import { HttpTestingController, HttpClientTestingModule } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { TableModule } from 'primeng/table';
import { CustomNGXLoggerService, NGXLoggerHttpService } from 'ngx-logger';
import { TranslateLoader, TranslateModule, TranslatePipe, TranslateService } from '@ngx-translate/core';
import { LoggerService, SpinnerService } from '@core';
import { UtilityService, EnvironmentConfig } from '@core/infrastructure/utility.service';
import { AuthService } from '@core/extensions/auth.service';
import { HttpClientService, httpClientServiceCreator } from '@core/extensions/http-client.service';
import { QuotesListComponent } from 'app/quotes-module/list/list.component';
import { QuotesListModel } from 'app/quotes-module/list/list.model';
import { QuotesListService } from 'app/quotes-module/list/list.service';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { NotificationService } from '@global/services';
import { environment } from '@env';
import { ToggleGridColumnsComponent, Constants } from '@shared';
import { OverlayPanel } from 'primeng/overlaypanel';
describe('QuotesListComponent', () => {
  let component: QuotesListComponent;
  let fixture: ComponentFixture<QuotesListComponent>;
  let debugElement: DebugElement;
  let loggerService: LoggerService;
  let loggerServiceSpy: any;
  let httpMock: HttpTestingController;
  const mockErrorResponse = { status: 400, statusText: 'Bad Request' };
  let element: HTMLElement;
  let notificationService: NotificationService;
  const dummyRouter = { navigate: jasmine.createSpy('navigate') };
  const dummyQuoteList = {
    'items': [{
      'id': '0da178726c6b9e27784ebfec0000432a',
      'name': 'Test Quote One',
      'siteId': 21127,
      'tenantId': 17194,
      'number': 1,
      'items': [{
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
      }],
      'auditInfo': {
        'updateDate': '2019-03-31T19:52:25.091Z',
        'createDate': '2019-03-31T19:52:25.091Z',
        'updateBy': '1',
        'createBy': '1'
      },
      'destinations': [],
      'isTaxExempt': false,
      'currencyCode': 'USD',
      'customerInteractionType': 'Unknown',
      'orderDiscounts': [],
      'subTotal': 0,
      'itemLevelProductDiscountTotal': 0,
      'orderLevelProductDiscountTotal': 0,
      'itemTaxTotal': 0,
      'itemTotal': 0,
      'total': 0,
      'shippingDiscounts': [],
      'itemLevelShippingDiscountTotal': 0,
      'orderLevelShippingDiscountTotal': 0,
      'shippingAmount': 0,
      'shippingSubTotal': 0,
      'shippingTaxTotal': 0,
      'shippingTotal': 0,
      'handlingDiscounts': [],
      'itemLevelHandlingDiscountTotal': 0,
      'orderLevelHandlingDiscountTotal': 0,
      'handlingSubTotal': 0,
      'handlingTaxTotal': 0,
      'handlingTotal': 0,
      'dutyTotal': 0,
      'feeTotal': 0
    }]
  };
  const gridColumnHeader = [
    { field: 'name', header: 'QUOTES.GridHeader.quoteName', checked: true, sortable: true },
    { field: 'accountName', header: 'QUOTES.GridHeader.accountName', checked: true, sortable: false },
    { field: 'accountUser', header: 'QUOTES.GridHeader.accountUser', checked: false, sortable: false }
  ];
  const dummyGridColumns = {
    'columnHeader':
      [{ 'field': 'accountName', 'header': 'QUOTES.GridHeader.accountName', 'checked': true, 'sortable': false },
      { 'field': 'name', 'header': 'QUOTES.GridHeader.quoteName', 'checked': true, 'sortable': true },
      { 'field': 'accountUser', 'header': 'QUOTES.GridHeader.accountUser', 'checked': false, 'sortable': false },
      { 'field': 'quoteNumber', 'header': 'QUOTES.GridHeader.quoteID', 'checked': false, 'sortable': true },
      { 'field': 'auditInfo.createDate', 'header': 'QUOTES.GridHeader.createDate', 'checked': true, 'sortable': true },
      { 'field': 'auditInfo.createBy', 'header': 'QUOTES.GridHeader.createdBy', 'checked': false, 'sortable': true },
      { 'field': 'expirationDate', 'header': 'QUOTES.GridHeader.expirationDate', 'checked': true, 'sortable': true },
      { 'field': 'status', 'header': 'QUOTES.GridHeader.status', 'checked': true, 'class': 'content-pill', 'sortable': true },
      { 'field': 'submitDate', 'header': 'QUOTES.GridHeader.submitDate', 'checked': false, 'sortable': true },
      { 'field': 'auditInfo.updateDate', 'header': 'QUOTES.GridHeader.updateDate', 'checked': false, 'sortable': true },
      { 'field': 'numberOfProducts', 'header': 'QUOTES.GridHeader.numProducts', 'checked': false, 'sortable': false },
      { 'field': 'totalQuantity', 'header': 'QUOTES.GridHeader.totalQty', 'checked': false, 'sortable': false },
      { 'field': 'shippingTaxTotal', 'header': 'QUOTES.GridHeader.estimatedCharges', 'checked': true, 'sortable': false },
      { 'field': 'total', 'header': 'QUOTES.GridHeader.orderTotal', 'checked': true, 'sortable': true },
      { 'field': 'projectName', 'header': 'QUOTES.GridHeader.projectName', 'checked': true, 'sortable': true }]
  };
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(),
        HttpClientModule,
        HttpClientTestingModule,
        TableModule],
      declarations: [QuotesListComponent,
        ToggleGridColumnsComponent,
        OverlayPanel],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [By,
        TranslateService,
        LoggerService,
        CustomNGXLoggerService,
        NGXLoggerHttpService,
        UtilityService,
        EnvironmentConfig,
        AuthService,
        SpinnerService,
        CurrencyPipe,
        DatePipe,
        NotificationService,
        QuotesListModel,
        QuotesListService,
        {
          provide: HttpClientService,
          useFactory: httpClientServiceCreator,
          deps: [HttpClient,
            UtilityService,
            AuthService]
        },
        {
          provide: Router,
          useValue: dummyRouter,
        }
      ]
    })
      .compileComponents();
    // To inject services using spyOn
    loggerService = TestBed.get(LoggerService);
    httpMock = TestBed.get(HttpTestingController);
    notificationService = TestBed.get(NotificationService);
    loggerServiceSpy = spyOn(loggerService, 'info').and.callThrough();
  }));
  beforeEach(() => {
    fixture = TestBed.createComponent(QuotesListComponent);
    component = fixture.componentInstance;
    debugElement = fixture.debugElement;
    element = debugElement.nativeElement;
  });
  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('should call ngOnInit()', function () {
    fixture.detectChanges();
    expect(loggerServiceSpy).toHaveBeenCalledWith('QuotesListComponent : ngOnInit');
  });
  it('should load gridColumnHeader with quoteGridData if quoteGridData exist in localStorage', function () {
    localStorage.setItem(Constants.localStorageKeys.quoteGridData, JSON.stringify(dummyGridColumns));
    fixture.detectChanges();
    expect(component.gridColumnHeader).toEqual(dummyGridColumns.columnHeader);
    localStorage.removeItem(Constants.localStorageKeys.quoteGridData);
  });
  it('should call OpenGridColumnOverlayPanel on ellipsis click', () => {
    const event = new MouseEvent('click');
    component.OpenGridColumnOverlayPanel(event);
    spyOn(component.toggleGridColumnsComponent, 'gridColumnToggle');
    component.toggleGridColumnsComponent.gridColumnToggle.toggle(event);
    expect(component.toggleGridColumnsComponent).toBeTruthy();
  });
  it('should handle quoteSearched notification on ngOnInit()', fakeAsync(() => {
    const spy = spyOn(component, 'populateQuoteGrid');
    const advancedSearch = 'accountName';
    notificationService.notifyQuoteSearched(advancedSearch);
    fixture.detectChanges();
    tick(1000);
    expect(advancedSearch).toEqual(advancedSearch);
  }));
  it('should call populateQuoteGrid()', function () {
    fixture.detectChanges();
    expect(loggerServiceSpy).toHaveBeenCalledWith('QuotesListComponent : populateQuoteGrid');
  });
  it('should get grid items from quote component', async(() => {
    fixture.detectChanges();
    const req = httpMock.expectOne(environment.appUrl + `/assets/json/quote-list.json`);
    expect(req.request.method).toBe('GET');
    req.flush(dummyQuoteList);
    httpMock.verify();
    fixture.whenStable().then(() => {
      expect(component.model.items.length).toBe(1);
    });
  }));
  it('should display quote grid', async(() => {
    fixture.detectChanges();
    expect(debugElement.queryAll(By.css('.ui-table-wrapper')).length).toEqual(1);
  }));
  it('should display data in quote grid', async(() => {
    fixture.detectChanges();
    const req = httpMock.expectOne(environment.appUrl + `/assets/json/quote-list.json`);
    expect(req.request.method).toBe('GET');
    req.flush(dummyQuoteList);
    httpMock.verify();
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      const cells = fixture.debugElement.queryAll(By.css('tr.ui-selectable-row'));
      expect(cells.length).toBe(1);
    });
  }));
  it('should call onRowSelect on row click', async(() => {
    const spy = spyOn(component, 'viewQuote');
    fixture.detectChanges();
    const req = httpMock.expectOne(environment.appUrl + `/assets/json/quote-list.json`);
    expect(req.request.method).toBe('GET');
    req.flush(dummyQuoteList);
    httpMock.verify();
    fixture.detectChanges();
    const cell = fixture.debugElement.queryAll(By.css('tr.ui-selectable-row'))[0];
    cell.nativeElement.click({ data: {} });
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      expect(spy).toHaveBeenCalled();
    });
  }));
  it('set selectedGridColumnHeader onColReorder', async(() => {
    localStorage.setItem(Constants.localStorageKeys.quoteGridData, JSON.stringify(dummyGridColumns));
    const newSelectedGridColumnHeaderEvent = { columns: dummyGridColumns.columnHeader };
    fixture.detectChanges();
    component.onColReorder(newSelectedGridColumnHeaderEvent);
    const localStorageValue = JSON.parse(localStorage.getItem(Constants.localStorageKeys.quoteGridData));
    expect(newSelectedGridColumnHeaderEvent.columns).toEqual(localStorageValue.columnHeader);
    localStorage.removeItem(Constants.localStorageKeys.quoteGridData);
  }));
  it('set selectedGridColumnHeader toggledGridColumn', async(() => {
    localStorage.setItem(Constants.localStorageKeys.quoteGridData, JSON.stringify(dummyGridColumns));
    const newSelectedGridColumnHeader = dummyGridColumns.columnHeader;
    fixture.detectChanges();
    component.toggledGridColumn(newSelectedGridColumnHeader);
    const localStorageValue = JSON.parse(localStorage.getItem(Constants.localStorageKeys.quoteGridData));
    expect(newSelectedGridColumnHeader).toEqual(localStorageValue.columnHeader);
    localStorage.removeItem(Constants.localStorageKeys.quoteGridData);
  }));
  it('should call loadQuoteLazy on onLazyLoad event (sortOrder: ASC)', async(() => {
    const spy = spyOn(component, 'populateQuoteGrid');
    fixture.detectChanges();
    component.loadQuoteLazy({ sortField: 'name', sortOrder: 1 });
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      expect(spy).toHaveBeenCalledWith(component.model.advancedSearch, component.model.startIndex, component.model.pageSize, component.model.sortResult);
    });
  }));
  it('should call loadQuoteLazy on onLazyLoad event (sortOrder: DESC)', async(() => {
    const spy = spyOn(component, 'populateQuoteGrid');
    fixture.detectChanges();
    component.loadQuoteLazy({ sortField: 'name', sortOrder: 0 });
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      expect(spy).toHaveBeenCalledWith(component.model.advancedSearch, component.model.startIndex, component.model.pageSize, component.model.sortResult);
    });
  }));
  it('should call viewQuote while selecting row', async(() => {
    fixture.detectChanges();
    const req = httpMock.expectOne(environment.appUrl + `/assets/json/quote-list.json`);
    expect(req.request.method).toBe('GET');
    req.flush(dummyQuoteList);
    httpMock.verify();
    fixture.detectChanges();
    const cell = fixture.debugElement.queryAll(By.css('tr.ui-selectable-row'))[0];
    cell.nativeElement.click({ data: {} });
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      expect(dummyRouter.navigate).toHaveBeenCalledWith(['/' + Constants.uiRoutes.quotesEdit + '/' + component.model.selectedQuote.id]);
    });
  }));
  it('on refreshQuoteGrid, populateQuoteGrid should get call', async(() => {
    const spy = spyOn(component, 'populateQuoteGrid');
    const dummyState = { first: 11, rows: 10 };
    fixture.detectChanges();
    component.refreshQuoteGrid(dummyState);
    fixture.detectChanges();
    fixture.whenStable().then(() => {
    expect(spy).toHaveBeenCalledWith(component.model.advancedSearch, component.model.startIndex, component.model.pageSize, component.model.sortResult);
    });
  }));
  it('valid transformValue should return from getQuoteGridData()', () => {
    const col = { field: 'totalQuantity' };
    fixture.detectChanges();
    const req = httpMock.expectOne(environment.appUrl + `/assets/json/quote-list.json`);
    expect(req.request.method).toBe('GET');
    req.flush(dummyQuoteList);
    httpMock.verify();
    const transformValue = component.getQuoteGridData(component.model.items[0], col);
    fixture.whenStable().then(() => {
       const totalQty = component.model.items[0].items.reduce((sum, item) => sum + item.quantity, 0);
       fixture.detectChanges();
       expect(transformValue).toBe(totalQty);
    });
  });
  it('should call service to get success response from mock http json (quote-list)', () => {
    fixture.detectChanges();
    const req = httpMock.expectOne(environment.appUrl + `/assets/json/quote-list.json`);
    expect(req.request.method).toBe('GET');
    req.flush(dummyQuoteList);
    httpMock.verify();
    fixture.detectChanges();
    expect(loggerServiceSpy).toHaveBeenCalledWith('QuotesListComponent : _quotesListService.fetchAllQuotes_quotesResponse');
  });
  it('should call service to get failure response from mock http json (quote-list)', () => {
    fixture.detectChanges();
    const req = httpMock.expectOne(environment.appUrl + `/assets/json/quote-list.json`);
    expect(req.request.method).toBe('GET');
    req.flush(dummyQuoteList, mockErrorResponse);
    httpMock.verify();
    fixture.detectChanges();
    expect(loggerServiceSpy).toHaveBeenCalledWith('QuotesListComponent : _quotesListService.fetchAllQuotes_errResponse');
  });
});
