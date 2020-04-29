
import { PaginatedNgSelectComponent } from '@shared/paginated-ngselect/paginated-ngselect.component';
import { PagingConfiguration, ngSelectPaginatorModel } from '@shared/paginated-ngselect/paginated-ngselect.model';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, DebugElement } from '@angular/core';
import { LoggerService, TostrService, EnvironmentConfig, HttpClientService, httpClientServiceCreator, UtilityService, AuthService } from '@core';
import { By } from '@angular/platform-browser';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CustomNGXLoggerService, NGXLoggerHttpService } from 'ngx-logger';
import { SharedDataService, NotificationService } from '@global';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

//added this code to handle the timeout error while calling debounce
declare let Zone: any;
const { fakeAsync, tick } = Zone[Zone.__symbol__('fakeAsyncTest')];


describe('paginated-ngselect component', () => {
    let component: PaginatedNgSelectComponent;
    let fixture: ComponentFixture<PaginatedNgSelectComponent>;
    let element: HTMLElement;
    let debugElement: DebugElement;
    let loggerService: LoggerService;
    let loggerServiceSpy: any;


    beforeEach(async(() => {

        TestBed.configureTestingModule({
            schemas: [NO_ERRORS_SCHEMA],
            imports: [HttpClientModule, HttpClientTestingModule],
            providers: [By, TranslateService, LoggerService,
                UtilityService, AuthService,
                 NotificationService, NGXLoggerHttpService, CustomNGXLoggerService,
                
               ],
            declarations: [PaginatedNgSelectComponent],

        })
            .compileComponents();
       
        // To inject services using spyOn
       
        loggerService = TestBed.get(LoggerService);
        loggerServiceSpy = spyOn(loggerService, 'info').and.callThrough();

        fixture = TestBed.createComponent(PaginatedNgSelectComponent);
        component = fixture.componentInstance;
        debugElement = fixture.debugElement;



    }));

    it('Should create paginated-ngselect Component', () => {
        expect(component).toBeDefined();
    });

    it(' should called when ng-select paginator event called', () => {
        const obj = {
            first: 10,
            rows:10,
        }
        spyOn(component.ngSelectPaginatorPageIndexChanged, 'emit');
        const pageconfig = {} as PagingConfiguration;
        pageconfig.pageSize = 10;
        pageconfig.startIndex = 10;
        pageconfig.query = ""
        component.model = new ngSelectPaginatorModel();
        component.pageConfig == {} as PagingConfiguration;
        component.pageConfig =
        {
            startIndex: 10,
            pageSize: 10,
            query: "",
            isMultiSelect: false,
            placeholder: 'Search',
            totalRecordCount: 0,
            id: "USPSCarrierAccount"

        }
        component.pageIndexChanged(obj)
        expect(component.ngSelectPaginatorPageIndexChanged.emit).toHaveBeenCalledWith(pageconfig);

    })

    it(' should called when ng-select change event called', () => {
        const obj = {
            data:"16a4a4ab497d4db5968fab8400668695",
            label: 'test',
        }
        spyOn(component.ngSelectPaginatorPageIndexChanged, 'emit');
        spyOn(component.ngSelectPaginatorSelectionChanged, 'emit');
        const pageconfig = {} as PagingConfiguration;
        pageconfig.pageSize = 10;
        pageconfig.startIndex = 0;
        pageconfig.query = ""
        component.model = new ngSelectPaginatorModel();
        component.pageConfig == {} as PagingConfiguration;
        component.pageConfig =
        {
            startIndex: 0,
            pageSize: 10,
            query: "",
            isMultiSelect: false,
            placeholder: 'Search',
            totalRecordCount: 0,
            id:"USPSCarrierAccount"
        }
        component.selectedValueChanged(obj)
        expect(component.ngSelectPaginatorSelectionChanged.emit).toHaveBeenCalledWith(obj);
        expect(component.ngSelectPaginatorPageIndexChanged.emit).toHaveBeenCalledWith(pageconfig);

    })


    it(' should called when ng-select search event called', fakeAsync(() => {
        const obj = {
            term:'test'
        }
        spyOn(component.ngSelectPaginatorPageIndexChanged, 'emit');
        const pageconfig = {} as PagingConfiguration;
        pageconfig.pageSize = 10;
        pageconfig.startIndex = 0;
        pageconfig.query = "test"
        component.model = new ngSelectPaginatorModel();
        component.pageConfig == {} as PagingConfiguration;
        component.pageConfig =
        {
            startIndex: 0,
            pageSize: 10,
            query: "",
            isMultiSelect: false,
            placeholder: 'Search',
            totalRecordCount: 0,
            id: "USPSCarrierAccount"

        }
        
        component.onSearch(obj)
        tick(1000);
        expect(component.ngSelectPaginatorPageIndexChanged.emit).toHaveBeenCalledWith(pageconfig);

    }))

})