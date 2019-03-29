
import { async, ComponentFixture, TestBed, inject } from '@angular/core/testing';
import { AccessTileComponent } from '@shared/access-tile/access-tile.component';
import { NO_ERRORS_SCHEMA, DebugElement, ElementRef } from '@angular/core';
import { HttpClientModule, HttpClient, HttpHandler } from '@angular/common/http';
import { NotificationService } from '@global';
import { LoggerService } from '@core';
import { CustomNGXLoggerService, NGXLoggerHttpService } from 'ngx-logger';
import { HttpTestingController, HttpClientTestingModule } from '@angular/common/http/testing';
import { NavigationTopComponent } from '@shared';
import { NavigationService } from '@shared/navigation/navigation.service';
import { TopNavigationModel } from './top.model';

describe('top navigation component', () => {
  let component: NavigationTopComponent;
  let fixture: ComponentFixture<NavigationTopComponent>;
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
      declarations: [ NavigationTopComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [NotificationService, LoggerService,CustomNGXLoggerService,NGXLoggerHttpService, NavigationService]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NavigationTopComponent);
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
          expect(loggerService.info).toHaveBeenCalledWith('NavigationTopComponent : ngOnInit');
    });

    it('Application should call selected tab', () => {
      let selectedTab ="Main";
      component.tabSelectionChanged(selectedTab);
      expect(loggerService.info).toHaveBeenCalledWith('NavigationTopComponent : tabSelectionChanged');
    });

    it('Application should call fetch tabs data function', () => {
    
    component.fetchHomeTabsName();
     const req = httpMock.expectOne(`./assets/json/dashboard-menu.json`, "sample url test from navigation component");
     expect(req.request.method).toBe("GET");
     req.flush(dummydata_tabsMenu);
     httpMock.verify();
     expect(loggerServiceSpy).toHaveBeenCalledWith("NavigationTopComponent : navigationService.fetchTabsName_SuccessResponse");
    });
});

