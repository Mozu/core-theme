import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, DebugElement } from '@angular/core';
import { LoggerService, TostrService, EnvironmentConfig, HttpClientService, httpClientServiceCreator, UtilityService, AuthService } from '@core';
import { By } from '@angular/platform-browser';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormBuilder } from '@angular/forms';
import { Observable } from 'rxjs';
import { GlobalModule } from '@global/global.module';
import { CustomNGXLoggerService, NGXLoggerHttpService } from 'ngx-logger';
import { SharedDataService, NotificationService } from '@global';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AdvancedSearchComponent } from '@shared/advanced-search/advanced-search.component';
import { NavigationContainerType, Constants } from '@shared/infrastructure';
import { AdvancedFilterModel, QuoteFilter } from '@shared/advanced-search';
import { DateTypecastPipe } from '@shared';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from '@shared/shared.module';
import { DatePipe } from '@angular/common';
fdescribe('AdvancedSearchComponent', () => {
    let component: AdvancedSearchComponent;
    let fixture: ComponentFixture<AdvancedSearchComponent>;
    let debugElement: DebugElement;
    let element: HTMLElement;
    let inputElement: HTMLInputElement;
    let notificationService: NotificationService;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot(), HttpClientModule, HttpClientTestingModule, GlobalModule, NgbModule],
            declarations: [AdvancedSearchComponent, DateTypecastPipe],
            schemas: [NO_ERRORS_SCHEMA],
            providers: [By, TranslateService, LoggerService,
                UtilityService, EnvironmentConfig, AuthService,
                SharedDataService, NotificationService, FormBuilder, TostrService, NGXLoggerHttpService, CustomNGXLoggerService,
                AdvancedFilterModel, QuoteFilter, DatePipe,
                {
                    provide: HttpClientService,
                    useFactory: httpClientServiceCreator,
                    deps: [HttpClient, UtilityService, AuthService]
                }
            ]
        })
            .compileComponents();
        notificationService = TestBed.get(NotificationService);
    }));
    beforeEach(() => {
        fixture = TestBed.createComponent(AdvancedSearchComponent);
        component = fixture.componentInstance;
        debugElement = fixture.debugElement;
        element = debugElement.nativeElement;
    });
    it('should create', () => {
        expect(component).toBeTruthy();
    });
    it('should call toggleIcon()', () => {
        fixture.detectChanges();
        const event = { 'currentTarget': { 'value': 'abc' } };
        component.model.status = event.currentTarget ? event.currentTarget.value.length > 0 : false;
        component.toggleIcon(event);
        expect(component.model.status).toBe(true);
    });
    it('should search component should recieve input data', () => {
        fixture.detectChanges();
        inputElement = fixture.debugElement.query(By.css('#quote-search-input')).nativeElement;
        inputElement.value = 'sam';
        inputElement.dispatchEvent(new Event('input'));
        fixture.whenStable().then(() => {
            fixture.detectChanges();
            expect(inputElement.value).toEqual('sam');
        });
    });
    it('should notify component to reset search data on grid resetSerach()', async(() => {
        const searchValue = '';
        fixture.detectChanges();
        component.model.status = false;
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
        component.model.status = false;
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

    it('should call modelChanged() to bind value to search bar', () => {
        fixture.detectChanges();
        component.quoteFilter.keyword = 'Test keyword';
        component.quoteFilter.name = 'Test quote name';
        component.quoteFilter.quoteId = 11;
        component.model.status = true;
        component.modelChanged(Event, '');
        expect(component.model.searchField).toEqual(component.quoteFilter.getSearchBarkeyword + component.quoteFilter.getSearchBarQuoteName + component.quoteFilter.getSearchBarQuoteId);
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
        expect(match !== null ).toEqual(true);
    });

    it('should call addKeyValue() to bind key value to model', () => {
        fixture.detectChanges();
        const keyValueDelimiter = ':';
        const key = 'name';
        const item = 'Device Config';
        const colonIndex = 0;
        component.quoteFilter[key] = item.substr(colonIndex + keyValueDelimiter.length);
        component.addKeyValue(key, item, colonIndex);
        expect(component.model.lastKey).toEqual(key);
    });

    it('should call addKeywordOrAppendToLastKey () to bind value to search bar for keyword', () => {
        fixture.detectChanges();
        const item = 'Device Config';
        const index  = 0;
        component.addKeywordOrAppendToLastKey (item, index);
        if (index === 0) {
            component.model.lastKey = 'keyword';
            expect(component.quoteFilter[component.model.lastKey] ).toEqual(item);
        }
    });

    it('should call addKeywordOrAppendToLastKey () to bind value to search bar based on last key', () => {
        fixture.detectChanges();
        const item = 'Device Config';
        const index = 1;
        component.model.lastKey = 'name';
        component.addKeywordOrAppendToLastKey(item, index);
        if (component.model.lastKey) {
            expect(component.quoteFilter[component.model.lastKey] ).toEqual((item).trim());
        }
    });

    it('should call resetAdvancedFilterValue () to reset model values', () => {
        fixture.detectChanges();
        component.resetAdvancedFilterValue();
        expect(component.quoteFilter.quoteId).toBeNull();
    });
    it(`should have input field 'Keyword'`, async(() => {
        fixture.detectChanges();
        inputElement = fixture.debugElement.query(By.css('#keyword')).nativeElement;
        inputElement.value = 'walmart';
        inputElement.dispatchEvent(new Event('input'));
        fixture.whenStable().then(() => {
            fixture.detectChanges();
            expect(inputElement.value).toEqual('walmart');
        });
    }));
    it(`should have input field 'Quote Name'`, async(() => {
        fixture.detectChanges();
        inputElement = fixture.debugElement.query(By.css('#quoteName')).nativeElement;
        inputElement.value = 'Quote 1';
        inputElement.dispatchEvent(new Event('input'));
        fixture.whenStable().then(() => {
            fixture.detectChanges();
            expect(inputElement.value).toEqual('Quote 1');
        });
    }));
    it(`should have input field 'QuoteId'`, async(() => {
        fixture.detectChanges();
        inputElement = fixture.debugElement.query(By.css('#quoteId')).nativeElement;
        inputElement.value = '101';
        inputElement.dispatchEvent(new Event('input'));
        fixture.whenStable().then(() => {
            fixture.detectChanges();
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
        inputElement.dispatchEvent(new Event('input'));
        fixture.whenStable().then(() => {
            fixture.detectChanges();
            expect(inputElement.value).toEqual('walmart');
        });
    }));
    it(`should have input field 'Account User'`, async(() => {
        fixture.detectChanges();
        inputElement = fixture.debugElement.query(By.css('#accountUserName')).nativeElement;
        inputElement.value = 'foo';
        inputElement.dispatchEvent(new Event('input'));
        fixture.whenStable().then(() => {
            fixture.detectChanges();
            expect(inputElement.value).toEqual('foo');
        });
    }));
    it(`should have input field 'Expiration Date From'`, async(() => {
        fixture.detectChanges();
        inputElement = fixture.debugElement.query(By.css('input[name=expirationFrom]')).nativeElement;
        inputElement.value = '27-08-2019';
        inputElement.dispatchEvent(new Event('input'));
        fixture.whenStable().then(() => {
            fixture.detectChanges();
            expect(inputElement.value).toEqual('27-08-2019');
        });
    }));
    it(`should have input field 'Expiration Date To'`, async(() => {
        fixture.detectChanges();
        inputElement = fixture.debugElement.query(By.css('input[name=expirationTo]')).nativeElement;
        inputElement.value = '30-08-2019';
        inputElement.dispatchEvent(new Event('input'));
        fixture.whenStable().then(() => {
            fixture.detectChanges();
            expect(inputElement.value).toEqual('30-08-2019');
        });
    }));

    it('should call fieldValidations() for validation like to-date should be greater than from-date', () => {
        fixture.detectChanges();
        const expirationTo = '2019-08-08T12:00:00+05:30';
        const expirationFrom = '2019-08-08T12:00:00+05:30';
        component.fieldValidations();
        if (new Date(expirationTo) < new Date(expirationFrom)) {
            component.model.isExpirationToValid = true;
          } else {
            component.model.isExpirationToValid = false;
          }
          expect(component.model.isExpirationToValid).toBeFalsy();
    });

    it('should call fieldValidations() for validation like to-date is not greater than from-date', () => {
        fixture.detectChanges();
        const expirationTo = '2019-07-08T12:00:00+05:30';
        const expirationFrom = '2019-08-08T12:00:00+05:30';
        component.fieldValidations();
        if (new Date(expirationTo) < new Date(expirationFrom)) {
            component.model.isExpirationToValid = true;
          } else {
            component.model.isExpirationToValid = false;
          }
          expect(component.model.isExpirationToValid).toBeTruthy();
    });

    it('should call setDateValueToModel() to bind exirationDateFrom in valid date format', () => {
        fixture.detectChanges();
        const keyField = 'from';
        const event = 'Thu Aug 08 2019 12:00:00 GMT+0530 (India Standard Time)';
        component.setDateValueToModel(event, keyField);
        component.quoteFilter.setSearchBarExpirationFrom = new DatePipe('en-US').transform(event, Constants.advSearchDateFormat);
        expect(component.quoteFilter.getSearchBarExpirationFrom).toEqual(('expirationFrom:2019-08-08T12:00:00+05:30 '));
    });

    it('should call setDateValueToModel() to bind exirationDateTo in valid date format', () => {
        fixture.detectChanges();
        const keyField = 'to';
        const event = 'Thu Aug 08 2019 12:00:00 GMT+0530 (India Standard Time)';
        component.setDateValueToModel(event, keyField);
        component.quoteFilter.setSearchBarExpirationTo = new DatePipe('en-US').transform(event, Constants.advSearchDateFormat);
        expect(component.quoteFilter.getSearchBarExpirationTo).toEqual(('expirationTo:2019-08-08T12:00:00+05:30 '));
    });
    it(`should have input field 'Project Name'`, async(() => {
        fixture.detectChanges();
        inputElement = fixture.debugElement.query(By.css('#projectName')).nativeElement;
        inputElement.value = 'foo';
        inputElement.dispatchEvent(new Event('input'));
        fixture.whenStable().then(() => {
            fixture.detectChanges();
            expect(inputElement.value).toEqual('foo');
        });
    }));
});
