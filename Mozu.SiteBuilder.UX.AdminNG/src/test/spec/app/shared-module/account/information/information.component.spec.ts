import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, DebugElement, SimpleChange } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { NGXLoggerHttpService, CustomNGXLoggerService } from 'ngx-logger';
import { TranslateLoader, TranslateModule, TranslatePipe, TranslateService } from '@ngx-translate/core';
import { LoggerService, UtilityService, EnvironmentConfig, AuthService, HttpClientService,
  httpClientServiceCreator, SpinnerService } from '@core';
import { GlobalModule } from '@global/global.module';
import { AccountInformationComponent, AccountInfoModel } from '@shared/account/information';
import { AccountInfoService } from '@shared/account/information/information.service';
import { By } from '@angular/platform-browser';
import { Constants } from '@shared';
import { Constants as GlobalConstants} from '@global/infrastructure/constants';
import { Observable } from 'rxjs';

describe('AccountInformationComponent', () => {
  let component: AccountInformationComponent;
  let fixture: ComponentFixture<AccountInformationComponent>;
  let debugElement: DebugElement;
  let element: HTMLElement;
  let loggerService: LoggerService;
  let loggerServiceSpy: any;
  let httpMock: HttpTestingController;
  const mockErrorResponse = { status: 400, statusText: 'Bad Request' };

  const dummyAccountInfo = {
    'startIndex': 0,
    'pageSize': 20,
    'pageCount': 1,
    'totalCount': 1,
    'items': [
     {
      'emailAddress': 'tverma@kibo.com',
      'userName': 'tverma@kibo.com',
      'firstName': 'Tripti',
      'lastName': 'Verma',
      'localeCode': 'en-us',
      'userId': '4588be576b7f4416a70b6d810219680e',
      'isLocked': false,
      'isActive': true,
      'isRemoved': false,
      'hasExternalPassword': false
     }
    ]
   };

  const respData = {
    items: {
      'ctTaContext': {
        'masterCatalogs': [{
          'sites': [{
            'id': '1234'
          }]
        }]
      }
    }};

    let userId = '4588be576b7f4416a70b6d810219680e';
    let customerAccountId = 1012;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), HttpClientTestingModule, GlobalModule ],
      declarations: [ AccountInformationComponent ],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [By, TranslateService, LoggerService, NGXLoggerHttpService, CustomNGXLoggerService,
        UtilityService, EnvironmentConfig, AuthService, AccountInfoModel, AccountInfoService, SpinnerService,
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

    // const req = httpMock.expectOne(`./assets/json/user-data.json`);
    // expect(req.request.method).toBe('GET');
    // req.flush(respData);
    // httpMock.verify();

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
    component.customerAccountId = 1012;
    const spy = spyOn(component, 'populateAccountInfo');
    component.ngOnChanges({
      userId: new SimpleChange(null, component.userId, true),
      customerAccountId: new SimpleChange(null, component.customerAccountId, true)
    });
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      expect(spy).toHaveBeenCalledTimes(1);
    });
   });

  it('should call fetchAccountInformation service method using observable', async(() => {
    const accountInfoService = fixture.debugElement.injector.get(AccountInfoService);
    spyOn(accountInfoService, 'fetchAccountInformation').and.returnValue(Observable.of(dummyAccountInfo));
    component.populateAccountInfo(customerAccountId, userId);
    expect(accountInfoService.fetchAccountInformation).toHaveBeenCalledWith(customerAccountId, userId);
  }));

  it('should call service to get success response from mock http json (account-information)', async(() => {
    component.userId = '4588be576b7f4416a70b6d810219680e';
    component.customerAccountId = 1012;
    component.populateAccountInfo(component.customerAccountId, component.userId);

    //const req = httpMock.expectOne(GlobalConstants.webApis.getB2BUserAccount
      //+ '/' + component.customerAccountId + Constants.userAPIDeepLink);
    const req = httpMock.expectOne(`./assets/json/user-data.json`);
    expect(req.request.method).toBe('GET');
    req.flush(dummyAccountInfo);

    httpMock.verify();
    expect(loggerServiceSpy).toHaveBeenCalledWith('AccountInformationComponent : _accountInfoService.fetchAccountInformation_successResponse');
  }));

  it('should get customer account URL from account information component', () => {
    component.generateCustomerAccountUrl();
    let baseNavigationURL = '';
    const customerAccountURL =  component.baseNavigationURL + Constants.editNavigationDeepLink + customerAccountId ;
    const siteId = respData.items.ctTaContext.masterCatalogs[0].sites[0].id;
    expect(component.customerAccountURL).toBe(customerAccountURL);
  });

  it('should call service to get failure response from mock http json (account-information)', () => {
    component.userId = '4588be576b7f4416a70b6d810219680e';
    component.customerAccountId = 1012;
    component.populateAccountInfo(component.customerAccountId, component.userId);

    const req = httpMock.expectOne(`/assets/json/account-information.json`);
    expect(req.request.method).toBe('GET');
    req.flush(dummyAccountInfo, mockErrorResponse);

    httpMock.verify();
    expect(loggerServiceSpy).toHaveBeenCalledWith('AccountInformationComponent : _accountInfoService.fetchAccountInformation_errResponse');
  });
});
