import { async, ComponentFixture, TestBed } from'@angular/core/testing';
import { NavigationLeftComponent } from '@shared/navigation/left/left.component';
import { NO_ERRORS_SCHEMA, DebugElement } from'@angular/core';
import { HttpClientModule, HttpClient } from'@angular/common/http';
import { LoggerService } from'@core';
import { CustomNGXLoggerService, NGXLoggerHttpService } from'ngx-logger';
import { HttpTestingController, HttpClientTestingModule } from'@angular/common/http/testing';
import { NavigationService } from '@shared/navigation/navigation.service';
import { LeftNavigationModel } from '@shared/navigation/left/left.model';
import { UtilityService, EnvironmentConfig } from '@core/infrastructure/utility.service';
import { HttpClientService, httpClientServiceCreator } from '@core/extensions/http-client.service';
import { SharedDataService } from '@global/services/shared-data.service';
import { AuthService } from '@core/extensions/auth.service';
import { Constants } from '@shared/infrastructure/constants';


describe('Left Navigation component', () => {

let component: NavigationLeftComponent;
let fixture: ComponentFixture<NavigationLeftComponent>;
let debugElement: DebugElement;
let loggerService: LoggerService;
let loggerServiceSpy: any;
let navigationServiceSpy: any;
let navigationService: NavigationService;
let httpMock: HttpTestingController;
let leftNavigationModel: LeftNavigationModel;
const mockErrorResponse = { status: 400, statusText: 'Bad Request' };

const dummydata_leftNavMenu = [{
  'id': 'products',
  'navParent': 'main',
  'label': 'Catalog',
  'imageURL': './assets/Images/catlog.png',
  'icon': 'nav-catalog',
  'behaviorIds': [ 4 ],
  'items': [
    {
      'id': 'catalogProducts',
      'label': 'Products',
      'address': 'products',
      'behaviorIds': [ 4 ],
      'url': 'http://sb.ngdev06.kibong-dev.com/admin/m-1/products'
    },

  ]
}];

beforeEach(async(() => {
TestBed.configureTestingModule({
imports: [HttpClientModule, HttpClientTestingModule],
declarations: [ NavigationLeftComponent ],
schemas: [NO_ERRORS_SCHEMA],
providers: [NavigationService, LoggerService, CustomNGXLoggerService, NGXLoggerHttpService, UtilityService, EnvironmentConfig, AuthService,
  {
      provide: HttpClientService,
      useFactory: httpClientServiceCreator,
      deps: [HttpClient, UtilityService, AuthService]
  }, SharedDataService]
 }).compileComponents();

fixture = TestBed.createComponent(NavigationLeftComponent);
component = fixture.componentInstance;
debugElement = fixture.debugElement;

// To inject services using spyOn
loggerService = debugElement.injector.get(LoggerService);
loggerServiceSpy = spyOn(loggerService, 'info').and.callThrough();

httpMock = TestBed.get(HttpTestingController);

navigationService = debugElement.injector.get(NavigationService);
navigationServiceSpy = spyOn(navigationService, 'fetchLeftNavigationItems').and.callThrough();

 // To access external model class
 leftNavigationModel = new LeftNavigationModel();
}));


it('Application should create left navigation Component', () => {
  expect(component).toBeDefined();
});

it('Application is inside ngOnInit method of left navigation component', () => {
  component.ngOnInit();
  expect(loggerServiceSpy).toHaveBeenCalledWith('NavigationLeftComponent : ngOnInit');
});

it('Application is inside openDynamicLinksDialog method of left navigation component ', () => {
    let extensionLink: any;
    component.openDynamicLinksDialog(extensionLink);
   expect(loggerServiceSpy).toHaveBeenCalledWith('NavigationLeftComponent : openDynamicLinksDialog');
  });


  // it("should call onButtonClick", fakeAsync(() => {
  //   const onClickMock = spyOn(component, 'megaMenuToggleIcon');
  //    fixture.debugElement.query(By.css('div')).nativeElement.click();
  //    fixture.detectChanges();
  //    fixture.whenStable().then(() => {
  //     expect(loggerServiceSpy).toHaveBeenCalledWith("NavigationLeftComponent : megaMenuToggleIcon");
  //   });
  //   }));

   it('Should count the filtered navigation links length', async(() => {
    const spy = spyOn(component, 'fetchNavigationItem');
      fixture.detectChanges();
      fixture.whenStable().then(() => {
        expect(spy).toHaveBeenCalled();
        expect(component.model.filteredNavigationLinks.length).toBe(0);
      });
    }));

  it('Should call service to get failure response from mock http json (left navigation menu items)', () => {
    fixture.detectChanges();
    const req = httpMock.expectOne(Constants.JsonResources.leftNavigationItems);
    expect(req.request.method).toBe('GET');
    req.flush(dummydata_leftNavMenu, mockErrorResponse);
    httpMock.verify();
    fixture.detectChanges();
    expect(loggerServiceSpy).toHaveBeenCalledWith('NavigationLeftComponent : navigationService.fetchLeftNavigationItems_errorResponse');
  });

it('Application should call fetchNavigationItem data function', () => {
  component.fetchNavigationItem();
   const req = httpMock.expectOne(Constants.JsonResources.leftNavigationItems);
   expect(req.request.method).toBe('GET');
   req.flush(dummydata_leftNavMenu);
   httpMock.verify();
   expect(loggerServiceSpy).toHaveBeenCalledWith('NavigationLeftComponent : fetchLeftNavigationItems');
  });

});
