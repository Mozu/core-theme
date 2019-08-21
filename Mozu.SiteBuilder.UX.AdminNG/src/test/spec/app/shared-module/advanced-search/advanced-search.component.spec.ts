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
import { NavigationContainerType } from '@shared/infrastructure';
import { AdvancedFilterModel, QuoteFilter } from '@shared/advanced-search';

describe('SearchBarComponent', () => {
    let component: AdvancedSearchComponent;
    let fixture: ComponentFixture<AdvancedSearchComponent>;
    let debugElement: DebugElement;
    let element: HTMLElement;
    let inputElement: HTMLInputElement;
    let notificationService: NotificationService;
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot(), HttpClientModule, HttpClientTestingModule, GlobalModule],
            declarations: [AdvancedSearchComponent],
            schemas: [NO_ERRORS_SCHEMA],
            providers: [By, TranslateService, LoggerService,
                UtilityService, EnvironmentConfig, AuthService,
                SharedDataService, NotificationService, FormBuilder, TostrService, NGXLoggerHttpService, CustomNGXLoggerService,
                AdvancedFilterModel, QuoteFilter,
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
        component.quoteFilter.quoteName = 'Test quote name';
        component.quoteFilter.quoteId = 11;
        component.model.status = true;
        component.modelChanged();
        expect(component.model.searchBox).toEqual(component.quoteFilter.searchBarkeyword + component.quoteFilter.searchBarQuoteName + component.quoteFilter.searchBarQuoteId);
    });

    it('should call isFieldSupported () to bind key value to model', () => {
        fixture.detectChanges();
        let match;
        const keyField = 'quoteName';
        enum QuotesAdvFilterFields {
            quoteName = 'quoteName',
            quoteId = 'quoteId'
        }
        component.isFieldSupported(keyField);
        match = Object.keys(QuotesAdvFilterFields).filter(index => QuotesAdvFilterFields[index] === keyField);
        expect(match !== null ).toEqual(true);
    });

    it('should call addKeyValue() to bind key value to model', () => {
        fixture.detectChanges();
        const keyValueDelimiter = ':';
        const key = 'quoteName';
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
        const index  = 1;
        component.model.lastKey = 'quoteName';
        component.addKeywordOrAppendToLastKey (item, index);
        if (component.model.lastKey) {
            expect(component.quoteFilter[component.model.lastKey] ).toEqual((item).trim());
        }
    });

    it('should call resetAdvancedFilterValue () to reset model values', () => {
        fixture.detectChanges();
        component.resetAdvancedFilterValue();
        expect(component.quoteFilter.quoteId).toBeNull();
    });
});
