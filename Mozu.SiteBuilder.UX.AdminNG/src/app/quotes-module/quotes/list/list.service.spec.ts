// import { TestBed } from '@angular/core/testing';
// import { HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing'
// import { LoggerService } from '@core';
// import { CustomNGXLoggerService, NGXLoggerHttpService } from 'ngx-logger';
// import { QuotesService } from './quotes.service';

// describe('DashboardService', () => { 
//     let quotesService: QuotesService;
//     let loggerService: LoggerService;
//     let loggerServiceSpy: any;
//     let httpMock: HttpTestingController;

//     beforeEach(() => {

//         TestBed.configureTestingModule({
//             imports: [HttpClientTestingModule],
//             providers: [quotesService, LoggerService]

//         });

//         quotesService = TestBed.get(quotesService);
//         loggerService = TestBed.get(LoggerService);
//         httpMock = TestBed.get(HttpTestingController);

//         loggerServiceSpy = spyOn(loggerService, 'info').and.callThrough();

//     });

//     it('Application should return an quotes Observable<any>', () => {
//             expect(loggerServiceSpy).toHaveBeenCalledWith("QuotesService: fetchAllQuotes");

//             // let dummyQuoteList = 
//             //     {
//             //         "startIndex": 0,
//             //         "pageSize": 10,
//             //         "pageCount": 1,
//             //         "totalCount": 2,
//             //         "items": [
//             //          {
//             //           "id": "0da178726c6b9e27784ebfec0000432a",
//             //           "name": "Test Quote One",
//             //           "siteId": 21127,
//             //           "tenantId": 17194,
//             //           "number": 1,
//             //           "items": [],
//             //           "auditInfo": {
//             //            "updateDate": "2019-03-31T19:52:25.091Z",
//             //            "createDate": "2019-03-31T19:52:25.091Z",
//             //            "updateBy": "1",
//             //            "createBy": "1"
//             //           },
//             //           "destinations": [],
//             //           "isTaxExempt": false,
//             //           "currencyCode": "USD",
//             //           "customerInteractionType": "Unknown",
//             //           "orderDiscounts": [],
//             //           "subTotal": 0,
//             //           "itemLevelProductDiscountTotal": 0,
//             //           "orderLevelProductDiscountTotal": 0,
//             //           "itemTaxTotal": 0,
//             //           "itemTotal": 0,
//             //           "total": 0,
//             //           "shippingDiscounts": [],
//             //           "itemLevelShippingDiscountTotal": 0,
//             //           "orderLevelShippingDiscountTotal": 0,
//             //           "shippingAmount": 0,
//             //           "shippingSubTotal": 0,
//             //           "shippingTaxTotal": 0,
//             //           "shippingTotal": 0,
//             //           "handlingDiscounts": [],
//             //           "itemLevelHandlingDiscountTotal": 0,
//             //           "orderLevelHandlingDiscountTotal": 0,
//             //           "handlingSubTotal": 0,
//             //           "handlingTaxTotal": 0,
//             //           "handlingTotal": 0,
//             //           "dutyTotal": 0,
//             //           "feeTotal": 0
//             //          }
//             //  ]
//             // };
//             //   
//             // quotesService.fetchAllQuotes().subscribe(quotes => {
//             //     //expect(dummyTabsName.length).toBe(2);
//             //     expect(quotes[1].items.name).toBe("Test Quote One");
//             // },
//             // err => {
//             //     expect(err).toBe(`Error on data fetching.`)
//             // })
//             // const req = httpMock.expectOne(`./assets/json/quote-list.json`, "Quote List");
//             // expect(req.request.method).toBe("GET");
//             // req.flush(dummyQuoteList);
//             // httpMock.verify();
//     });

// });

