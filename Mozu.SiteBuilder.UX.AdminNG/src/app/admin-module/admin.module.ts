import {
    NgModule,
    ModuleWithProviders,
    SkipSelf,
    Optional
} from '@angular/core';

import { 
    AdminHomeComponent,
    AdminDashboardComponent 
} from './index';
import { SharedModule } from '@shared/shared.module';

@NgModule({
    imports: [
        SharedModule
    ],
    declarations: [
        AdminHomeComponent,
        AdminDashboardComponent
    ],
    providers: [
    ],
    exports: [
        
    ]
})

export class AdminModule { }