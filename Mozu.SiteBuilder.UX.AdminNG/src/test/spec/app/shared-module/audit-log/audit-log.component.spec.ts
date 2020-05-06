import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AuditLogComponent } from '@shared/audit-log/audit-log.component';
import { DebugElement, NO_ERRORS_SCHEMA, SimpleChange } from '@angular/core';
import { LoggerService, UtilityService, EnvironmentConfig, AuthService, HttpClientService, httpClientServiceCreator } from '@core';
import { HttpTestingController, HttpClientTestingModule } from '@angular/common/http/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { GlobalModule } from '@global/global.module';
import { By } from '@angular/platform-browser';
import { NGXLoggerHttpService, CustomNGXLoggerService } from 'ngx-logger';
import { AuditLogService } from '@shared/audit-log/audit-log.service';
import { AuditLogModel } from '@shared/audit-log/audit-log.model';
import { HttpClient } from '@angular/common/http';

describe('AuditLogComponent', () => {
  let component: AuditLogComponent;
  let fixture: ComponentFixture<AuditLogComponent>;
  let debugElement: DebugElement;
  let element: HTMLElement;
  let loggerService: LoggerService;
  let loggerServiceSpy: any;
  let httpMock: HttpTestingController;
  const mockErrorResponse = { status: 400, statusText: 'Bad Request' };
  
  
  let dummyAuditLog = {
    "startIndex": 0,
    "pageSize": 20,
    "pageCount": 1,
    "totalCount": 4,
    "items": [
     {
      "id": "0a69bd65ce05433581b8aa4e00994ae7",
      "correlationId": "",
      "subjectType": "StateChange.WorkflowAction",
      "success": true,
      "identifier": "0dd992d07803151b68028d4a00004c44",
      "subject": "AbandonOrder",
      "verb": "Applied",
      "message": "Workflow action succeeded.",
      "metadata": [
       {
      "oldValue": "Pending",
      "newValue": "Abandoned"
       }
      ],
      "oldValue": "Pending",
      "newValue": "Abandoned",
      "createDate": "2019-05-15T09:18:07.273Z"
     }]
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), HttpClientTestingModule, GlobalModule ],
      declarations: [ AuditLogComponent ],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [By, TranslateService, LoggerService,NGXLoggerHttpService, CustomNGXLoggerService, 
        UtilityService, EnvironmentConfig, AuthService, AuditLogModel, AuditLogService,
        {
          provide: HttpClientService,
          useFactory: httpClientServiceCreator,
          deps: [HttpClient, UtilityService, AuthService]
      }]
    })
    .compileComponents();

    loggerService = TestBed.get(LoggerService);
    loggerServiceSpy = spyOn(loggerService, 'info').and.callThrough();
  }));

  beforeEach(() => {
    httpMock = TestBed.get(HttpTestingController);
    var respData = {
      items: {
        "ctTaContext": {
          "masterCatalogs": [{
            "sites": [{
              "id": "1234"
            }]
          }]
        }
      }};
    const req = httpMock.expectOne(`./assets/json/user-data.json`);
    expect(req.request.method).toBe("GET");
    req.flush(respData);
    httpMock.verify();
    
    fixture = TestBed.createComponent(AuditLogComponent);
    component = fixture.componentInstance;
    debugElement = fixture.debugElement;
    element = debugElement.nativeElement;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch quoteId from ngOnChange()',  () => {
    component.quoteId = '4588be576b7f4416a70b6d810219680e';
    const spy = spyOn(component, 'populateAuditLog');
    component.ngOnChanges({
      quoteId: new SimpleChange(null, component.quoteId, true)
    });
    fixture.detectChanges(); 
    fixture.whenStable().then(() => {
      expect(spy).toHaveBeenCalledTimes(1);
    });
   });

   it('should call service to get success response from mock http json (audit-log)', async(() => {
    component.quoteId = '4588be576b7f4416a70b6d810219680e';
    component.populateAuditLog(component.quoteId);

    const req = httpMock.expectOne(`/assets/json/audit-log.json`);
    expect(req.request.method).toBe("GET");
    req.flush(dummyAuditLog);
    
    httpMock.verify();
    expect(loggerServiceSpy).toHaveBeenCalledWith("AuditLogComponent : _auditLogService.fetchAuditLog_auditLogSuccessResponse");
  }));

  it('should call service to get failure response from mock http json (audit-log)', () => {
    component.quoteId = '4588be576b7f4416a70b6d810219680e';
    component.populateAuditLog(component.quoteId);

    const req = httpMock.expectOne(`/assets/json/audit-log.json`);
    expect(req.request.method).toBe("GET");
    req.flush(dummyAuditLog, mockErrorResponse);
    
    httpMock.verify();
    expect(loggerServiceSpy).toHaveBeenCalledWith("AuditLogComponent : _auditLogService.fetchAuditLog_errResponse");
  });

});
