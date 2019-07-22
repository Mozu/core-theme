import { async, ComponentFixture, TestBed } from'@angular/core/testing';
import { DynamicLinksDialogComponent } from '@shared/dynamic-links-dialog/dynamic-links-dialog.component';
import { NO_ERRORS_SCHEMA, DebugElement } from'@angular/core';
import { HttpClientModule, HttpClient } from'@angular/common/http';
import { LoggerService } from'@core';
import { CustomNGXLoggerService, NGXLoggerHttpService } from'ngx-logger';
import { HttpTestingController, HttpClientTestingModule } from'@angular/common/http/testing';
import { NavigationService } from '@shared/navigation/navigation.service';
import { UtilityService, EnvironmentConfig } from '@core/infrastructure/utility.service';
import { HttpClientService, httpClientServiceCreator } from '@core/extensions/http-client.service';
import { AuthService } from '@core/extensions/auth.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';


describe('Dynamic Links Component', () => {

let component:DynamicLinksDialogComponent;
let fixture:ComponentFixture<DynamicLinksDialogComponent>;
let debugElement:DebugElement;
let loggerService:LoggerService;
let loggerServiceSpy:any;
let httpMock: HttpTestingController;
const mockErrorResponse = { status: 400, statusText: 'Bad Request' };

beforeEach(async(() => {
TestBed.configureTestingModule({
imports: [HttpClientModule,HttpClientTestingModule],
declarations: [ DynamicLinksDialogComponent ],
schemas: [NO_ERRORS_SCHEMA],
providers: [NavigationService, LoggerService,CustomNGXLoggerService, NGXLoggerHttpService, UtilityService, EnvironmentConfig, AuthService, NgbActiveModal,
  {
      provide: HttpClientService,
      useFactory: httpClientServiceCreator,
      deps: [HttpClient, UtilityService, AuthService]
  }]
 }).compileComponents();
 
fixture=TestBed.createComponent(DynamicLinksDialogComponent);
component=fixture.componentInstance;
debugElement=fixture.debugElement;
 
//To inject services using spyOn
loggerService=debugElement.injector.get(LoggerService);
loggerServiceSpy=spyOn(loggerService, 'info').and.callThrough();

httpMock = TestBed.get(HttpTestingController);
}));
 

it('Application should be in dynamic Component', () => {
    expect(component).toBeDefined();
});
 
it('Application is inside ngOnInit method of dynamic link component', () => {
    //component.ngOnInit();
    expect(loggerServiceSpy).toHaveBeenCalledWith("DynamicLinksDialogComponent : ngOnInit");
});
 
});
