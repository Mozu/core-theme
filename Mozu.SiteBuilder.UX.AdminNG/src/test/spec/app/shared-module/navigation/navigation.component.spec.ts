import { async, ComponentFixture, TestBed, inject } from'@angular/core/testing';
import { NavigationComponent } from '@shared/navigation/navigation.component';
import { AccessTileComponent } from'@shared/access-tile/access-tile.component';
import { NO_ERRORS_SCHEMA, DebugElement, ElementRef } from'@angular/core';
import { HttpClientModule, HttpClient, HttpHandler } from'@angular/common/http';
import { NotificationService } from'@global';
import { LoggerService } from'@core';
import { By } from'@angular/platform-browser';
import { CustomNGXLoggerService, NGXLoggerHttpService } from'ngx-logger';
import { HttpTestingController, HttpClientTestingModule } from'@angular/common/http/testing';
 

  describe('Navigation component', () => {

  let component:NavigationComponent;
  let fixture:ComponentFixture<NavigationComponent>;
  let debugElement:DebugElement;
  let loggerService:LoggerService;
  let loggerServiceSpy:any;

  beforeEach(async(() => {
  TestBed.configureTestingModule({
  imports: [HttpClientModule,HttpClientTestingModule],
  declarations: [ NavigationComponent ],
  schemas: [NO_ERRORS_SCHEMA],
  providers: [NotificationService, LoggerService,CustomNGXLoggerService,
  NGXLoggerHttpService]
  }).compileComponents();
   
  fixture=TestBed.createComponent(NavigationComponent);
  component=fixture.componentInstance;
  debugElement=fixture.debugElement;
   
  //To inject services using spyOn
  loggerService=debugElement.injector.get(LoggerService);
  loggerServiceSpy=spyOn(loggerService, 'info').and.callThrough();
   
  }));
   

  it('Application should create navigation Component', () => {
    expect(component).toBeDefined();
  });
   
  it('Application is inside ngOnInit method of navigation component', () => {
    component.ngOnInit();
    expect(loggerServiceSpy).toHaveBeenCalledWith("NavigationComponent : ngOnInit ");
  });

  it('Application is inside ngOnDestroy method of navigation component', () => {
    component.ngOnDestroy();
    expect(loggerServiceSpy).toHaveBeenCalledWith("NavigationComponent : ngOnDestroy ");
  }); 
});
