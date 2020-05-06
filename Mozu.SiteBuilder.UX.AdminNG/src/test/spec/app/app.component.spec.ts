// import { TestBed, async, ComponentFixture } from '@angular/core/testing';
// import { AppComponent } from './app.component';
// import { NO_ERRORS_SCHEMA, DebugElement } from '@angular/core';
// import { LoggerService } from '@core';
// import { CustomNGXLoggerService, NGXLoggerHttpService } from 'ngx-logger';
// import { HttpClientModule } from '../../node_modules/@angular/common/http';
// import { By } from '@angular/platform-browser';
// import { HttpClientTestingModule } from '../../node_modules/@angular/common/http/testing';
// import { TranslateLoader, TranslateModule, TranslatePipe, TranslateService } from '@ngx-translate/core';
// import { RouterTestingModule } from '@angular/router/testing';


// describe('AppComponent', () => {
// let component: AppComponent;
// let loggerService: LoggerService;
// let debugElement: DebugElement;
// let fixture: ComponentFixture<AppComponent>;
// let loggerServiceSpy: any;
// let translateService : TranslateService


//   beforeEach(async(() => {
//     TestBed.configureTestingModule({
//         imports: [HttpClientModule, HttpClientTestingModule, TranslateModule.forRoot(), RouterTestingModule],
//         declarations: [AppComponent],
//         providers :[LoggerService, CustomNGXLoggerService, NGXLoggerHttpService, HttpClientModule, TranslateService  ],
//         schemas: [NO_ERRORS_SCHEMA],
//     }).compileComponents();

//     fixture = TestBed.createComponent(AppComponent);
//     component = fixture.componentInstance;
//     debugElement = fixture.debugElement;

//     //To inject services using spyOn
//     loggerService = debugElement.injector.get(LoggerService);
//     loggerServiceSpy = spyOn(loggerService, 'info').and.callThrough();

//    // translateService = debugElement.injector.get(TranslateService);
//    // loggerServiceSpy = spyOn(translateService, 'addLangs').and.callThrough();
//     }));
  
//     it('should create the app', async(() => {
//         expect(component).toBeTruthy();
//     }));
// //   it(`should have as title 'app'`, async(() => {
// //     const fixture = TestBed.createComponent(AppComponent);
// //     const app = fixture.debugElement.componentInstance;
// //     expect(app.title).toEqual('app');
// //   }));
// //   it('should render title in a h1 tag', async(() => {
// //     const fixture = TestBed.createComponent(AppComponent);
// //     fixture.detectChanges();
// //     const compiled = fixture.debugElement.nativeElement;
// //     expect(compiled.querySelector('h1').textContent).toContain('Welcome to app!');
// //   }));
// });
