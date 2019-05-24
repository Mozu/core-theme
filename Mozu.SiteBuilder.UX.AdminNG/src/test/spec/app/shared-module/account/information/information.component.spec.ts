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

  var respData = {
    items: {
      "ctTaContext": {
        "masterCatalogs": [{
          "sites": [{
            "id": "1234"
          }]
        }]
      }
    }};


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
    
    const req = httpMock.expectOne(`./assets/json/user-data.json`);
    expect(req.request.method).toBe("GET");
    req.flush(respData);
    httpMock.verify();
    
    fixture = TestBed.createComponent(AccountInformationComponent);
    component = fixture.componentInstance;
    debugElement = fixture.debugElement;
    element = debugElement.nativeElement;
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch userId from ngOnChange()', () => {
    component.userId = '4588be576b7f4416a70b6d810219680e';
    const spy = spyOn(component, 'populateAccountInfo');
    component.ngOnChanges({
      userId: new SimpleChange(null, component.userId, true)
    });
    fixture.detectChanges(); 
    fixture.whenStable().then(() => {
      expect(spy).toHaveBeenCalledTimes(1);
    });
   });

  it('should call service to get success response from mock http json (account-information)', async(() => {
    component.userId = '4588be576b7f4416a70b6d810219680e';
    component.customerAccountId = 123;
    component.populateAccountInfo(component.userId);

    const req = httpMock.expectOne(`/assets/json/account-information.json`);
    expect(req.request.method).toBe("GET");
    req.flush(dummyAccountInfo);
    
    httpMock.verify();
    expect(loggerServiceSpy).toHaveBeenCalledWith("AccountInformationComponent : _accountInfoService.fetchAccountInformation_successResponse");
  }));

  it('should get customer account URL from account information component', () => {
    component.generateCustomerAccountUrl();
    let siteId = respData.items.ctTaContext.masterCatalogs[0].sites[0].id;
    expect(loggerServiceSpy).toHaveBeenCalledWith("AccountInformationComponent : generateCustomerAccountUrl");
  });
  
  it('should call service to get failure response from mock http json (account-information)', () => {
    component.userId = '4588be576b7f4416a70b6d810219680e';
    component.customerAccountId = 123;
    component.populateAccountInfo(component.userId);

    const req = httpMock.expectOne(`/assets/json/account-information.json`);
    expect(req.request.method).toBe("GET");
    req.flush(dummyAccountInfo, mockErrorResponse);
    
    httpMock.verify();
    expect(loggerServiceSpy).toHaveBeenCalledWith("AccountInformationComponent : _accountInfoService.fetchAccountInformation_errResponse");
  });

  


});
