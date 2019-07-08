import { ModuleWithProviders } from '@angular/core';

import {
    Routes,
    RouterModule
} from '@angular/router';

import { PageNotFoundComponent } from '@core';

import { AuthGuardService, QuoteLocationGroupRouteGuardService  } from '@global';

import { Constants } from '@shared';

import {  AdminDashboardComponent } from './admin-module';

import {  
    QuotesEditComponent, 
    QuotesListComponent 
} from './quotes-module';
import { LocationGroupConfigComponent } from './location-groups-module/config/config.component';

import {
    LocationGroupsListComponent,
    LocationGroupCreateComponent 
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
        path:Constants.uiRoutes.locationGroupCreate,
        component: LocationGroupCreateComponent,
        data: {
            mode: Constants.gridActionItem.New
          }
    },
    {
        path: Constants.uiRoutes.locationGroupEdit+'/:id',
        component: LocationGroupCreateComponent,
        data: {
            mode: Constants.gridActionItem.Edit
          }
    },
    {
        path: Constants.uiRoutes.locationGroupConfig+'/:id'+'/:siteId',
        component: LocationGroupConfigComponent,
        data: {
            mode: Constants.gridActionItem.Edit
          }
    },
    {
        path: '**',
        component: PageNotFoundComponent,
        canActivate: [AuthGuardService]
    }
];

export const routing: ModuleWithProviders = RouterModule.forRoot(appRoutes);
