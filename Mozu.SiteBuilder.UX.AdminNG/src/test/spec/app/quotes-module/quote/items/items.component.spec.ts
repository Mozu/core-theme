import { async, 
  ComponentFixture, 
  TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, 
  DebugElement } from '@angular/core';
import { HttpClient, 
  HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule, 
  HttpTestingController } from '@angular/common/http/testing';
import { NGXLoggerHttpService, 
  CustomNGXLoggerService } from 'ngx-logger';
import { TranslateLoader, 
  TranslateModule, 
  TranslatePipe, 
  TranslateService } from '@ngx-translate/core';
import { LoggerService, 
  UtilityService, 
  EnvironmentConfig, 
  AuthService, 
  HttpClientService, 
  httpClientServiceCreator } from '@core';
import { GlobalModule } from '@global/global.module';
import { QuoteItemsComponent } from 'app/quotes-module/quote/items/items.component';

describe('QuoteItemsComponent', () => {
  let component: QuoteItemsComponent;
  let fixture: ComponentFixture<QuoteItemsComponent>;
  let element;
  let loggerService: LoggerService;
  let loggerServiceSpy: any;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(),
        HttpClientTestingModule, 
        GlobalModule ],
      declarations: [ QuoteItemsComponent ],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [TranslateService, 
        LoggerService,
        NGXLoggerHttpService, 
        CustomNGXLoggerService, 
        UtilityService, 
        EnvironmentConfig, 
        AuthService,
        {
          provide: HttpClientService,
          useFactory: httpClientServiceCreator,
          deps: [HttpClient, 
            UtilityService, 
            AuthService]
      }]
    })
    .compileComponents();

    loggerService = TestBed.get(LoggerService);
    loggerServiceSpy = spyOn(loggerService, 'info').and.callThrough();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuoteItemsComponent);
    component = fixture.componentInstance;
    element = fixture.nativeElement;
  });


  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
