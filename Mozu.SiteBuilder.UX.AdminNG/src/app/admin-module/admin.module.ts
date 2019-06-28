import { NgModule } from '@angular/core';
import { SharedModule } from '@shared/shared.module';
import { AdminDashboardComponent } from './index';

@NgModule({
    imports: [
        SharedModule
    ],
    declarations: [
        AdminDashboardComponent
    ],
    providers: [],
    exports: []
})

export class AdminModule { }
