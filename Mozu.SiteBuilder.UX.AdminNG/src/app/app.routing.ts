import { ModuleWithProviders } from '@angular/core';

import {
    Routes,
    RouterModule
} from '@angular/router';

import { PageNotFoundComponent } from '@core';

import { AuthGuardService, QuoteLocationGroupRouteGuardService  } from '@global';

import { Constants } from '@shared';

import {  AdminDashboardComponent } from './admin-module';

import {  QuoteComponent, 
    QuotesListComponent } from './quotes-module';

import {LocationGroupsListComponent  
         } from './location-groups-module';  

const appRoutes: Routes = [
    {
        path: Constants.uiRoutes.empty,
        component: AdminDashboardComponent,
        canActivate: [QuoteLocationGroupRouteGuardService]
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
        path:Constants.uiRoutes.locationGroups,
        component: LocationGroupsListComponent
    },
    {
        path: '**',
        component: PageNotFoundComponent,
        canActivate: [AuthGuardService]
    }
];

export const routing: ModuleWithProviders = RouterModule.forRoot(appRoutes);
