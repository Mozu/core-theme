import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, DebugElement, SimpleChange, SimpleChanges  } from '@angular/core';
import { LoggerService, TostrService, EnvironmentConfig, HttpClientService, httpClientServiceCreator, UtilityService, AuthService } from '@core'
import { By } from '@angular/platform-browser';
import { HttpClientModule, HttpClient, HttpHandler } from '@angular/common/http';
import { HttpTestingController, HttpClientTestingModule } from '@angular/common/http/testing';
import { FormGroup, FormBuilder, Validators, FormArray, FormControl } from '@angular/forms';
import { of } from 'rxjs';

import { Constants as GlobalConstant } from '@global/infrastructure/constants';
import { GlobalModule } from "@global/global.module";
import { CustomNGXLoggerService, NGXLoggerHttpService } from 'ngx-logger';
import { SharedDataService, NotificationService } from '@global';
import { TranslateLoader, TranslateModule, TranslatePipe, TranslateService } from '@ngx-translate/core';
import { PhonePipe } from '@shared/pipes/phone.pipe';
import { ShippingAddressComponent } from '@shared/shipping/address/address.component';
import { TableModule } from 'primeng/table';
import {  MessageService } from 'primeng/components/common/api';

describe('AddressComponent', () => {
  let component: ShippingAddressComponent;
  let fixture: ComponentFixture<ShippingAddressComponent>;
  let debugElement: DebugElement;
  let loggerService: LoggerService;
  let environment: EnvironmentConfig;
  let loggerServiceSpy: any;
  let httpMock: HttpTestingController;
  let element: HTMLElement;        
  
  beforeEach( async(() => {   

    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), HttpClientModule, HttpClientTestingModule, TableModule, GlobalModule],
      declarations: [ShippingAddressComponent, PhonePipe],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [By, TranslateService, LoggerService, 
         UtilityService, EnvironmentConfig, AuthService,   
          SharedDataService, NotificationService, FormBuilder, TostrService,NGXLoggerHttpService, MessageService, CustomNGXLoggerService, 
        {
          provide: HttpClientService,
          useFactory: httpClientServiceCreator,
          deps: [HttpClient, UtilityService, AuthService]
        }        
      ]
    })
    .compileComponents();       

    fixture = TestBed.createComponent(ShippingAddressComponent);
    component = fixture.debugElement.componentInstance;
    loggerService = TestBed.get(LoggerService);
    loggerServiceSpy = spyOn(loggerService, 'info').and.callThrough();
    element = fixture.nativeElement;

  }));
  
  it('should create Component', async() => {
    
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it("should initiate values when Angular calls ngOnInit()", async(() => {
   
    let mockDestination = 
    {
      "firstName": 'testname',
      "lastNameOrSurname": 'testsurname',
      "phoneNumbers": {'home':'999999999'},
      "address": {
        "address1": 'address1',
        "cityOrTown": 'testcity',
        "stateOrProvince": 'teststate',
        "postalOrZipCode": '12345',
        "countryCode": 'usa',
        "addressType": 'home',
        "isValidated": true
      }
    };

  component.destinationContact = mockDestination;  
  component.ngOnChanges({
    destinations: new SimpleChange(null, component.destinationContact, true)
  });

  fixture.detectChanges();
  expect(element.querySelector('div').querySelector('div').innerText).toContain(mockDestination.firstName);

   }));

});