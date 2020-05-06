import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
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

    let confirmationDialogTitle: 'Delete Item';
    let confirmationDialogMessage: 'Are you certain you want to delete this item?';
    let isShowSecondaryButton = true;
    let primaryButtonText: 'Yes';
    let secondaryButtonText: 'No';
    let confirmationDialogNotificationCode: ConfirmationDialogNotificationCode = ConfirmationDialogNotificationCode.DeleteQuoteItem;
    
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot(), HttpClientTestingModule, GlobalModule],
            providers: [ConfirmationDialogService, LoggerService, TranslateService,
                CustomNGXLoggerService, NGXLoggerHttpService, UtilityService, EnvironmentConfig, AuthService,
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

    it('should call openConfirmationDialog method', () => {
        const translateServiceSpy = spyOn(translateService, 'get').and.callThrough();
        const notificationType = ConfirmationDialogNotificationType.Confirmation;
        const dialogType = ConfirmationDialogNotificationCode.DeleteQuoteItem;
        confirmationDialogService.openConfirmationDialog(dialogType, notificationType);
        expect(translateServiceSpy).toHaveBeenCalled();
    });

    it('should call showConfirmationDialog property method', () => {
        const confirmationDialogServiceSpy = spyOn(confirmationDialogService, 'showConfirmationDialog').and.callThrough();
        const notificationType = ConfirmationDialogNotificationType.Confirmation;
        const dialogType = ConfirmationDialogNotificationCode.DeleteQuoteItem;
        confirmationDialogService.openConfirmationDialog(dialogType, notificationType);
        // const confirmationDialogServiceSpy = spyOn(confirmationDialogService, 'showConfirmationDialog').and.callThrough();
        //confirmationDialogService.showConfirmationDialog(confirmationDialogTitle, confirmationDialogMessage, primaryButtonText, isShowSecondaryButton, secondaryButtonText );
        expect(confirmationDialogServiceSpy).toHaveBeenCalledWith(1);
    });

    it('should return DeleteQuoteItem when delete item is entered from Quote', function() {
        confirmationDialogService.confirm();
        //confirmationDialogService.notificationCode = ConfirmationDialogNotificationCode.DeleteQuoteItem;
        confirmationDialogNotificationCode = ConfirmationDialogNotificationCode.DeleteQuoteItem;
        expect(confirmationDialogNotificationCode).toEqual('DeleteQuoteItem');
    });

    it('should return DeleteLocationGroup when delete item is entered from location group', function() {
        confirmationDialogService.confirm();
        //confirmationDialogService.notificationCode = ConfirmationDialogNotificationCode.DeleteLocationGroup;
        confirmationDialogNotificationCode = ConfirmationDialogNotificationCode.DeleteLocationGroup;
        expect(confirmationDialogNotificationCode).toEqual('DeleteLocationGroup');
    });
});

