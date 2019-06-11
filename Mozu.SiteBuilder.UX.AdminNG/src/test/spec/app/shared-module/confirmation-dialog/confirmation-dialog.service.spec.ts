import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing'
import { LoggerService, HttpClientService, httpClientServiceCreator, UtilityService, AuthService, EnvironmentConfig } from '@core';
import { CustomNGXLoggerService, NGXLoggerHttpService } from 'ngx-logger';
import { ConfirmationDialogService } from 'app/shared-module/confirmation-dialog/confirmation-dialog.service';
import { HttpClient } from '@angular/common/http';
import { Constants as GlobalConstant } from '@global/infrastructure/constants';
import { ConfirmationDialogNotificationType, ConfirmationDialogNotificationCode } from '@shared/infrastructure/enums';
import { TranslateLoader, TranslateModule, TranslatePipe, TranslateService, TranslateFakeLoader } from '@ngx-translate/core';

import { TranslateStore } from '@ngx-translate/core/src/translate.store';
import { GlobalModule } from '@global/global.module';
import { Observable } from 'rxjs';

describe('ConfirmationDialogService', () => { 
    let confirmationDialogService: ConfirmationDialogService;
    let loggerService: LoggerService;
    let loggerServiceSpy: any;
    let httpMock: HttpTestingController;
    let translateService: TranslateService;
    
    beforeEach(() => {
        debugger;
        

        TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot(), HttpClientTestingModule, GlobalModule],
            providers: [ConfirmationDialogService, LoggerService, TranslateService, CustomNGXLoggerService, NGXLoggerHttpService, UtilityService, EnvironmentConfig, AuthService,
                {
                    provide: HttpClientService,
                    useFactory: httpClientServiceCreator,
                    deps: [HttpClient, UtilityService, AuthService]
                }]

        });
        confirmationDialogService = TestBed.get(ConfirmationDialogService);
        loggerService = TestBed.get(LoggerService);
        httpMock = TestBed.get(HttpTestingController);

        loggerServiceSpy = spyOn(loggerService, 'info').and.callThrough();

        translateService = TestBed.get(TranslateService);

    });

    it('should return an Observable of Location Group on Create request', () => {

        let translateServiceSpy = spyOn(translateService, "get")
         .and.callThrough();                   

        let notificationType=ConfirmationDialogNotificationType.Confirmation;
        let dialogType = ConfirmationDialogNotificationCode.DeleteQuoteItem;

        confirmationDialogService.openConfirmationDialog(dialogType,notificationType);
        
        expect(translateServiceSpy).toHaveBeenCalled();

    });
    
});

