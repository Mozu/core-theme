import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing'
import { LoggerService } from '@core';
import { CustomNGXLoggerService, NGXLoggerHttpService } from 'ngx-logger';
import { UtilityService, EnvironmentConfig } from '@core/infrastructure/utility.service';
import { AuthService } from '@core/extensions/auth.service';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { HttpClientService, httpClientServiceCreator } from '@core/extensions/http-client.service';
import { HeaderService } from '@shared/header/header.service';


describe('HeaderService', () => { 
    let headerService: HeaderService;
    let loggerService: LoggerService;
    let loggerServiceSpy: any;
    let httpMock: HttpTestingController;
    const mockErrorResponse = { status: 400, statusText: 'Bad Request' };

    beforeEach(() => {

        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [HeaderService, LoggerService, CustomNGXLoggerService, NGXLoggerHttpService, UtilityService, EnvironmentConfig, AuthService,
              {
                provide: HttpClientService,
                useFactory: httpClientServiceCreator,
                deps: [HttpClient, UtilityService, AuthService]
              }
            ]
        });
        headerService = TestBed.get(HeaderService);
        loggerService = TestBed.get(LoggerService);
        httpMock = TestBed.get(HttpTestingController);
        loggerServiceSpy = spyOn(loggerService, 'info').and.callThrough();
    });

    it('Application should call HeaderService service and return json object', () => {
        let dummyRedirectionLinks = [
            {
                "label": "Launchpad",
                "url": "/admin/auth/launchpad"
            },
            {
                "label": "Log Out",
                "url": "/admin/auth/logout"
            }];

            headerService.fetchRedirectionLinks().subscribe(redirectLinks => {
            expect(redirectLinks[0].label).toBe("Launchpad");
            expect(redirectLinks[0].url).toBe("/admin/auth/launchpad"); 
        },
        err => {
            expect(err).toBe(`Invalid Data`);
        })

        const req = httpMock.expectOne(`./assets/json/user-redirection.json`, "sample url test from header service");
        expect(req.request.method).toBe("GET");
        req.flush(dummyRedirectionLinks);
        httpMock.verify();
    });
});

