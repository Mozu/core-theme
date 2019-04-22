import { async, ComponentFixture, TestBed, inject } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, DebugElement, ElementRef } from '@angular/core';
import { HttpClientModule, HttpClient, HttpHandler } from '@angular/common/http';
import { HttpTestingController, HttpClientTestingModule } from '@angular/common/http/testing';
import { Router } from '@angular/router';

import { CustomNGXLoggerService, NGXLoggerHttpService } from 'ngx-logger';
import { TranslateModule } from '@ngx-translate/core';

import { LoggerService } from '@core';
import { UtilityService, EnvironmentConfig } from '@core/infrastructure/utility.service';
import { AuthService } from '@core/extensions/auth.service';
import { HttpClientService, httpClientServiceCreator } from '@core/extensions/http-client.service';

import { QuotesListComponent } from 'app/quotes-module/quotes/list/list.component';
import { QuotesListModel } from 'app/quotes-module/quotes/list/list.model';
import { QuotesListService } from 'app/quotes-module/quotes/list/list.service';


fdescribe('QuotesListComponent', () => {
  let component: QuotesListComponent;
  let fixture: ComponentFixture<QuotesListComponent>;
  let quotesModel: QuotesListModel;
  let debugElement: DebugElement;
  let loggerService: LoggerService;
  let loggerServiceSpy: any;
  let quotesService: QuotesListService;
  let httpMock: HttpTestingController;
  let selectedQuote: any; 
  const mockErrorResponse = { status: 400, statusText: 'Bad Request' };
  
  let dummyQuoteList = {
    "startIndex": 0,
    "pageSize": 10,
    "pageCount": 1,
    "totalCount": 2,
    "items": [
     {
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
      imports: [TranslateModule, HttpClientModule, HttpClientTestingModule ],
      declarations: [ QuotesListComponent ],
      schemas:[NO_ERRORS_SCHEMA],
      providers: [QuotesListService, LoggerService, CustomNGXLoggerService, NGXLoggerHttpService, UtilityService, EnvironmentConfig, AuthService,
        {
            provide: HttpClientService,
            useFactory: httpClientServiceCreator,
            deps: [HttpClient, UtilityService, AuthService]
        },
        {
            provide: Router, 
            useValue: class { navigate = jasmine.createSpy("navigate"); } 
        },
        {
          provide: QuotesListModel, 
          userClass: QuotesListModel
      }]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuotesListComponent);
    component = fixture.componentInstance;
    debugElement = fixture.debugElement;

    //To access external model class
    quotesModel = new QuotesListModel();
    quotesModel.items = [];

     //To inject services using spyOn
    quotesService = TestBed.get(QuotesListService);
    loggerService = TestBed.get(LoggerService);
    httpMock = TestBed.get(HttpTestingController);

    loggerServiceSpy = spyOn(loggerService, 'info').and.callThrough();
  }));

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('Application should call onRowSelect()', () => {
      component.onRowSelect(dummyQuoteList);
      selectedQuote = dummyQuoteList;
      expect(selectedQuote.items.length).toBe(1);
    });

    it("Application should call viewQuote()", function() {
        component.viewQuote();
        let router = {
          navigate: jasmine.createSpy('navigate')
        };
        selectedQuote = dummyQuoteList;
       // selectedQuote.tenantId = dummyQuoteList.items[0].tenantId;
        let tenantId =  selectedQuote.tenantId
        expect(router.navigate).toHaveBeenCalledWith(['/quotesEdit/' + tenantId]);
    });

    it("Application should call ngOnInit()", function() {
      component.ngOnInit();
      expect(loggerServiceSpy).toHaveBeenCalledWith('QuotesListComponent : ngOnInit');
  });

    it("Application should call populateQuoteGrid()", function() {
        component.populateQuoteGrid();
        expect(loggerServiceSpy).toHaveBeenCalledWith('QuotesListComponent : populateQuoteGrid');
    });

    it('Application should call populateQuoteGrid() for success response of mock http json (quote-list)', () => {
      component.populateQuoteGrid();
      const req = httpMock.expectOne(`./assets/json/quote-list.json`, "Quote List Sample");
      expect(req.request.method).toBe("GET");
      req.flush(dummyQuoteList);
      httpMock.verify();
      expect(loggerServiceSpy).toHaveBeenCalledWith("QuotesListComponent : _quotesListService.fetchAllQuotes_quotesResponse");
  });

  it('Application should call populateQuoteGrid() for error response of mock http json (quote-list)', () => {
   
    component.populateQuoteGrid();
    const req = httpMock.expectOne(`./assets/json/quote-list.json`, "Quote List Sample");
    expect(req.request.method).toBe("GET");
    req.flush(dummyQuoteList), mockErrorResponse;
    httpMock.verify();
    expect(loggerServiceSpy).toHaveBeenCalledWith("QuotesListComponent : _quotesListService.fetchAllQuotes_errResponse");
    
});

});
