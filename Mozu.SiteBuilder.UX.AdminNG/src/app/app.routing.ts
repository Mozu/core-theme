import { ModuleWithProviders } from '@angular/core';

import {
    Routes,
    RouterModule
} from '@angular/router';

import { PageNotFoundComponent } from '@core';

import { AuthGuardService, RoutingAuthGuardService } from '@global';

import { Constants } from '@shared';

import {  AdminDashboardComponent } from './admin-module';

import {  QuoteComponent, 
    QuotesListComponent } from './quotes-module';


const appRoutes: Routes = [
    {
        path: Constants.uiRoutes.empty,
        component: AdminDashboardComponent,
        canActivate: [RoutingAuthGuardService]
    },
    {
        path: Constants.uiRoutes.empty,
        component: AdminDashboardComponent,
        canActivate: [RoutingAuthGuardService]
    },
    {
        path: Constants.uiRoutes.quotes,
        component: QuotesListComponent
    },
    {
        path: Constants.uiRoutes.locationGroups,
        component: QuotesListComponent
    },
    {
        path: Constants.uiRoutes.quotesEdit+'/:quoteId',
        component: QuoteComponent
    },
    {
        path: '**',
        component: PageNotFoundComponent,
        canActivate: [AuthGuardService]
    }
];

export const routing: ModuleWithProviders = RouterModule.forRoot(appRoutes);
