// import { async, ComponentFixture, TestBed } from '@angular/core/testing';
// import { By }              from '@angular/platform-browser';
// import { HeaderComponent } from '@shared/header/header.component'
// import { DebugElement }    from '@angular/core';
// import { LoggerService } from '@core';
// import { CustomNGXLoggerService, NGXLoggerHttpService } from 'ngx-logger';
// import { HttpClientModule, HttpClient, HttpHandler } from '@angular/common/http';
// import { HttpTestingController, HttpClientTestingModule } from '@angular/common/http/testing';
// import { UtilityService, EnvironmentConfig } from '@core/infrastructure/utility.service';
// import { HttpClientService, httpClientServiceCreator } from '@core/extensions/http-client.service';
// import { SharedDataService, CtUser } from '@global';
// import { AuthService } from '@core/extensions/auth.service';

// describe('HeaderComponent', () => {
//   let component: HeaderComponent;
//   let fixture: ComponentFixture<HeaderComponent>;
//   let de: DebugElement;
//   let element: HTMLElement;
//   let debugElement: DebugElement;
//   let loggerService: LoggerService;
//   let loggerServiceSpy: any;
//   let sharedData : SharedDataService;

//   beforeEach(async(() => {
//     TestBed.configureTestingModule({
//       imports: [HttpClientModule,HttpClientTestingModule],
//       declarations: [ HeaderComponent ],
//       providers: [LoggerService,NGXLoggerHttpService, CustomNGXLoggerService, SharedDataService, UtilityService, EnvironmentConfig, AuthService,
//         {
//           provide: HttpClientService,
//           useFactory: httpClientServiceCreator,
//           deps: [HttpClient, UtilityService, AuthService]
//       }, SharedDataService ]
//     })
//     .compileComponents();
//   }));

//   beforeEach(() => {
//     fixture = TestBed.createComponent(HeaderComponent);
//     component = fixture.componentInstance;
//     de = fixture.debugElement.query(By.css('.navbar-kibo-text'));
//     element  = de.nativeElement;
//     fixture.detectChanges();
//   });

//   //To inject services using spyOn
// //  loggerService = debugElement.injector.get(LoggerService);
// //  loggerServiceSpy = spyOn(loggerService, 'info').and.callThrough();

// //  it('Application is inside ngOnInit method of header component', () => {
// //     component.ngOnInit();
// //     expect(loggerServiceSpy).toHaveBeenCalledWith("HeaderComponent : ngOnInit");
// //     });

//   it('should create Header Component', () => {
//     const  fixture = TestBed.createComponent(HeaderComponent);
//     const component = fixture.debugElement.componentInstance;
//     expect(component).toBeTruthy();
//   });

//   it('should have "Kibo eCommerce" as title', () => {
//     expect(element.innerHTML).toContain("Kibo eCommerce");
//   })

//   it('should render button name in a span tag', async(() => {
//         const fixture = TestBed.createComponent(HeaderComponent);
//         fixture.detectChanges();
//         const compiled = fixture.debugElement.nativeElement;
//         expect(compiled.querySelector('span').textContent).toContain('Toggle navigation');
//       }));

//   it('should render the kibo logo', async(() => {
//         const fixture = TestBed.createComponent(HeaderComponent);
//         fixture.detectChanges();
//         const compiled = fixture.debugElement.nativeElement;
//         expect(compiled.querySelector('img').src).toContain('http://localhost:9876/assets/Images/kibo-icon.png');
//       }));

      
//     //   it('Application is inside fetch logged in user data', () => {
//     //     component.ngOnInit();
//     //     expect(sharedData).toHaveBeenCalledWith("HeaderComponent : fetchloggedInUserData");
//     // });   
// });

