import { TestBed, async } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { LoggerService, HttpClientService, httpClientServiceCreator, UtilityService, AuthService, EnvironmentConfig } from '@core';
import { CustomNGXLoggerService, NGXLoggerHttpService } from 'ngx-logger';
import { ShippingMethodService } from 'app/shared-module/shipping/method/method.service';
import { HttpClient } from '@angular/common/http';
import { Constants } from '@shared/infrastructure/constants';

describe('ShippingMethodService', () => {
    let shippingMethodService: ShippingMethodService;
    let loggerService: LoggerService;
    let loggerServiceSpy: any;
    let httpMock: HttpTestingController;

    let dummyData = [{
        'shippingMethodCode': 'fedex_FEDEX_2_DAY_AM',
        'shippingMethodName': 'FedEx 2Day',
        'shippingZoneCode': 'United States',
        'isValid': true,
        'messages': [
        ],
        'currencyCode': 'USD',
        'price': 27.79
    }];
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [ShippingMethodService, LoggerService, CustomNGXLoggerService,
                NGXLoggerHttpService, UtilityService, EnvironmentConfig, AuthService,
                {
                    provide: HttpClientService,
                    useFactory: httpClientServiceCreator,
                    deps: [HttpClient, UtilityService, AuthService]
                }]

        });

        shippingMethodService = TestBed.get(ShippingMethodService);
        loggerService = TestBed.get(LoggerService);
        httpMock = TestBed.get(HttpTestingController);

        loggerServiceSpy = spyOn(loggerService, 'info').and.callThrough();

    });

    it('should return an shipping method details as Observable', async(() => {
        const quoteId = '4588be576b7f4416a70b6d810219680e';

        shippingMethodService.fetchShippingMethod(quoteId).subscribe(account => {
            expect(loggerServiceSpy).toHaveBeenCalledWith('ShippingMethodService: fetchShippingMethod');
            expect(account[0].shippingMethodCode).toBe('fedex_FEDEX_2_DAY_AM');
        },
            err => {
                expect(err).toBe(`Error on data fetching.`);
            });
        const req = httpMock.expectOne(Constants.JsonResources.shippingMethods);
        expect(req.request.method).toBe('GET');
        req.flush(dummyData);
        httpMock.verify();
    })
    );

});
