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
        const event = { 'currentTarget': { 'value': 'abc' } };
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
});
