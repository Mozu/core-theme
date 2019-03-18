import {
    NgModule,
    APP_INITIALIZER,
    ErrorHandler,
    ModuleWithProviders,
    SkipSelf,
    Optional
} from '@angular/core';

import {
    AuthGuardService,
    NotificationService,
    SharedData,
    SharedDataService
} from './services/index';

import {    
    FocusManager,
    FocusManagerHelperService
} from './focus-manager/index';

export function sharedDataServiceFactory(service: SharedDataService) {
    return () => service.populateCommonData();
}

@NgModule({
    imports: [

    ],
    declarations: [
        FocusManager
    ],
    providers: [
        AuthGuardService,
        SharedDataService,
        NotificationService,
        FocusManagerHelperService,
        {
            provide: APP_INITIALIZER,
            useFactory: sharedDataServiceFactory,
            deps: [SharedDataService],
            multi: true
        }
    ],
    exports: [
        FocusManager
    ]
})

export class GlobalModule {

    //Prevent global module to be injected multiple times
    constructor( @Optional() @SkipSelf() parentModule: GlobalModule) {
        if (parentModule) {
            throw new Error(
                'GlobalModule is already loaded. Import it in the AppModule only');
        }
    }

    static forRoot(): ModuleWithProviders {
        return {
            ngModule: GlobalModule,
            providers: [
                
            ]
        };
    }
}