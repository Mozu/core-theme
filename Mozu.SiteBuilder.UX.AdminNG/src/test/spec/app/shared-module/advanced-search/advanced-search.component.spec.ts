import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, DebugElement } from '@angular/core';
import { LoggerService, TostrService, EnvironmentConfig, HttpClientService, httpClientServiceCreator, UtilityService, AuthService } from '@core';
import { By } from '@angular/platform-browser';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { FormBuilder, FormsModule, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { GlobalModule } from '@global/global.module';
import { CustomNGXLoggerService, NGXLoggerHttpService } from 'ngx-logger';
import { SharedDataService, NotificationService } from '@global';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AdvancedSearchComponent } from '@shared/advanced-search/advanced-search.component';
import { NavigationContainerType, Constants } from '@shared/infrastructure';
import { AdvancedFilterModel, FilterModel } from '@shared/advanced-search';
import { DateTypecastPipe } from '@shared';
import { NgbModule, NgbDateAdapter, NgbDateNativeAdapter } from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from '@shared/shared.module';
import { DatePipe } from '@angular/common';
import { environment } from '@env';
import { AccountInfoService } from '@shared/account/information/information.service';
import { NgSelectModule } from '@ng-select/ng-select';
import { DateService } from '@shared/datepicker/datepicker.service';
import { DateCompareDirective } from '@shared/directive/datepicker-compare-validator.directive';
import { ProgressButtonService } from '@shared/progress-button/progress-button.service';
import { TableModule } from 'primeng/table';
import { DatepickerComponent } from '@shared/datepicker/datepicker.component';
import { QuoteFilterModel } from 'app/quotes-module/quote-filter.model';
describe('AdvancedSearchComponent', () => {
    let component: AdvancedSearchComponent;
    let fixture: ComponentFixture<AdvancedSearchComponent>;
    let debugElement: DebugElement;
    let element: HTMLElement;
    let inputElement: HTMLInputElement;
    let notificationService: NotificationService;
    let httpMock: HttpTestingController;
    const mockErrorResponse = { status: 400, statusText: 'Bad Request' };
    let loggerService: LoggerService;
    let loggerServiceSpy: any;

    const dummyAccountList = {
        'success': true,
        'total': 3,
        'items': [{
            'isPoEnabled': false,
            'id': 1021,
            'customerSet': 'default',
            'segments': [{
                'id': 1,
                'code': 'seg1',
                'name': 'Segment1',
                'description': '',
                'auditInfo': {
                    'updateDate': '2016-03-24T13:56:53.677Z',
                    'createDate': '2016-03-24T13:56:53.677Z',
                    'updateBy': '355060a60a5e48eeb7f2fb8d92af2ba5',
                    'createBy': '355060a60a5e48eeb7f2fb8d92af2ba5'
                }
            }],
            'contacts': [{
                'accountId': 1021,
                'isShipping': true,
                'isPrimaryShipping': false,
                'isBilling': true,
                'isPrimaryBilling': false,
                'id': 1007,
                'email': 'shel@admin.com',
                'firstName': 'Michele',
                'lastName': 'Keller',
                'address1': '5700 Tapadera Trace Ln',
                'address2': 'Apt 536',
                'cityOrTown': 'Austin',
                'countryCode': 'US',
                'postalOrZipCode': '78758',
                'stateOrProvince': 'TX',
                'addressIsValidated': false,
                'addressType': 'Residential',
                'homePhone': '1231231234'
            }],
            'companyOrOrganization': 'Shel Tamagotchis',
            'isActive': true,
            'attributes': [],
            'notes': [],
            'taxExempt': false,
            'visitCount': 18,
            'siteId': 0,
            'totalSpent': 0,
            'orderCount': 0,
            'wishlistCount': 0,
            'createDate': '2019-04-12T18:49:24.655Z',
            'segmentIds': [
                1
            ],
            'isLocked': false,
            'isDisabled': false,
            'customerSinceDate': '2019-04-12T18:49:24.655Z',
            'users': [{
                'emailAddress': 'sparkbell@gmail.com',
                'userName': 'sparkbell@gmail.com',
                'firstName': 'Michele',
                'lastName': 'Keller',
                'localeCode': 'en-US',
                'userId': '50872202bca6431681fbf1a0dca8bdd5',
                'isLocked': false,
                'isActive': true,
                'isRemoved': false,
                'hasExternalPassword': false
            },
            {
                'emailAddress': 'a@b.com',
                'userName': 'a@b.com',
                'firstName': 'a',
                'lastName': 'b',
                'localeCode': 'en-US',
                'userId': '558f6588c70c465584cc7643151574c9',
                'isLocked': false,
                'isActive': true,
                'isRemoved': false,
                'hasExternalPassword': false
            },
            {
                'emailAddress': 'shel@admin.com',
                'userName': 'shel@admin.com',
                'firstName': 'Shel',
                'lastName': 'Tamagotchi',
                'localeCode': 'en-us',
                'userId': '5fcf7948b62d400d990c5d38a08f555b',
                'isLocked': false,
                'isActive': true,
                'isRemoved': false,
                'hasExternalPassword': false
            },
            {
                'emailAddress': 'mtamagotchi@admin.com',
                'userName': 'mtamagotchi@admin.com',
                'firstName': 'Mr',
                'lastName': 'Tamagotchi',
                'localeCode': 'en-US',
                'userId': '9949b7d50384439d9232f27204283759',
                'isLocked': false,
                'isActive': true,
                'isRemoved': false,
                'hasExternalPassword': false
            },
            {
                'emailAddress': 's@k.com',
                'userName': 's@k.com',
                'firstName': 's',
                'lastName': 'k',
                'localeCode': 'en-US',
                'userId': 'c421af01d5104e4285ed0e0e373cfdc1',
                'isLocked': false,
                'isActive': true,
                'isRemoved': false,
                'hasExternalPassword': false
            },
            {
                'emailAddress': 'akeller@admin.com',
                'userName': 'akeller@admin.com',
                'firstName': 'avery',
                'lastName': 'keller',
                'localeCode': 'en-US',
                'userId': 'cae237b8a82d4d5e9b320cd10092eab4',
                'isLocked': false,
                'isActive': true,
                'isRemoved': false,
                'hasExternalPassword': false
            }
            ],
            'priceList': 'test'
        }
        ]
    };

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot(), HttpClientModule, HttpClientTestingModule, FormsModule, ReactiveFormsModule, NgSelectModule, TableModule, GlobalModule, NgbModule],
            declarations: [AdvancedSearchComponent, DateTypecastPipe, DateCompareDirective, DatepickerComponent],
            schemas: [NO_ERRORS_SCHEMA],
            providers: [By, TranslateService, LoggerService,
                UtilityService, EnvironmentConfig, AuthService,
                SharedDataService, NotificationService, FormBuilder, TostrService, NGXLoggerHttpService, CustomNGXLoggerService,
                AdvancedFilterModel, FilterModel, QuoteFilterModel, DatePipe, DateService, AccountInfoService,
                {
                    provide: HttpClientService,
                    useFactory: httpClientServiceCreator,
                    deps: [HttpClient, UtilityService, AuthService]
                },
                ProgressButtonService,
                {
                    provide: NgbDateAdapter,
                    useClass: NgbDateNativeAdapter
                }
            ]
        })
            .compileComponents();
        loggerService = TestBed.get(LoggerService);
        httpMock = TestBed.get(HttpTestingController);
        notificationService = TestBed.get(NotificationService);
        loggerServiceSpy = spyOn(loggerService, 'info').and.callThrough();
    }));
    beforeEach(() => {
        fixture = TestBed.createComponent(AdvancedSearchComponent);
        component = fixture.componentInstance;
        debugElement = fixture.debugElement;
        element = debugElement.nativeElement;

        const respData = {
            items: {
                'ctTaContext': {
                    'masterCatalogs': [{
                        'sites': [{
                            'id': '1234'
                        }]
                    }]
                }
            }
        };

        httpMock = TestBed.get(HttpTestingController);
        const req = httpMock.expectOne(`./assets/json/user-data.json`);
        expect(req.request.method).toBe('GET');
        req.flush(respData);
        httpMock.verify();
    });
    it('should create', () => {
        expect(component).toBeTruthy();
    });
    it('should call toggleIcon()', () => {
        fixture.detectChanges();
        const event = { 'currentTarget': { 'value': 'abc' } };
        component.model.isIconToggled = event.currentTarget ? event.currentTarget.value.length > 0 : false;
        component.toggleIcon(event);
        expect(component.model.isIconToggled).toBe(true);
    });
    it('search component should recieve input data', () => {
        fixture.detectChanges();
        fixture.whenStable().then(() => {
            inputElement = fixture.debugElement.query(By.css('#quote-search-input')).nativeElement;
            inputElement.value = 'sam';
            inputElement.dispatchEvent(new Event('input'));
            expect(inputElement.value).toEqual('sam');
        });

    });
    it('should notify component to reset search data on grid resetSerach()', async(() => {
        const searchValue = '';
        fixture.detectChanges();
        component.model.isIconToggled = false;
        component.navigationContainerType = 'quotes';
        inputElement = fixture.debugElement.query(By.css('#quote-search-input')).nativeElement;
        fixture.detectChanges();
        const spy = spyOn(notificationService, 'notifyQuoteSearched').and.returnValue(
            Observable.of(searchValue)
        );
        component.resetSerach(inputElement);
        fixture.whenStable().then(() => {
            fixture.detectChanges();
            expect(component.navigationContainerType).toEqual(NavigationContainerType.quotes);
            expect(spy.calls.any()).toEqual(true);
        });
    }));
    it('should notify component to search data on grid search()', async(() => {
        const searchValue = 'sam';
        fixture.detectChanges();
        component.model.isIconToggled = false;
        component.navigationContainerType = 'quotes';
        inputElement = fixture.debugElement.query(By.css('#quote-search-input')).nativeElement;
        fixture.detectChanges();
        const spy = spyOn(notificationService, 'notifyQuoteSearched').and.returnValue(
            Observable.of(searchValue)
        );
        component.search(searchValue);
        fixture.whenStable().then(() => {
            fixture.detectChanges();
            expect(component.navigationContainerType).toEqual(NavigationContainerType.quotes);
            expect(spy.calls.any()).toEqual(true);
        });
    }));
    it('should call modelChanged () to bind value to search bar', () => {
        fixture.detectChanges();
        component.model.searchField = 'name:aaa ';
        component.model.isIconToggled = true;
        component.modelChanged();
        expect(component.model.searchField).toEqual(component.model.populateSearchField);
    });
    it('should call setAdvancedFilterValue() to bind value to search bar', () => {
        fixture.detectChanges();
        const filterValue = 'Device Config name: Test';
        const spy = spyOn(component, 'addKeywordOrAppendToLastKey');
        component.setAdvancedFilterValue(filterValue);
        expect(spy).toHaveBeenCalled();
    });

    it('should call isFieldSupported () to bind key value to model', () => {
        fixture.detectChanges();
        let match;
        const keyField = 'name';
        enum QuotesAdvFilterFields {
            name = 'name',
            quoteId = 'quoteId'
        }
        component.isFieldSupported(keyField);
        match = Object.keys(QuotesAdvFilterFields).filter(index => QuotesAdvFilterFields[index] === keyField);
        expect(match !== null).toEqual(true);
    });
    it('should call addKeyValue() to bind key value to model', () => {
        fixture.detectChanges();
        const keyValueDelimiter = ':';
        const key = 'name';
        const item = 'Device Config';
        const colonIndex = 0;
        component.filterModel[key] = item.substr(colonIndex + keyValueDelimiter.length);
        component.addKeyValue(key, item, colonIndex);
        expect(component.model.lastKey).toEqual(key);
    });
    it('should call addKeywordOrAppendToLastKey () to bind value to search bar for keyword', () => {
        fixture.detectChanges();
        const item = 'Device Config';
        const index = 0;
        component.addKeywordOrAppendToLastKey(item, index);
        component.model.lastKey = 'keyword';
        expect(component.filterModel[component.model.lastKey]).toEqual(item);
    });
    it('should call addKeywordOrAppendToLastKey () to bind value to search bar based on last key', () => {
        fixture.detectChanges();
        const item = 'Device Config';
        const index = 1;
        component.model.lastKey = 'name';
        component.addKeywordOrAppendToLastKey(item, index);
        expect(component.filterModel[component.model.lastKey]).toEqual((item).trim());
    });

    it(`should have input field 'Keyword'`, async(() => {
        fixture.detectChanges();
        fixture.whenStable().then(() => {
            inputElement = fixture.debugElement.query(By.css('#keyword')).nativeElement;
            inputElement.value = 'walmart';
            inputElement.dispatchEvent(new Event('input'));
            expect(inputElement.value).toEqual('walmart');
        });
    }));
    it(`should have input field 'Quote Name'`, async(() => {
        fixture.detectChanges();
        fixture.whenStable().then(() => {
            inputElement = fixture.debugElement.query(By.css('#quoteName')).nativeElement;
            inputElement.value = 'Quote 1';
            inputElement.dispatchEvent(new Event('input'));
            expect(inputElement.value).toEqual('Quote 1');
        });
    }));
    it(`should have input field 'QuoteId'`, async(() => {
        fixture.detectChanges();
        fixture.whenStable().then(() => {
            inputElement = fixture.debugElement.query(By.css('#quoteId')).nativeElement;
            inputElement.value = '101';
            inputElement.dispatchEvent(new Event('input'));
            expect(inputElement.value).toEqual('101');
        });

    }));
    it(`should call the search method`, async(() => {
        fixture.detectChanges();
        const spy = spyOn(component, 'search');
        element = fixture.debugElement.query(By.css('#btnFilter')).nativeElement;
        element.click();
        expect(spy).toHaveBeenCalledWith('');
    }));
    it(`should have input field 'Account Name'`, async(() => {
        fixture.detectChanges();
        inputElement = fixture.debugElement.query(By.css('#accountName')).nativeElement;
        inputElement.value = 'walmart';
        inputElement.dispatchEvent(new Event('ng-select'));
        fixture.whenStable().then(() => {
            fixture.detectChanges();
            expect(inputElement.value).toEqual('walmart');
        });
    }));
    it(`should have input field 'Account User'`, async(() => {
        fixture.detectChanges();
        fixture.whenStable().then(() => {
            inputElement = fixture.debugElement.query(By.css('#accountUserName')).nativeElement;
            inputElement.value = 'foo';
            inputElement.dispatchEvent(new Event('input'));
            expect(inputElement.value).toEqual('foo');
        });

    }));
    it(`should have input field 'Expiration Date From'`, async(() => {
        fixture.detectChanges();
        inputElement = fixture.debugElement.query(By.css('datepicker[name=expirationFrom]')).nativeElement;
        inputElement.value = '27-08-2019';
        inputElement.dispatchEvent(new Event('datepicker'));
        fixture.whenStable().then(() => {
            fixture.detectChanges();
            expect(inputElement.value).toEqual('27-08-2019');
        });
    }));
    it(`should have input field 'Expiration Date To'`, async(() => {
        fixture.detectChanges();
        inputElement = fixture.debugElement.query(By.css('datepicker[name=expirationTo]')).nativeElement;
        inputElement.value = '30-08-2019';
        inputElement.dispatchEvent(new Event('inputdatepicker'));
        fixture.whenStable().then(() => {
            fixture.detectChanges();
            expect(inputElement.value).toEqual('30-08-2019');
        });
    }));

    it(`should have input field 'Project Name'`, async(() => {
        fixture.detectChanges();
        fixture.whenStable().then(() => {
            inputElement = fixture.debugElement.query(By.css('#projectName')).nativeElement;
            inputElement.value = 'foo';
            inputElement.dispatchEvent(new Event('input'));
            expect(inputElement.value).toEqual('foo');
        });
    }));
    it(`should have input field 'Status'`, async(() => {
        fixture.detectChanges();
        inputElement = fixture.debugElement.query(By.css('#status')).nativeElement;
        inputElement.value = 'New';
        inputElement.dispatchEvent(new Event('input'));
        fixture.whenStable().then(() => {
            fixture.detectChanges();
            expect(inputElement.value).toEqual('New');
        });
    }));
    it(`should have input field 'Create Date From'`, async(() => {
        fixture.detectChanges();
        inputElement = fixture.debugElement.query(By.css('datepicker[name=createFrom]')).nativeElement;
        inputElement.value = '27-08-2019';
        inputElement.dispatchEvent(new Event('datepicker'));
        fixture.whenStable().then(() => {
            fixture.detectChanges();
            expect(inputElement.value).toEqual('27-08-2019');
        });
    }));
    it(`should have input field 'Create Date To'`, async(() => {
        fixture.detectChanges();
        inputElement = fixture.debugElement.query(By.css('datepicker[name=createTo]')).nativeElement;
        inputElement.value = '30-08-2019';
        inputElement.dispatchEvent(new Event('inputdatepicker'));
        fixture.whenStable().then(() => {
            fixture.detectChanges();
            expect(inputElement.value).toEqual('30-08-2019');
        });
    }));
    it('should call service to get success response from mock http json (b2b-accounts)', () => {
        component.populateB2BAccounts();
        fixture.detectChanges();
        const req = httpMock.expectOne(environment.appUrl + `/assets/json/b2b-accounts.json`);
        expect(req.request.method).toBe('GET');
        req.flush(dummyAccountList);
        httpMock.verify();
        fixture.detectChanges();
        fixture.whenStable().then(() => {
            expect(dummyAccountList.items[0].companyOrOrganization).toEqual('Shel Tamagotchis');
        });
    });
    it('should call service to get failure response from mock http json (b2b-accounts)', () => {
        component.populateB2BAccounts();
        fixture.detectChanges();
        const req = httpMock.expectOne(environment.appUrl + `/assets/json/b2b-accounts.json`);
        expect(req.request.method).toBe('GET');
        req.flush(dummyAccountList, mockErrorResponse);
        httpMock.verify();
        fixture.detectChanges();
        fixture.whenStable().then(() => {
            expect(loggerServiceSpy).toHaveBeenCalledWith('AccountInformationComponent : _accountInfoService.fetchB2BAccounts_errResponse');
        });
    });
});
