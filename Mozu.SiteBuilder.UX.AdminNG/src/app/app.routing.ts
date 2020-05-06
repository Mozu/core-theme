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
    LocationGroupsListComponent,
    LocationGroupCreateComponent
} from './location-groups-module';

import {
    QuoteComponent,
    QuotesListComponent
} from './quotes-module';
import { LocationGroupConfigComponent } from './location-groups-module/config/config.component';


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
        path: Constants.uiRoutes.quotesEdit + '/:quoteId',
        component: QuoteComponent
    },
    {
        path: Constants.uiRoutes.locationGroups,
        component: LocationGroupsListComponent
    },
    {
        path: Constants.uiRoutes.locationGroupCreate,
        component: LocationGroupCreateComponent,
        data: {
            mode: Constants.gridActionItem.New
          }
    },
    {
        path: Constants.uiRoutes.locationGroupEdit + '/:locationGroupCode',
        component: LocationGroupCreateComponent,
        data: {
            mode: Constants.gridActionItem.Edit
          }
    },
    {
        path: Constants.uiRoutes.locationGroupConfig +'/:locationGroupCode'+'/:siteId',
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
