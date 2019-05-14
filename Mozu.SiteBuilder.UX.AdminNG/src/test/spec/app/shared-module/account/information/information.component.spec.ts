import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, DebugElement, SimpleChange } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { NGXLoggerHttpService, CustomNGXLoggerService } from 'ngx-logger';
import { TranslateLoader, TranslateModule, TranslatePipe, TranslateService } from '@ngx-translate/core';
import { LoggerService, UtilityService, EnvironmentConfig, AuthService, HttpClientService, httpClientServiceCreator } from '@core';
import { GlobalModule } from '@global/global.module';
import { AccountInformationComponent, AccountInfoModel } from '@shared/account/information';
import { AccountInfoService } from '@shared/account/information/information.service';
import { By } from '@angular/platform-browser';

describe('AccountInformationComponent', () => {
  let component: AccountInformationComponent;
  let fixture: ComponentFixture<AccountInformationComponent>;
  let debugElement: DebugElement;
  let element: HTMLElement;
  let loggerService: LoggerService;
  let loggerServiceSpy: any;
  let httpMock: HttpTestingController;
  const mockErrorResponse = { status: 400, statusText: 'Bad Request' };

  let dummyAccountInfo = {
    "users":  [
      {
          "emailAddress": "Pankaj@kibo.com",
          "userName": "Pankaj",
          "firstName": "Pankaj",
          "lastName": "C",
          "localeCode": "US",
          "userId": "4588be576b7f4416a70b6d810219680e",
          "isLocked": true,
          "isActive": false,
          "isRemoved": false,
          "acceptsMarketing": true,
          "hasExternalPassword": true
      }
    ],
    "isActive": true,
    "priceList": "123.4",
    "customerSet": "abc",
    "companyOrOrganization": "B2B account",
    "attributes":  [],
    "taxExempt": "",
    "taxId": "2342",
    "externalId": "3453",
    "customerSinceDate": new Date(),
    "accountType": "Saving"
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), HttpClientTestingModule, GlobalModule ],
      declarations: [ AccountInformationComponent ],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [By, TranslateService, LoggerService,NGXLoggerHttpService, CustomNGXLoggerService, 
        UtilityService, EnvironmentConfig, AuthService, AccountInfoModel, AccountInfoService,
        {
          provide: HttpClientService,
          useFactory: httpClientServiceCreator,
          deps: [HttpClient, UtilityService, AuthService]
      }]
    })
    .compileComponents();

    loggerService = TestBed.get(LoggerService);
    loggerServiceSpy = spyOn(loggerService, 'info').and.callThrough();
    
  }));

  beforeEach(async(() => {
    httpMock = TestBed.get(HttpTestingController);
    let dummyAccountInfo1 = {
      "users":  [
        {
            "emailAddress": "Pankaj@kibo.com",
            "userName": "Pankaj",
            "firstName": "Pankaj",
            "lastName": "C",
            "localeCode": "US",
            "userId": "4588be576b7f4416a70b6d810219680e",
            "isLocked": true,
            "isActive": false,
            "isRemoved": false,
            "acceptsMarketing": true,
            "hasExternalPassword": true
        }
      ],
      "isActive": true,
      "priceList": "123.4",
      "customerSet": "abc",
      "companyOrOrganization": "B2B account",
      "attributes":  [],
      "taxExempt": "",
      "taxId": "2342",
      "externalId": "3453",
      "customerSinceDate": new Date(),
      "accountType": "Saving"
    };
    const req = httpMock.expectOne(`./assets/json/account-information.json`);
    expect(req.request.method).toBe("GET");
    req.flush(dummyAccountInfo1);
    httpMock.verify();

    fixture = TestBed.createComponent(AccountInformationComponent);
    component = fixture.componentInstance;
    debugElement = fixture.debugElement;
    element = debugElement.nativeElement;

    //component.model = dummyAccountInfo;
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it("should call populateAccountInfo()", function () {
    fixture.detectChanges();
    expect(loggerServiceSpy).toHaveBeenCalledWith("AccountInformationComponent : populateAccountInfo");
  });

  it('should get users from account information component', async(() => {
    fixture.detectChanges();
    const req = httpMock.expectOne(`./assets/json/account-information.json`);
    expect(req.request.method).toBe("GET");
    req.flush(dummyAccountInfo);
    httpMock.verify();
    fixture.whenStable().then(() => {
      expect(component.model.users.length).toBe(1);
    });
  }));

  // it('should fetch userId from ngOnChange()', () => {
  //   component.userId = '4588be576b7f4416a70b6d810219680e';
  //   //fixture.detectChanges(); 
  //   component.ngOnChanges({
  //     quote: new SimpleChange(null, component.userId, true)
  //   });
    
  //   expect(loggerServiceSpy).toHaveBeenCalledWith("AccountInformationComponent : ngOnChanges");
  // });
  
});
