import { async, ComponentFixture, TestBed, inject } from'@angular/core/testing';
import { NavigationLeftComponent } from '@shared/navigation/left/left.component';
import { AccessTileComponent } from'@shared/access-tile/access-tile.component';
import { NO_ERRORS_SCHEMA, DebugElement, ElementRef } from'@angular/core';
import { HttpClientModule, HttpClient, HttpHandler } from'@angular/common/http';
import { NotificationService } from'@global';
import { LoggerService } from'@core';
import { By } from'@angular/platform-browser';
import { CustomNGXLoggerService, NGXLoggerHttpService } from'ngx-logger';
import { HttpTestingController, HttpClientTestingModule } from'@angular/common/http/testing';
import { NavigationService } from '@shared/navigation/navigation.service';
import { LeftNavigationModel } from '@shared/navigation/left/left.model';
import { UtilityService, EnvironmentConfig } from '@core/infrastructure/utility.service';
import { HttpClientService, httpClientServiceCreator } from '@core/extensions/http-client.service';
import { SharedDataService } from '@global/services/shared-data.service';
import { AuthService } from '@core/extensions/auth.service';

 
describe('Left Navigation component', () => {

let component:NavigationLeftComponent;
let fixture:ComponentFixture<NavigationLeftComponent>;
let debugElement:DebugElement;
let loggerService:LoggerService;
let loggerServiceSpy:any;
let navigationServiceSpy: any;
let navigationService:NavigationService;
let httpMock: HttpTestingController;
let leftNavigationModel : LeftNavigationModel;
let sharedData : SharedDataService;
const mockErrorResponse = { status: 400, statusText: 'Bad Request' };

let dummydata_leftNavMenu = [{
  "id": "products",
  "navParent": "main",
  "label": "Catalog",
  "imageURL": "./assets/Images/catlog.png",
  "icon": "nav-catalog",
  "behaviorIds": [ 4 ],
  "items": [
    {
      "id": "catalogProducts",
      "label": "Products",
      "address": "products",
      "behaviorIds": [ 4 ],
      "url":"http://sb.ngdev06.kibong-dev.com/admin/m-1/products"
    },

  ]
}];

beforeEach(async(() => {
TestBed.configureTestingModule({
imports: [HttpClientModule,HttpClientTestingModule],
declarations: [ NavigationLeftComponent ],
schemas: [NO_ERRORS_SCHEMA],
providers: [NavigationService, LoggerService,CustomNGXLoggerService, NGXLoggerHttpService, UtilityService, EnvironmentConfig, AuthService,  
  {
      provide: HttpClientService,
      useFactory: httpClientServiceCreator,
      deps: [HttpClient, UtilityService, AuthService]
  }, SharedDataService]
 }).compileComponents();
 
fixture=TestBed.createComponent(NavigationLeftComponent);
component=fixture.componentInstance;
debugElement=fixture.debugElement;
 
//To inject services using spyOn
loggerService=debugElement.injector.get(LoggerService);
loggerServiceSpy=spyOn(loggerService, 'info').and.callThrough();

httpMock = TestBed.get(HttpTestingController);

navigationService=debugElement.injector.get(NavigationService);
navigationServiceSpy=spyOn(navigationService, 'fetchLeftNavigationItems').and.callThrough();

 //To access external model class
 leftNavigationModel = new LeftNavigationModel();
 component.model = leftNavigationModel;
 
}));
 

it('Application should create left navigation Component', () => {
  expect(component).toBeDefined();
});
 
it('Application is inside ngOnInit method of left navigation component', () => {
  component.ngOnInit();
  expect(loggerServiceSpy).toHaveBeenCalledWith("NavigationLeftComponent : ngOnInit");
});

it('Application should call fetch tabs data function', () => {
  component.fetchNavigationItem();
   const req = httpMock.expectOne(`./assets/json/leftNavigation-items.json`, "sample url test from navigation component");
   expect(req.request.method).toBe("GET");
   req.flush(dummydata_leftNavMenu);
   httpMock.verify();
   expect(loggerServiceSpy).toHaveBeenCalledWith("NavigationLeftComponent : fetchLeftNavigationItems");
  });
 
  it('Left menu link should contain appended URL token', () => {
    fixture.detectChanges();

    fixture.whenStable().then(() => {
      fixture.detectChanges();
      const compiled = fixture.debugElement.nativeElement;
      expect(compiled.querySelector('a').href).toContain('/m-1/products');
    });
  });

  it('Should call service to get failure response from mock http json (left navigation menu items)', () => {
    fixture.detectChanges();
    const req = httpMock.expectOne(`./assets/json/leftNavigation-items.json`);
    expect(req.request.method).toBe("GET");
    req.flush(dummydata_leftNavMenu, mockErrorResponse);
    httpMock.verify();
    fixture.detectChanges();
    expect(loggerServiceSpy).toHaveBeenCalledWith("NavigationLeftComponent : navigationService.fetchLeftNavigationItems_errorResponse");
  });

  it('Should call service to get success response from mock http json (left navigation menu items)', () => {
    fixture.detectChanges();
     const req = httpMock.expectOne(`./assets/json/leftNavigation-items.json`, "sample url test from navigation component");
     expect(req.request.method).toBe("GET");
     req.flush(dummydata_leftNavMenu);
     httpMock.verify();
     expect(loggerServiceSpy).toHaveBeenCalledWith("NavigationLeftComponent : fetchLeftNavigationItems");
    });

});
