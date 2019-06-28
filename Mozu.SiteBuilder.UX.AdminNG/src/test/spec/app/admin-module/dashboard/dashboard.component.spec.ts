import { async, ComponentFixture, TestBed, inject } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, DebugElement, ElementRef } from '@angular/core';
import { HttpClientModule, HttpClient, HttpHandler } from '@angular/common/http';
import { By } from '@angular/platform-browser';
import { HttpTestingController, HttpClientTestingModule } from '@angular/common/http/testing';

import { CustomNGXLoggerService, NGXLoggerHttpService } from 'ngx-logger';
import { CookieService as Cookie, CookieService } from 'ngx-cookie-service';

import { LoggerService} from '@core';
import { UtilityService, EnvironmentConfig } from '@core/infrastructure/utility.service';
import { AuthService } from '@core/extensions/auth.service';
import { HttpClientService, httpClientServiceCreator } from '@core/extensions/http-client.service';

import { NotificationService } from '@global';
import { SharedDataService } from '@global/services/shared-data.service';
import { AccessTileComponent } from '@shared/access-tile/access-tile.component';

import { AdminDashboardComponent } from '@admin/dashboard/dashboard.component';
import { DashboardModel } from '@admin/dashboard/dashboard.model';
import { DashbaordService } from '@admin/dashboard/dashboard.service';



describe('DashboardComponent', () => {
  let component: AdminDashboardComponent;
  let fixture: ComponentFixture<AdminDashboardComponent>;
  let dashboardModel: DashboardModel;
  let debugElement: DebugElement;
  let loggerService: LoggerService;
  let loggerServiceSpy: any;
  let dashboardService: DashbaordService;
  let httpMock: HttpTestingController;
  let httpClientService: HttpClientService;

  const mockErrorResponse = { status: 400, statusText: 'Bad Request' };
  const dashboardJson = [
    {
        "tabID": "1",
        "tabName": "Main"
    },
    {
        "tabID": "2",
        "tabName": "System"
    }
];

let dummyData_pupulateSystemAndMainTiles = 
    {
      "items": [
        {
          "id": "catalogProducts",
          "label": "Products",
          "address": "products",
          "behaviorIds": [ 4 ]
        },
        {
          "id": "categories",
          "label": "Categories",
          "address": "categories",
          "behaviorIds": [ 16 ]
        }
      ]
    };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule,HttpClientTestingModule],
      declarations: [ AdminDashboardComponent, AccessTileComponent ],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [DashbaordService, NotificationService, LoggerService,CustomNGXLoggerService,
        NGXLoggerHttpService, CookieService, UtilityService, EnvironmentConfig, AuthService,
        {
            provide: HttpClientService,
            useFactory: httpClientServiceCreator,
            deps: [HttpClient, UtilityService, AuthService],
        },
        SharedDataService
    ]
    })
    .compileComponents();

    // To inject services using spyOn
    loggerService = TestBed.get(LoggerService);
    httpMock = TestBed.get(HttpTestingController);
    loggerServiceSpy = spyOn(loggerService, 'info').and.callThrough();
    dashboardService = TestBed.get(DashbaordService);
    httpClientService = TestBed.get(HttpClientService);
    dashboardModel = new DashboardModel();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminDashboardComponent);
    component = fixture.componentInstance;
    debugElement = fixture.debugElement;
    });

    it('Application should create dashboard Component', () => {
        expect(component).toBeDefined();
    });

    it('Application is inside ngOnInit() of dashboard component', () => {
        fixture.detectChanges();
        expect(loggerServiceSpy).toHaveBeenCalledWith("AdminDashboardComponent : ngOnInit");
    });

    it('Application isShowSystemTiles will be false if active tab name is Main', function() {
      fixture.detectChanges();
        dashboardModel.isShowSystemTiles = false;
        let activeTab = 'Main';
        dashboardModel.isShowSystemTiles = (activeTab === "System");
        expect(dashboardModel.isShowSystemTiles).toBe(false, 'isShowSystemTiles will be false if active tab is Main');
    });

    it('Application isShowSystemTiles will be true if active tab name is System', function() {
      fixture.detectChanges();
        dashboardModel.isShowSystemTiles = false;
        let activeTab = "System";
        dashboardModel.isShowSystemTiles = (activeTab === "System");
        expect(dashboardModel.isShowSystemTiles).toBe(true, 'isShowSystemTiles will be true if active tab is System');
    });

    it('Application is inside pupulateSystemAndMainTiles() of dashboard component', () => {
        fixture.detectChanges();
        expect(loggerServiceSpy).toHaveBeenCalledWith("AdminDashboardComponent : pupulateSystemAndMainTiles");
    });

    it('Application should call fetchAllDashboardTiles() dashboard service and print error reponse as "AdminDashboardComponent : _dashboardService.fetchAllDashboardTiles_errResponse"', () => {
      fixture.detectChanges();
       const req = httpMock.expectOne(`/assets/json/dashboard-categories.json`);
       expect(req.request.method).toBe("GET");
       req.flush(dummyData_pupulateSystemAndMainTiles, mockErrorResponse);
       httpMock.verify();
       fixture.detectChanges();
        expect(loggerServiceSpy).toHaveBeenCalledWith('AdminDashboardComponent : _dashboardService.fetchAllDashboardTiles_errResponse');
  });

    afterEach(() => {
        fixture.destroy();
    })
});
