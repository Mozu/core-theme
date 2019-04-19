import { ModuleWithProviders } from '@angular/core';

import {
    Routes,
    RouterModule
} from '@angular/router';

import { PageNotFoundComponent } from '@core';

import { AuthGuardService } from '@global';

import { Constants } from '@shared';
import {  AdminDashboardComponent } from './admin-module';
import {  QuotesEditComponent, QuotesListComponent } from './quotes-module';

const appRoutes: Routes = [
    {
        path: Constants.uiRoutes.empty,
        component: AdminDashboardComponent
    },
    {
        path: Constants.uiRoutes.empty,
        component: AdminDashboardComponent
    },
    {
        path: Constants.uiRoutes.quotes,
        component: QuotesListComponent
    },
    {
        path: Constants.uiRoutes.quotesEdit,
        component: QuotesEditComponent
    },
    {
        path: '**',
        component: PageNotFoundComponent,
        canActivate: [AuthGuardService]
    }
];

export const routing: ModuleWithProviders = RouterModule.forRoot(appRoutes);
