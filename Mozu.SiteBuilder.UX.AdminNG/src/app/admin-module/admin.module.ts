import { NgModule } from '@angular/core';

import { AdminDashboardComponent } from './index';
import { SharedModule } from '@shared/shared.module';

@NgModule({
    imports: [
        SharedModule
    ],
    declarations: [
        AdminDashboardComponent
    ],
    providers: [
    ],
    exports: [
        
    ]
})

export class AdminModule { }