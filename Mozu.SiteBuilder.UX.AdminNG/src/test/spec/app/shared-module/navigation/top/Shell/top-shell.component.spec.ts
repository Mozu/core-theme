
import { async, ComponentFixture, TestBed, inject } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, DebugElement, ElementRef } from '@angular/core';
import { HttpClientModule, HttpClient, HttpHandler } from '@angular/common/http';
import { HttpTestingController, HttpClientTestingModule } from '@angular/common/http/testing';
import { LoggerService } from '@core';
import { TopNavigationModel } from '@shared/navigation/top/shell/top-shell.model';
import { UtilityService, EnvironmentConfig } from '@core/infrastructure/utility.service';
import { AuthService } from '@core/extensions/auth.service';
import { HttpClientService, httpClientServiceCreator } from '@core/extensions/http-client.service';
import { CustomNGXLoggerService, NGXLoggerHttpService } from 'ngx-logger';
import { NotificationService } from '@global';
import { NavigationTopShellComponent } from '@shared';
import { NavigationService } from '@shared/navigation/navigation.service';


describe('Top shell navigation component', () => {
  let component: NavigationTopShellComponent;
  let fixture: ComponentFixture<NavigationTopShellComponent>;
  let debugElement: DebugElement;
  let loggerService: LoggerService;
  let loggerServiceSpy: any;
  let httpMock: HttpTestingController;
  let topNavigationModel: TopNavigationModel;
  // let topNavigationTabs : TopNavigationTabs;

  const mockErrorResponse = { status: 400, statusText: 'Bad Request' };
  let dummydata_tabsMenu = [
    {
        "tabID": "1",
        "tabName": "Main"
    },
    {
        "tabID": "2",
        "tabName": "System"
    }
  ]

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule,HttpClientTestingModule],
      declarations: [ NavigationTopShellComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [NotificationService, LoggerService,CustomNGXLoggerService,NGXLoggerHttpService, NavigationService, UtilityService, EnvironmentConfig, AuthService,
        {
            provide: HttpClientService,
            useFactory: httpClientServiceCreator,
            deps: [HttpClient, UtilityService, AuthService]
        }]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NavigationTopShellComponent);
    component = fixture.componentInstance;
    debugElement = fixture.debugElement;

    //To inject services using spyOn
    loggerService = debugElement.injector.get(LoggerService);
    loggerServiceSpy = spyOn(loggerService, 'info').and.callThrough();

    httpMock = TestBed.get(HttpTestingController);

    //To access external model class
    topNavigationModel = new TopNavigationModel();
    // component.model = topNavigationModel;
    // topNavigationTabs = new TopNavigationTabs();//TODO pending for model
    }));

    it('Application is inside top navigation component', () => {
          component.ngOnInit();
          expect(loggerService.info).toHaveBeenCalledWith('NavigationTopShellComponent : ngOnInit');
    });

    it('Application should call selected tab', () => {
      let selectedTab ="Main";
      component.tabSelectionChanged(selectedTab);
      expect(loggerService.info).toHaveBeenCalledWith('NavigationTopShellComponent : tabSelectionChanged');
    });

    it('Application should call fetch tabs data function', () => {
    
    component.fetchHomeTabsName();
    expect(loggerService.info).toHaveBeenCalledWith('NavigationTopShellComponent : fetchHomeTabsName');
     const req = httpMock.expectOne(`./assets/json/dashboard-menu.json`, "sample url test from navigation component");
     expect(req.request.method).toBe("GET");
     req.flush(dummydata_tabsMenu);
     httpMock.verify();
     expect(loggerServiceSpy).toHaveBeenCalledWith("NavigationTopShellComponent : navigationService.fetchTabsName_SuccessResponse");
    });
});

