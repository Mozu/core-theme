import { ModuleWithProviders } from '@angular/core';

import {
    Routes,
    RouterModule
} from '@angular/router';

import { PageNotFoundComponent } from '@core';

import { AuthGuardService } from '@global';

import { Constants } from '@shared';
import { AdminHomeComponent } from './admin-module';

const appRoutes: Routes = [
    {
        path: Constants.uiRoutes.empty,
        component: AdminHomeComponent
    },
    {
        path: '**',
        component: PageNotFoundComponent,
        canActivate: [AuthGuardService]
    }
];

export const routing: ModuleWithProviders = RouterModule.forRoot(appRoutes);
