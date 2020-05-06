import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By }              from '@angular/platform-browser';
import { HeaderComponent } from '@shared/header/header.component'
import { DebugElement, NO_ERRORS_SCHEMA }    from '@angular/core';
import { LoggerService } from '@core';
import { CustomNGXLoggerService, NGXLoggerHttpService } from 'ngx-logger';
import { HttpClientModule, HttpClient, HttpHandler } from '@angular/common/http';
import { HttpTestingController, HttpClientTestingModule } from '@angular/common/http/testing';
import { UtilityService, EnvironmentConfig } from '@core/infrastructure/utility.service';
import { HttpClientService, httpClientServiceCreator } from '@core/extensions/http-client.service';
import { SharedDataService, CtUser } from '@global';
import { AuthService } from '@core/extensions/auth.service';
import { GlobalModule } from "@global/global.module";

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let de: DebugElement;
  let element: HTMLElement;
  let debugElement: DebugElement;
  let loggerService: LoggerService;
  let loggerServiceSpy: any;
  let sharedData : SharedDataService;
  let httpMock: HttpTestingController;

   beforeEach(async(() => {
     
    TestBed.configureTestingModule({
      imports: [HttpClientModule,HttpClientTestingModule, GlobalModule ],
      declarations: [ HeaderComponent ],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [LoggerService,NGXLoggerHttpService, CustomNGXLoggerService, UtilityService, EnvironmentConfig, AuthService,
        {
          provide: HttpClientService,
          useFactory: httpClientServiceCreator,
          deps: [HttpClient, UtilityService, AuthService]
      }
    ]})
    .compileComponents();
  }));

  beforeEach(async(() => {
    httpMock = TestBed.get(HttpTestingController);
    var respData = {
      items: {
        "ctUser": {
          "firstName": "Kibo",
          "lastName": "admin",
        },
        "ctTaContext": {
          "name": "Decathlon SandBox"
        }
      }};

    const req = httpMock.expectOne(`./assets/json/user-data.json`);
    expect(req.request.method).toBe("GET");
    req.flush(respData);
    httpMock.verify();
    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.debugElement.componentInstance;
   }));

  it('should create Header Component', () => {
    expect(component).toBeTruthy();
  });

  it('should have "Kibo eCommerce" as title', () => {
    element = fixture.debugElement.nativeElement;
    expect(element.innerHTML).toContain("Kibo eCommerce");
  })

  it('should render button name in a span tag', async(() => {
        const compiled = fixture.debugElement.nativeElement;
        expect(compiled.querySelector('span').textContent).toContain('Toggle navigation');
      }));

  it('should render the kibo logo', async(() => {
        const compiled = fixture.debugElement.nativeElement;
        expect(compiled.querySelector('img').src).toContain('http://localhost:9876/assets/Images/kibo-icon.png');
      }));

  it('Application should fetch logged in user data', () => {
      fixture.detectChanges();
      expect(component.headerModel.tenantName).toBe("Decathlon SandBox");
  });
  
});

