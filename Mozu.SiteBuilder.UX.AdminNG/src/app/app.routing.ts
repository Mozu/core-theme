import { ModuleWithProviders } from '@angular/core';

import {
    Routes,
    RouterModule
} from '@angular/router';

import { PageNotFoundComponent } from '@core';

import { AuthGuardService } from '@global';

import { Constants } from '@shared';
import { AdminHomeComponent } from './admin-module';
import { QuoteHomeComponent } from './quotes-module';

const appRoutes: Routes = [
    {
        path: Constants.uiRoutes.empty,
        component: AdminHomeComponent
    },
    {
        path: Constants.uiRoutes.quotes, // "http://sb.ngdev06.kibong-dev.com/Admin/qoutes"
        component: QuoteHomeComponent,
    },
    {
        path: '**',
        component: PageNotFoundComponent,
        canActivate: [AuthGuardService]
    }
];

export const routing: ModuleWithProviders = RouterModule.forRoot(appRoutes);
