import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, DebugElement } from '@angular/core';
import { LoggerService, TostrService, ErrorCode, HttpError, ErroNotificationType, ToastrCode, SpinnerService, IRequestOptions } from '@core';
import { By } from '@angular/platform-browser';
import { HttpClientModule, HttpClient, HttpHandler } from '@angular/common/http';
import { HttpTestingController, HttpClientTestingModule } from '@angular/common/http/testing';
import { Router, ActivatedRoute, convertToParamMap, Params } from '@angular/router';
import { FormGroup, FormBuilder, Validators, FormArray, FormControl } from '@angular/forms';
import { of } from 'rxjs';
import { TableModule } from 'primeng/table';
import { MessageService } from 'primeng/components/common/api';
import {RouterTestingModule } from '@angular/router/testing'
import { } from '@core';
import { UtilityService, EnvironmentConfig } from '@core/infrastructure/utility.service';
import { AuthService } from '@core/extensions/auth.service';
import { HttpClientService, httpClientServiceCreator } from '@core/extensions/http-client.service';

import { CustomNGXLoggerService, NGXLoggerHttpService } from 'ngx-logger';
import { TranslateLoader, TranslateModule, TranslatePipe, TranslateService } from '@ngx-translate/core';

import { LocationGroupConfigComponent } from 'app/location-groups-module/config/config.component';
import { LocationGroupConfigService } from 'app/location-groups-module/config/config.service';
import { LocationGroupConfigModel, PagniatedNgSelectPageConfiguration, SelectedCarrierAccountModel } from 'app/location-groups-module/config/config.model';
import { SharedDataService, NotificationService } from '@global';
import { Constants as GlobalConstant } from '@global/infrastructure/constants';
import { GlobalModule } from "@global/global.module";
import { ProgressButtonService } from '@shared/progress-button/progress-button.service';
import { Constants, ConfirmationDialogService, ConfirmationDialogNotificationCode, ConfirmationDialogNotificationType, NotificationLGActions } from '@shared';


