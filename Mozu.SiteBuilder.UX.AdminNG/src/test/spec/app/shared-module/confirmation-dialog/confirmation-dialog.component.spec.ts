import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import { LoggerService, HttpClientService, httpClientServiceCreator, UtilityService, AuthService, EnvironmentConfig } from '@core';
import { CustomNGXLoggerService, NGXLoggerHttpService } from 'ngx-logger';
import { ConfirmationDialogService } from 'app/shared-module/confirmation-dialog/confirmation-dialog.service';
import { HttpClient } from '@angular/common/http';
import { Constants as GlobalConstant } from '@global/infrastructure/constants';
import { ConfirmationDialogNotificationType, ConfirmationDialogNotificationCode } from '@shared/infrastructure/enums';
import { TranslateLoader, TranslateModule, TranslatePipe } from '@ngx-translate/core';
import { GlobalModule } from '@global/global.module';
import { ConfirmationDialogComponent } from '@shared/confirmation-dialog/confirmation-dialog.component';
import { By } from '@angular/platform-browser';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('ConfirmationDialogComponent', () => {
  let component: ConfirmationDialogComponent;
  let fixture: ComponentFixture<ConfirmationDialogComponent>;
  let loggerService: LoggerService;
  let loggerServiceSpy: any;
  let httpMock: HttpTestingController;
  let confirmationDialogService: ConfirmationDialogService;
  let confirmationDialogServiceSpy: any;

  let displayModal = false;
  let confirmationDialogTitle: 'Delete Item';
  let confirmationDialogMessage: 'Are you certain you want to delete this item?';
  let isShowSecondaryButton = true;
  let primaryButtonText: 'Yes';
  let secondaryButtonText: 'No';
  let itemName = 'Test'; 
  let secondaryMessage = ''

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), HttpClientTestingModule, GlobalModule ],
      declarations: [ ConfirmationDialogComponent ],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [By, LoggerService, NGXLoggerHttpService, CustomNGXLoggerService,
        UtilityService, EnvironmentConfig, AuthService, ConfirmationDialogService,
        {
          provide: HttpClientService,
          useFactory: httpClientServiceCreator,
          deps: [HttpClient, UtilityService, AuthService]
      }]
    });

  loggerService = TestBed.get(LoggerService);
  httpMock = TestBed.get(HttpTestingController);

  loggerServiceSpy = spyOn(loggerService, 'info').and.callThrough();
  confirmationDialogService = TestBed.get(ConfirmationDialogService);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call showConfirmationDialog method', () => {
    displayModal = true;
    confirmationDialogTitle = 'Delete Item';
    component.showConfirmationDialog(confirmationDialogTitle,
    confirmationDialogMessage, primaryButtonText,
    isShowSecondaryButton, secondaryButtonText, itemName, secondaryMessage);
    component.dialogTitle = confirmationDialogTitle;
    expect(confirmationDialogTitle).toBe('Delete Item');
  });

  it('should call confirm method', () => {
    confirmationDialogServiceSpy = spyOn(confirmationDialogService, 'confirm');
    component.confirm();
    displayModal = false;
    expect(confirmationDialogServiceSpy).toHaveBeenCalled();
    expect(displayModal).toEqual(false);
  });

});
