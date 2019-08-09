import { async,
  ComponentFixture,
  TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA,
  DebugElement,
  SimpleChange} from '@angular/core';
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
import { QuoteSummaryComponent } from 'app/quotes-module/quote/summary/summary.component';

describe('QuoteSummaryComponent', () => {
  let component: QuoteSummaryComponent;
  let fixture: ComponentFixture<QuoteSummaryComponent>;
  let element;
  let loggerService: LoggerService;
  let loggerServiceSpy: any;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(),
        HttpClientTestingModule,
        GlobalModule ],
      declarations: [ QuoteSummaryComponent ],
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
    fixture = TestBed.createComponent(QuoteSummaryComponent);
    component = fixture.componentInstance;
    element = fixture.nativeElement;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch quoteInfo from ngOnChange()', async(() => {
    component.quote = {
        'id': '0dd322d1429fe45778112b5b00004c44',
        'name': 'TestQuote1',
        'siteId': 24299,
        'tenantId': 19524,
        'status': 'Cancelled',
        'submittedDate': '2019-05-9T12:00:40.914Z',
        'number': 2,
        'items': [],
        'auditInfo': {
          'updateDate': '2019-05-08T12:00:40.914Z',
          'createDate': '2019-05-08T12:00:40.914Z',
          'updateBy': 'Sam',
          'createBy': 'Sam'
        },
        'expirationDate': '2019-05-18T12:00:40.914Z',
        'userId': '4588be576b7f4416a70b6d810219680e',
        'customerAccountId': 1033,
        'isTaxExempt': false,
        'currencyCode': 'USD',
        'customerInteractionType': 'Unknown',
        'orderDiscounts': [],
        'subTotal': 5,
        'itemTaxTotal': 0,
        'itemTotal': 5,
        'total': 5,
        'handlingSubTotal': 0,
        'handlingTax': 0,
        'handlingTaxTotal': 0,
        'handlingTotal': 0,
        'dutyTotal': 0,
        'feeTotal': 0
    };
    fixture.detectChanges();
    component.ngOnChanges({
      quote: new SimpleChange(null, component.quote, true)
    });
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      expect(loggerServiceSpy).toHaveBeenCalledWith('QuoteSummaryComponent : ngOnChanges');
    });
   }));

});