describe('ConfigComponent', () => {
    let component: LocationGroupConfigComponent;
    let fixture: ComponentFixture<LocationGroupConfigComponent>;
    let debugElement: DebugElement;
    let loggerService: LoggerService;
    let environment: EnvironmentConfig;
    let loggerServiceSpy: any;
    let httpMock: HttpTestingController;
    const mockErrorResponse = { status: 400, statusText: 'Bad Request' };
    let element: HTMLElement;
    let createLocationGroupService: LocationGroupConfigService
    let locationGroupConfigModel: LocationGroupConfigModel
    let dummyLocationGroup;
    beforeEach(async(() => {
        const mockActivatedRoute = {
            snapshot: {
                paramMap: {
                    get() { return '1'; }
                }
            }
        };
    TestBed.configureTestingModule({
        imports: [TranslateModule.forRoot(), HttpClientModule, HttpClientTestingModule, TableModule, GlobalModule, RouterTestingModule],
        declarations: [LocationGroupConfigComponent],
        schemas: [NO_ERRORS_SCHEMA],
        providers: [By,LoggerService, CustomNGXLoggerService,
            NGXLoggerHttpService, UtilityService, EnvironmentConfig, AuthService, LocationGroupConfigModel,
            SharedDataService, NotificationService, FormBuilder, TostrService, MessageService, LocationGroupConfigService, SpinnerService, ProgressButtonService, ConfirmationDialogService,
            {
                provide: HttpClientService,
                useFactory: httpClientServiceCreator,
                deps: [HttpClient, UtilityService, AuthService]
            },
            {
                provide: Router,
                useValue: class { navigate = jasmine.createSpy("navigate"); }
            },

            {
                provide: ActivatedRoute,
                useValue:
                {
                    snapshot: { paramMap: convertToParamMap({ 'locationGroupCode': '123457' }) },
                    params: {
                        subscribe: (fn: (value: Params) => void) => fn({
                            locationGroupCode: 123457,
                            siteId: 1234
                        }),
                    },
                }
            }
        ]
    })
        .compileComponents();

   
        httpMock = TestBed.get(HttpTestingController);
        var respData = {
            items: {
                "ctTenant": {
                    "sites": [{
                        "tenantId": 20072,
                        "masterCatalogId": 1,
                        "catalogId": 2,
                        "countryCode": "US",
                        "defaultLocaleCode": "en-US",
                        "defaultCurrencyCode": "USD",
                        "isMozuRendered": true,
                        "id": 1234
                    }]
                }
            }
        };

        const req = httpMock.expectOne(GlobalConstant.webApis.getSharedData);
        expect(req.request.method).toBe("GET");
        req.flush(respData);
        httpMock.verify();

        fixture = TestBed.createComponent(LocationGroupConfigComponent);
        component = fixture.debugElement.componentInstance;
        createLocationGroupService = fixture.debugElement.injector.get(LocationGroupConfigService);

        loggerService = TestBed.get(LoggerService);
        loggerServiceSpy = spyOn(loggerService, 'info').and.callThrough();
        

    }));

    it('should called', () => {
        expect(component).toBeTruthy();
    });

    it("should initiate values when Angular calls ngOnInit()", async(() => {

        const spy = spyOn(component, 'fetchLocationGroupConfig');
        component.ngOnInit();   
        fixture.whenStable().then(() => {
            expect(spy).toHaveBeenCalled();
            expect(component.model.subscriptions.length).toEqual(2);
            expect(component.model.LCCustomerPickupActions.length).toEqual(2);
            expect(component.model.LCCustomerPickupReminders.length).toEqual(5);
            expect(component.model.packageSettingUnitTypes.length).toEqual(2);
            expect(component.model.LCPrintReturnLabel.length).toEqual(2);
             
        });

    }));

    it("should get all service data for location group config", async(() => {
        const getCarrierSettings = spyOn(createLocationGroupService, 'getCarrierSettings').and.callThrough();
        const getLocationGroupConfig = spyOn(createLocationGroupService, 'getLocationGroupConfig').and.callThrough();
        const getAllCarrierRatesWithConfiguredInfo = spyOn(createLocationGroupService, 'getAllCarrierRatesWithConfiguredInfo').and.callThrough();
        const getCarrierAccountSets = spyOn(createLocationGroupService, 'getCarrierAccountSets').and.callThrough();
        const getCarrierAccount = spyOn(createLocationGroupService, 'getCarrierAccount').and.callThrough();
        component.model = new LocationGroupConfigModel()
        component.model.uspsCarrierAccountPagination == {} as PagniatedNgSelectPageConfiguration;
        component.model.canadaPostCarrierAccountPagination == {} as PagniatedNgSelectPageConfiguration;
        component.model.purolatorCarrierAccountPagination == {} as PagniatedNgSelectPageConfiguration;
        component.model.uspsCarrierAccountPagination = Constants.UspsCarrierAccountPageConfig;
        component.model.canadaPostCarrierAccountPagination = Constants.CanadaPostCarrierAccountPageConfig;
        component.model.purolatorCarrierAccountPagination = Constants.PurolatorCarrierAccountPageConfig;
        component.fetchLocationGroupConfig(123457, 1234);
        fixture.whenStable().then(() => {
            expect(getCarrierSettings).toHaveBeenCalled();
            expect(getLocationGroupConfig).toHaveBeenCalled();
            expect(getAllCarrierRatesWithConfiguredInfo).toHaveBeenCalled();
            expect(getCarrierAccountSets).toHaveBeenCalled();
            expect(getCarrierAccount).toHaveBeenCalled();
        })

    }));

    it("should get selected value for purolator carrier when user select the value in paginated-ngSelect ", async(() => {
        component.model = new LocationGroupConfigModel()
        const obj = {
            data: "16a4a4ab497d4db5968fab8400668695",
            label: 'test',
        };
        component.model.purolatorCarrierAccount = [];
        component.getSelectedPurolatorCarrier(obj);
        expect(component.model.purolatorCarrierAccount).toEqual(obj);

    }));

    it("should get selected value for canadapost carrier when user select the value in paginated-ngSelect ", async(() => {
        component.model = new LocationGroupConfigModel()
        const obj = {
            data: "16a4a4ab497d4db5968fab8400668695",
            label: 'test',
        };
        component.model.canadaPostCarrierAccount = [];
        component.getSelectedCanadaPostCarrier(obj);
        expect(component.model.canadaPostCarrierAccount).toEqual(obj);

    }));

    it("should get selected value for USPS carrier when user select the value in paginated-ngSelect ", async(() => {
        component.model = new LocationGroupConfigModel()
        const obj = {
            data: "16a4a4ab497d4db5968fab8400668695",
            label: 'test',
        };
        component.model.uspsCarrierAccount = [];
        component.getSelectedUSPSCarrier(obj);
        expect(component.model.uspsCarrierAccount).toEqual(obj);

    }));

    it("should get selected value for purolator carrier when user select the value in paginated-ngSelect ", async(() => {
        component.model = new LocationGroupConfigModel()
        spyOn(createLocationGroupService, 'getCarrierAccountSets').and.callThrough();
        fixture.detectChanges();
        const obj = {
            startIndex: 1,
            pageSize: 10,
            query: "",
        };
        component.getPurolatorCarrierAccounts(obj);
        fixture.whenStable().then(() => {
            expect(createLocationGroupService.getCarrierAccountSets).toHaveBeenCalled();
        });

    }));

    it("should get called getCanadaPostCarrierAccounts when page index change in paginated-ngSelect component ", async(() => {
        component.model = new LocationGroupConfigModel()
        spyOn(createLocationGroupService, 'getCarrierAccountSets').and.callThrough();
        fixture.detectChanges();
        const obj = {
            startIndex: 1,
            pageSize: 10,
            query: "",
        };
        component.getCanadaPostCarrierAccounts(obj);
        fixture.whenStable().then(() => {
            expect(createLocationGroupService.getCarrierAccountSets).toHaveBeenCalled();
        });

    }));

    it("should get called getUSPSCarrierAccounts when page index change in paginated-ngSelect component ", async(() => {
        component.model = new LocationGroupConfigModel()
        spyOn(createLocationGroupService, 'getCarrierAccountSets').and.callThrough();
        fixture.detectChanges();
        const obj = {
            startIndex: 1,
            pageSize: 10,
            query: "",
        };
        component.getUSPSCarrierAccounts(obj);
        fixture.whenStable().then(() => {
            expect(createLocationGroupService.getCarrierAccountSets).toHaveBeenCalled();
        });
    }));
})