import { NgModule } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import {
    RouterModule
} from '@angular/router';

// plugins

import { TableModule } from 'primeng/table';
import {TreeTableModule} from 'primeng/treetable';

import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { SidebarModule } from 'primeng/sidebar';
import { TabViewModule } from 'primeng/tabview';
import { MenuModule } from 'primeng/menu';
import { CardModule } from 'primeng/card'
import { PanelMenuModule } from 'primeng/panelmenu';
import { TableModule } from 'primeng/table';
import { NgbCarouselModule, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';

import { NgbCarouselModule, NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { environment } from '../../environments/environment';

import {
    RestrictInput,
    EnableDisableControls
} from './directive/index';

import {
    NavigationComponent,
    NavigationTopShellComponent,
    NavigationLeftComponent,
    AccessTileComponent,
    NavigationTopQuotesComponent,
    NavigationTopLocationGroupsComponent,
    HeaderComponent,
    AppHomeComponent,
    PhysicalLocationsComponent,
    LocationsListComponent,
    SelectedLocationsComponent
 } from './index';

import {
    DatexPipe,
    EllipsisPipe,
    SafeHtmlPipe,
    SplitPipe,
    PhonePipe
} from './pipes/index';

import {SidebarModule} from 'primeng/sidebar';
import {TabViewModule} from 'primeng/tabview';
import {MenuModule} from 'primeng/menu';;
import {CardModule } from 'primeng/card'
import {PanelMenuModule} from 'primeng/panelmenu';
//import { PhysicalLocationsComponent } from './physical/locations.component';

declare var resourcesVersion: any;

export function createTranslateLoader(http: HttpClient) {
    return new TranslateHttpLoader(http, environment.appUrl + '/assets/i18n/', '.json?v=' + resourcesVersion);
}

@NgModule({
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        FormsModule,
        RouterModule,
        SidebarModule,
        CardModule,
        TabViewModule,
        MenuModule,
        DialogModule,
        ToastModule,
        NgbCarouselModule,
        PanelMenuModule,
        TreeTableModule,
        TableModule,
        NgbModule,
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: (createTranslateLoader),
                deps: [HttpClient]
            }
        }),
        TableModule,
        NgSelectModule
    ],
    declarations: [
        // pipes
        DatexPipe,
        EllipsisPipe,
        SafeHtmlPipe,
        SplitPipe,
        PhonePipe,

        // directives
        RestrictInput,
        EnableDisableControls,

        // components
        NavigationComponent,
        NavigationTopShellComponent,
        NavigationLeftComponent,
        SpinnerComponent,
        HeaderComponent,
        AppHomeComponent,
        AccessTileComponent,
        NavigationTopQuotesComponent,
        NavigationTopLocationGroupsComponent,
        SearchBarComponent,
        PhysicalLocationsComponent,
        LocationsListComponent,
        SelectedLocationsComponent
    ],
    providers: [
        ConfirmationDialogService
    ],
    entryComponents: [DynamicLinksDialogComponent],
    exports: [
        // Angular modules
        BrowserModule,
        BrowserAnimationsModule,
        FormsModule,
        RouterModule,

        // plugins
        DialogModule,
        ToastModule,
        NgbCarouselModule,
        TranslateModule,
        MenuModule,
        SidebarModule,
        CardModule,
        TabViewModule,
        PanelMenuModule,
        TreeTableModule,
        TableModule,
        // pipes
        DatexPipe,
        EllipsisPipe,
        SafeHtmlPipe,
        SplitPipe,
        PhonePipe,
        
        // directives
        RestrictInput,
        EnableDisableControls,

        // shared components
        NavigationComponent,
        NavigationTopShellComponent,
        NavigationLeftComponent,
        SpinnerComponent,
        HeaderComponent,
        AppHomeComponent,
        AccessTileComponent,
        NavigationTopQuotesComponent,
        NavigationTopLocationGroupsComponent,
        SearchBarComponent,
        PhysicalLocationsComponent,
        LocationsListComponent,
        SelectedLocationsComponent
    ]
})

export class SharedModule { }
