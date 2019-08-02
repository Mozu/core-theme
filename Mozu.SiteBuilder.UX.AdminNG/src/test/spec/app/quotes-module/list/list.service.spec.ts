import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { LoggerService, HttpClientService, httpClientServiceCreator, UtilityService, AuthService, EnvironmentConfig, SpinnerService } from '@core';
import { CustomNGXLoggerService, NGXLoggerHttpService } from 'ngx-logger';
import { QuotesListService } from 'app/quotes-module/list/list.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env';
describe('QuotesListService', () => {
    let quotesService: QuotesListService;
    let loggerService: LoggerService;
    let loggerServiceSpy: any;
    let httpMock: HttpTestingController;
    const dummyQuoteList =
    {
        'startIndex': 0,
        'pageSize': 10,
        'pageCount': 1,
        'totalCount': 2,
        'items': [
            {
                'id': '0da178726c6b9e27784ebfec0000432a',
                'name': 'Test Quote One',
                'siteId': 21127,
                'tenantId': 17194,
                'number': 1,
                'items': [],
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
            }
        ]
    };
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [QuotesListService, LoggerService, CustomNGXLoggerService, NGXLoggerHttpService, UtilityService, EnvironmentConfig, AuthService, SpinnerService,
                {
                    provide: HttpClientService,
                    useFactory: httpClientServiceCreator,
                    deps: [HttpClient, UtilityService, AuthService]
                }]
        });
        quotesService = TestBed.get(QuotesListService);
        loggerService = TestBed.get(LoggerService);
        httpMock = TestBed.get(HttpTestingController);
        loggerServiceSpy = spyOn(loggerService, 'info').and.callThrough();
    });
    it('should return an quote list as Observable', () => {
        quotesService.fetchAllQuotes().subscribe(quotes => {
            expect(loggerServiceSpy).toHaveBeenCalledWith('QuotesListService: fetchAllQuotes');
            expect(quotes.items[0].name).toBe('Test Quote One');
        },
            err => {
                expect(err).toBe(`Error on data fetching.`);
            });
        const req = httpMock.expectOne(environment.appUrl + `/assets/json/quote-list.json`);
        expect(req.request.method).toBe('GET');
        req.flush(dummyQuoteList);
        httpMock.verify();
    });
    it('should return an quote list as Observable when all parametered passsed', () => {
        quotesService.fetchAllQuotes('account', 11, 10, 'ASC').subscribe(quotes => {
            expect(loggerServiceSpy).toHaveBeenCalledWith('QuotesListService: fetchAllQuotes');
            expect(quotes.items[0].name).toBe('Test Quote One');
        },
            err => {
                expect(err).toBe(`Error on data fetching.`);
            });
        const req = httpMock.expectOne(environment.appUrl + `/assets/json/quote-list.json`);
        expect(req.request.method).toBe('GET');
        req.flush(dummyQuoteList);
        httpMock.verify();
    });
});