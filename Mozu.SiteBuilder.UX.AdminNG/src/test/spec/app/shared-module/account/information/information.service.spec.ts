import { TestBed, async } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import { LoggerService, HttpClientService, httpClientServiceCreator, UtilityService, AuthService, EnvironmentConfig } from '@core';
import { CustomNGXLoggerService, NGXLoggerHttpService } from 'ngx-logger';
import { AccountInfoService } from 'app/shared-module/account/information/information.service';
import { HttpClient } from '@angular/common/http';

describe('AccountInfoService', () => {
    let accountInfoService: AccountInfoService;
    let loggerService: LoggerService;
    let loggerServiceSpy: any;
    let httpMock: HttpTestingController;

    const dummyAccountInfo = {
        'users':  [
          {
              'emailAddress': 'TriptiV@kibo.com',
              'userName': 'TriptiV',
              'firstName': 'Tripti',
              'lastName': 'V',
              'localeCode': 'US',
              'userId': '4588be576b7f4416a70b6d810219680e',
              'isLocked': true,
              'isActive': false,
              'isRemoved': false,
              'acceptsMarketing': true,
              'hasExternalPassword': true
          }
        ],
        'isActive': true,
        'priceList': '123.4',
        'customerSet': 'abc',
        'companyOrOrganization': 'B2B account',
        'attributes':  [],
        'taxExempt': '',
        'taxId': '2342',
        'externalId': '3453',
        'customerSinceDate': '2019-03-31T19:52:25.091Z',
        'accountType': 'Saving'
      };

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [AccountInfoService, LoggerService, CustomNGXLoggerService,
                NGXLoggerHttpService, UtilityService, EnvironmentConfig, AuthService,
                {
                    provide: HttpClientService,
                    useFactory: httpClientServiceCreator,
                    deps: [HttpClient, UtilityService, AuthService]
                }]

        });

        accountInfoService = TestBed.get(AccountInfoService);
        loggerService = TestBed.get(LoggerService);
        httpMock = TestBed.get(HttpTestingController);

        loggerServiceSpy = spyOn(loggerService, 'info').and.callThrough();

    });

    it('should return an B2B account details as Observable', async(() => {
        const customerAccountId = 1012;
        const userId = '4588be576b7f4416a70b6d810219680e';

        accountInfoService.fetchAccountInformation(customerAccountId, userId).subscribe(account => {
                expect(loggerServiceSpy).toHaveBeenCalledWith('AccountInfoService: fetchAccountInformation');
                expect(account.users[0].userName).toBe('TriptiV');
            },
            err => {
                expect(err).toBe(`Error on data fetching.`);
            });
            const req = httpMock.expectOne(`/assets/json/account-information.json`);
            expect(req.request.method).toBe('GET');
            req.flush(dummyAccountInfo);
            httpMock.verify();
    })
    );

});

