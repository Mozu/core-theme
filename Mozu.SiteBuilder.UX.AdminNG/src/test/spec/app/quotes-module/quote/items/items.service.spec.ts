import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing'
import { LoggerService, HttpClientService, httpClientServiceCreator, UtilityService, AuthService, EnvironmentConfig } from '@core';
import { CustomNGXLoggerService, NGXLoggerHttpService } from 'ngx-logger';
import { QuoteItemsService } from 'app/quotes-module/quote/items/items.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env';
describe('QuoteItemsService', () => {
  let quotesService: QuoteItemsService;
  let loggerService: LoggerService;
  let loggerServiceSpy: any;
  let httpMock: HttpTestingController;
  let dummyQuoteList =
    [
      {
        'id': '185bdb4fd2a744bda227aa4700736f2c',
        'destinationId': '74214a287fea408cb6f2aa4600a6e3d3',
        'fulfillmentLocationCode': 'MOG',
        'fulfillmentMethod': 'Ship',
        'lineId': 1,
        'product': {
          'fulfillmentTypesSupported': [
            'DirectShip'
          ],
          'options': [],
          'properties': [],
          'categories': [
            {
              'id': 1
            }
          ],
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
      }
    ];
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [QuoteItemsService, LoggerService, CustomNGXLoggerService, NGXLoggerHttpService, UtilityService, EnvironmentConfig, AuthService,
        {
          provide: HttpClientService,
          useFactory: httpClientServiceCreator,
          deps: [HttpClient, UtilityService, AuthService]
        }]
    });
    quotesService = TestBed.get(QuoteItemsService);
    loggerService = TestBed.get(LoggerService);
    httpMock = TestBed.get(HttpTestingController);
    loggerServiceSpy = spyOn(loggerService, 'info').and.callThrough();
  });
  it('should return an deleted quote item response', () => {
    let quoteId = '0dd322d1429fe45778112b5b00004c44';
    let itemId = '185bdb4fd2a744bda227aa4700736f2c';
    quotesService.deleteQuoteItem(quoteId, itemId).subscribe(quotes => {
      expect(loggerServiceSpy).toHaveBeenCalledWith('QuoteItemsService: deleteItem');
      expect(quotes[0].subtotal).toBe(5);
    },
      err => {
        expect(err).toBe(`Error on data fetching.`)
      });
    const req = httpMock.expectOne(environment.appUrl + `/assets/json/quote-list.json`);
    expect(req.request.method).toBe('GET');
    req.flush(dummyQuoteList);
    httpMock.verify();
  });
});