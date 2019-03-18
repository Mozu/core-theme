import {
    NgModule,
    APP_INITIALIZER,
    ErrorHandler,
    ModuleWithProviders,
    SkipSelf,
    Optional
} from '@angular/core';

import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import {
    HttpModule,
    Http,
    BrowserXhr,
    RequestOptions,
    XHRBackend
} from '@angular/http';

import { LoggerModule, NgxLoggerLevel } from 'ngx-logger';
import { CookieService } from 'ngx-cookie-service';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import {
    LoggingErrorHandlerOptions,
    GlobalErrorHandlerComponent,
    GlobalErrorLoggingService,
    GlobalErrorDialogComponent
} from './errorHandling/index';

import {
    CustomBrowserXhr,
    HttpService,
    AuthService
} from './extensions/index';

import {
    ConfigurationSettings,
    EnvironmentConfig,
    UtilityService,
    ValidationService
} from './infrastructure/index';

import { LoggerService } from './services/logger.service';

import { PageNotFoundComponent } from './page-not-found/page-not-found.component';

import { SpinnerService } from './spinner/spinner.service';
import { ToastrService } from './services/toastr.service';

export function httpServiceFactory(backend: XHRBackend, options: RequestOptions, utilityService: UtilityService, authService: AuthService) {
    return new HttpService(backend, options, utilityService, authService);
}

@NgModule({
    imports: [
        BrowserModule,
        FormsModule,
        BrowserAnimationsModule,
        HttpModule,
        LoggerModule.forRoot(
            {
                serverLoggingUrl: '/api/logs',
                level: NgxLoggerLevel.DEBUG,
                serverLogLevel: NgxLoggerLevel.ERROR
            }),
        DialogModule,
        ToastModule
    ],
    declarations: [
        GlobalErrorDialogComponent,
        PageNotFoundComponent
    ],
    exports: [
        GlobalErrorDialogComponent,
        PageNotFoundComponent
    ],
    providers: [
        LoggerService,
        MessageService,
        ToastrService,
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
        {
            provide: BrowserXhr,
            useClass: CustomBrowserXhr
        },
        {
            provide: HttpService,
            useFactory: httpServiceFactory,
            deps: [XHRBackend, RequestOptions, UtilityService, AuthService]
        }
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
