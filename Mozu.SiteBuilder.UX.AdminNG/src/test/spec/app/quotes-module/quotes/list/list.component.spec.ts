import { async, ComponentFixture, TestBed, inject } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, DebugElement, ElementRef } from '@angular/core';
import { By } from '@angular/platform-browser';
import { HttpClientModule, HttpClient, HttpHandler } from '@angular/common/http';
import { HttpTestingController, HttpClientTestingModule } from '@angular/common/http/testing';
import { Router } from '@angular/router';

import { TableModule } from 'primeng/table';

import { LoggerService } from '@core';
import { UtilityService, EnvironmentConfig } from '@core/infrastructure/utility.service';
import { AuthService } from '@core/extensions/auth.service';
import { HttpClientService, httpClientServiceCreator } from '@core/extensions/http-client.service';

import { CustomNGXLoggerService, NGXLoggerHttpService } from 'ngx-logger';
import { TranslateLoader, TranslateModule, TranslatePipe, TranslateService } from '@ngx-translate/core';

import { QuotesListComponent } from 'app/quotes-module/quotes/list/list.component';
import { QuotesListModel } from 'app/quotes-module/quotes/list/list.model';
import { QuotesListService } from 'app/quotes-module/quotes/list/list.service';

describe('QuotesListComponent', () => {
  let component: QuotesListComponent;
  let fixture: ComponentFixture<QuotesListComponent>;
  let debugElement: DebugElement;
  let loggerService: LoggerService;
  let loggerServiceSpy: any;
  let httpMock: HttpTestingController;
  const mockErrorResponse = { status: 400, statusText: 'Bad Request' };
  let element: HTMLElement;

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
      imports: [TranslateModule.forRoot(), HttpClientModule, HttpClientTestingModule, TableModule],
      declarations: [QuotesListComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [By, TranslateService, LoggerService, CustomNGXLoggerService,
        NGXLoggerHttpService, UtilityService, EnvironmentConfig, AuthService, QuotesListModel, QuotesListService,
        {
          provide: HttpClientService,
          useFactory: httpClientServiceCreator,
          deps: [HttpClient, UtilityService, AuthService]
        },
        {
          provide: Router,
          useValue: class { navigate = jasmine.createSpy("navigate"); }
        }
      ]
    })
    .compileComponents();

    //To inject services using spyOn
    loggerService = TestBed.get(LoggerService);
    httpMock = TestBed.get(HttpTestingController);

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

  it("should call ngOnInit()", function () {
    fixture.detectChanges();
    expect(loggerServiceSpy).toHaveBeenCalledWith('QuotesListComponent : ngOnInit');
  });

  it("should call populateQuoteGrid()", function () {
    fixture.detectChanges();
    expect(loggerServiceSpy).toHaveBeenCalledWith('QuotesListComponent : populateQuoteGrid');
  });

  it('should get grid items from quote component', async(() => {
    fixture.detectChanges();
    const req = httpMock.expectOne(`./assets/json/quote-list.json`);
    expect(req.request.method).toBe("GET");
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
    const req = httpMock.expectOne(`./assets/json/quote-list.json`);
    expect(req.request.method).toBe("GET");
    req.flush(dummyQuoteList);
    httpMock.verify();

    fixture.detectChanges();
    fixture.whenStable().then(() => {
      const cells = fixture.debugElement.queryAll(By.css('tr.ui-selectable-row'));
      expect(cells.length).toBe(1);
    });
  }));

  it('should call onRowSelect on row click', async(() => {
    const spy = spyOn(component, 'onRowSelect');
    fixture.detectChanges();

    const req = httpMock.expectOne(`./assets/json/quote-list.json`);
    expect(req.request.method).toBe("GET");
    req.flush(dummyQuoteList);
    httpMock.verify();

    fixture.detectChanges();
    const cell = fixture.debugElement.queryAll(By.css('tr.ui-selectable-row'))[0];
    console.log(cell);
    cell.nativeElement.click();

    fixture.detectChanges();
    fixture.whenStable().then(() => {
      expect(spy).toHaveBeenCalled();
    });
  }));

  it('should call service to get success response from mock http json (quote-list)', () => {
    fixture.detectChanges();
    const req = httpMock.expectOne(`./assets/json/quote-list.json`);
    expect(req.request.method).toBe("GET");
    req.flush(dummyQuoteList);
    httpMock.verify();
    fixture.detectChanges();
    expect(loggerServiceSpy).toHaveBeenCalledWith("QuotesListComponent : _quotesListService.fetchAllQuotes_quotesResponse");
  });

  it('should call service to get failure response from mock http json (quote-list)', () => {
    fixture.detectChanges();
    const req = httpMock.expectOne(`./assets/json/quote-list.json`);
    expect(req.request.method).toBe("GET");
    req.flush(dummyQuoteList, mockErrorResponse);
    httpMock.verify();
    fixture.detectChanges();
    expect(loggerServiceSpy).toHaveBeenCalledWith("QuotesListComponent : _quotesListService.fetchAllQuotes_errResponse");
  });

});
