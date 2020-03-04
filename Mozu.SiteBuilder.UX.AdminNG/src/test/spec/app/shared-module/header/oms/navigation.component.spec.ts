import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HeaderOmsNavigationComponent } from '@shared/header/oms/navigation/navigation.component'
import { DebugElement, NO_ERRORS_SCHEMA }    from '@angular/core';
import { LoggerService } from '@core';
import { CustomNGXLoggerService, NGXLoggerHttpService } from 'ngx-logger';
import { HttpClientModule, HttpClient, HttpHandler } from '@angular/common/http';
import { HttpTestingController, HttpClientTestingModule } from '@angular/common/http/testing';
import { UtilityService, EnvironmentConfig } from '@core/infrastructure/utility.service';
import { HttpClientService, httpClientServiceCreator } from '@core/extensions/http-client.service';
import { AuthService } from '@core/extensions/auth.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { GlobalModule } from "@global/global.module";

describe('HeaderOmsNavigationComponent', () => {
  let component: HeaderOmsNavigationComponent;
  let fixture: ComponentFixture<HeaderOmsNavigationComponent>;
  let de: DebugElement;
  let element: HTMLElement;
  let debugElement: DebugElement;
  let loggerService: LoggerService;
  let loggerServiceSpy: any;
  let httpMock: HttpTestingController;

   beforeEach(async(() => {
     
    TestBed.configureTestingModule({
      imports: [HttpClientModule,HttpClientTestingModule, GlobalModule, TranslateModule.forRoot()],
      declarations: [ HeaderOmsNavigationComponent ],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [LoggerService,NGXLoggerHttpService, CustomNGXLoggerService, UtilityService, EnvironmentConfig, AuthService,
        {
          provide: HttpClientService,
          useFactory: httpClientServiceCreator,
          deps: [HttpClient, UtilityService, AuthService, TranslateService]
      }
    ]})
    .compileComponents();
  }));

  beforeEach(async(() => {
    fixture = TestBed.createComponent(HeaderOmsNavigationComponent);
    component = fixture.debugElement.componentInstance;
    debugElement = fixture.debugElement;

    // To inject services using spyOn
    loggerService = debugElement.injector.get(LoggerService);
    loggerServiceSpy = spyOn(loggerService, 'info').and.callThrough();

   }));

  it('should create HeaderOmsNavigationComponent Component', () => {
    expect(component).toBeTruthy();
  });

  it('Application is inside ngOnInit method of header oms navigation component', () => {
    component.ngOnInit();
    expect(loggerServiceSpy).toHaveBeenCalledWith('HeaderOmsNavigationComponent : ngOnInit');
  });

});

