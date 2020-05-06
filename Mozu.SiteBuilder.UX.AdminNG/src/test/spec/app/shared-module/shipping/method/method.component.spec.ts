import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, DebugElement, SimpleChange } from '@angular/core';
import { LoggerService, TostrService } from '@core';
import { By } from '@angular/platform-browser';
import { HttpClientModule, HttpClient, HttpHandler } from '@angular/common/http';
import { HttpTestingController, HttpClientTestingModule } from '@angular/common/http/testing';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder, Validators, FormArray, FormControl } from '@angular/forms';
import { of, Observable, defer } from 'rxjs';
import { TableModule } from 'primeng/table';
import { MessageService } from 'primeng/components/common/api';
import { map } from 'rxjs/operators';

import { } from '@core';
import { UtilityService, EnvironmentConfig } from '@core/infrastructure/utility.service';
import { AuthService } from '@core/extensions/auth.service';
import { HttpClientService, httpClientServiceCreator } from '@core/extensions/http-client.service';

import { CustomNGXLoggerService, NGXLoggerHttpService } from 'ngx-logger';
import { TranslateLoader, TranslateModule, TranslatePipe, TranslateService } from '@ngx-translate/core';


import { SharedDataService, NotificationService } from '@global';
import { Constants as GlobalConstant } from '@global/infrastructure/constants';
import { GlobalModule } from '@global/global.module';
import { ShippingMethodService } from '@shared/shipping/method/method.service';
import { ShippingMethodComponent, ShippingRateModel } from '@shared/shipping';
import { CurrencyPipe } from '@angular/common';
import { Constants } from '@shared/infrastructure/constants';

describe('ShippingMethodComponent', () => {
  let component: ShippingMethodComponent;
  let fixture: ComponentFixture<ShippingMethodComponent>;
  let debugElement: DebugElement;
  let loggerService: LoggerService;
  let environment: EnvironmentConfig;
  let loggerServiceSpy: any;
  let httpMock: HttpTestingController;
  const mockErrorResponse = { status: 400, statusText: 'Bad Request' };
  let element: HTMLElement;
  let shippingMethodService: ShippingMethodService;
  let translateService: TranslateService;

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


  beforeEach(async(() => {

    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), HttpClientModule, HttpClientTestingModule, TableModule, GlobalModule],
      declarations: [ShippingMethodComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [By, TranslateService, LoggerService, CustomNGXLoggerService,
        NGXLoggerHttpService, UtilityService, EnvironmentConfig, AuthService, TranslateService,
          SharedDataService, NotificationService, FormBuilder, TostrService, MessageService, ShippingMethodService,
        {
          provide: HttpClientService,
          useFactory: httpClientServiceCreator,
          deps: [HttpClient, UtilityService, AuthService]
        }
      ]
    })
      .compileComponents();

  }));


  beforeEach(async(() => {
    httpMock = TestBed.get(HttpTestingController);
    // var respData = {
    //   items: {
    //     'ctTenant': {
    //       'sites': [{
    //         'tenantId': 20072,
    //         'masterCatalogId': 1,
    //         'catalogId': 2,
    //         'countryCode': 'US',
    //         'defaultLocaleCode': 'en-US',
    //         'defaultCurrencyCode': 'USD',
    //         'isMozuRendered': true,
    //       }]
    //     }
    //   }
    // };

    // const req = httpMock.expectOne(environment.appUrl + `/assets/json/user-data.json`);
    // expect(req.request.method).toBe('GET');
    // req.flush(respData);
    // httpMock.verify();

    fixture = TestBed.createComponent(ShippingMethodComponent);
    component = fixture.debugElement.componentInstance;
    shippingMethodService = TestBed.get(ShippingMethodService);
    loggerService = TestBed.get(LoggerService);
    loggerServiceSpy = spyOn(loggerService, 'info').and.callThrough();
    translateService = TestBed.get(TranslateService);

  }));

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should call translate get method on constructor', async(() => {
    let translateService_Spy = spyOn(translateService, 'get').and.callThrough();
    fixture = TestBed.createComponent(ShippingMethodComponent);
    expect(translateService_Spy).toHaveBeenCalled();
  }));

  it('should assign quoteId onChangees', async(() => {
    component.ngOnChanges({
      quoteId: new SimpleChange(null, 'quoteId', true)
    });

    fixture.detectChanges();
    expect(component.quoteId).toContain('quoteId');
  }));

  it('should call populateShippingMethod on select of Shipment method dropdown', async(() => {
    spyOn(component, 'populateShippingMethod');
    let dropdown = fixture.debugElement.query(By.css('#shippingMethods'));
    dropdown.triggerEventHandler('open', null);
    fixture.detectChanges();

    fixture.whenStable().then(() => {
      expect(component.populateShippingMethod).toHaveBeenCalled();
    });

  }));

  it('should call shippingMethodService fetchShippingMethod', async(() => {

    const shippingService = fixture.debugElement.injector.get(ShippingMethodService);
    spyOn(shippingService, 'fetchShippingMethod').and.returnValue(Observable.of(dummyData));
    component.quoteId = 'TestQuoteId';
    var currencyPipe = new CurrencyPipe(this.locale);
    component.populateShippingMethod();
    expect(shippingService.fetchShippingMethod).toHaveBeenCalledWith(component.quoteId);
    expect(component.shippingRates[0].shippingMethodName).toEqual(dummyData[0].shippingMethodName);
  }));

  it('Should call service to get failure response from mock http json', async(() => {
    component.populateShippingMethod();
     const req = httpMock.expectOne(Constants.JsonResources.shippingMethods);
     expect(req.request.method).toBe('GET');
     req.flush(dummyData, mockErrorResponse);
     httpMock.verify();
     expect(loggerServiceSpy).toHaveBeenCalledWith('ShippingMethodComponent : _shippingMethodService.fetchShippingMethod_errResponse');
    }));

});


