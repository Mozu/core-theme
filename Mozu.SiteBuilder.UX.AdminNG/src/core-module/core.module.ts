import { HttpClient } from '@angular/common/http';

import { ErrorHandler,
         ModuleWithProviders,
         NgModule,
         Optional,
         SkipSelf } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { BrowserXhr } from '@angular/http';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CookieService } from 'ngx-cookie-service';

import { LoggerModule,
         NgxLoggerLevel } from 'ngx-logger';

import { MessageService } from 'primeng/api';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';

import { GlobalErrorDialogComponent,
         GlobalErrorHandlerComponent,
         GlobalErrorLoggingService,
         LoggingErrorHandlerOptions } from './errorHandling/index';

import { HttpClientService,
         httpClientServiceCreator } from './extensions/http-client.service';

import { AuthService,
         CustomBrowserXhr } from './extensions/index';

import { ConfigurationSettings,
         EnvironmentConfig,
         UtilityService,
         ValidationService } from './infrastructure/index';

import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { LoggerService } from './services/logger.service';
import { SpinnerService } from './spinner/spinner.service';
import { ToastrComponent, TostrService } from './tostr/index';

@NgModule({
    imports: [
        BrowserModule,
        FormsModule,
        BrowserAnimationsModule,
        LoggerModule.forRoot(
            {
                serverLoggingUrl: '/api/logs',
                level: NgxLoggerLevel.TRACE,
                serverLogLevel: NgxLoggerLevel.INFO
            }),
        DialogModule,
        ToastModule
    ],
    declarations: [
        GlobalErrorDialogComponent,
        PageNotFoundComponent,
        ToastrComponent
    ],
    exports: [
        GlobalErrorDialogComponent,
        PageNotFoundComponent,
        ToastrComponent
    ],
    providers: [
        LoggerService,
        MessageService,
        TostrService,
        CookieService,
        UtilityService,
        ValidationService,
        AuthService,
        SpinnerService,
        GlobalErrorLoggingService,
        {
            provide: LoggingErrorHandlerOptions,
            useValue: {
                isRethrowError: ConfigurationSettings.isRethrowErrorInsideGlobalErrorHandler,
                isUnwrapError: ConfigurationSettings.isUnwrapErrorInsideGlobalErrorHandler,
                isLogErrorToConsole: ConfigurationSettings.islogErrorToConsoleInsideGlobalErrorHandler,
                isSendErrorToServer: ConfigurationSettings.isSendErrorToServerInsideGlobalErrorHandler,
                isShowErrorDialog: ConfigurationSettings.isShowErrorDialogInsideGlobalErrorHandler
            }
        },
        {
            provide: ErrorHandler,
            useClass: GlobalErrorHandlerComponent
        },
        // {
        //     provide: BrowserXhr,
        //     useClass: CustomBrowserXhr
        // },
        {
            provide: HttpClientService,
            useFactory: httpClientServiceCreator,
            deps: [HttpClient, UtilityService, AuthService]
        },

    ]
})

export class CoreModule {

    // Prevent core module to be injected multiple times
    constructor( @Optional() @SkipSelf() parentModule: CoreModule) {
        if (parentModule) {
            throw new Error(
                'CoreModule is already loaded. Import it in the AppModule only');
        }
    }

    static forRoot(config: EnvironmentConfig): ModuleWithProviders {
        return {
            ngModule: CoreModule,
            providers: [
                { provide: EnvironmentConfig, useValue: config }
            ]
        };
    }

}
