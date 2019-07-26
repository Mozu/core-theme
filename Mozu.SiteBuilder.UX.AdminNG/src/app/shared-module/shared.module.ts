import { NgModule } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TableModule } from 'primeng/table';
import { TreeTableModule } from 'primeng/treetable';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { SidebarModule } from 'primeng/sidebar';
import { TabViewModule } from 'primeng/tabview';
import { MenuModule } from 'primeng/menu';
import { CardModule } from 'primeng/card';
import { PanelMenuModule } from 'primeng/panelmenu';
import { DropdownModule } from 'primeng/dropdown';
import { SelectItem } from 'primeng/api';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { OverlayPanelModule } from 'primeng/overlaypanel';
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
    SelectedLocationsComponent,
    ConfirmationDialogService,
    ProgressButtonComponent
 } from './index';

import {
    DatexPipe,
    EllipsisPipe,
    SafeHtmlPipe,
    SplitPipe,
    PhonePipe,
    SafeResourceUrlPipe
} from './pipes/index';

import { DynamicLinksDialogComponent } from './dynamic-links-dialog/dynamic-links-dialog.component';
import { SearchBarComponent } from './search-bar/search-bar.component';
import { AccountInformationComponent } from './account/information/information.component';
import { ConfirmationDialogComponent } from './confirmation-dialog/confirmation-dialog.component';
import { SpinnerComponent } from './spinner/spinner.component';
import { FulfillerComponent } from './fulfiller/fulfiller.component';
import { ToggleGridColumnsComponent } from './toggle-grid-columns/toggle-grid-columns.component';
import { ProgressButtonService } from './progress-button/progress-button.service';


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
        ListboxModule,
        TreeTableModule,
        TableModule,
        NgbModule.forRoot(),
        DropdownModule,
        AutoCompleteModule,
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
        SafeResourceUrlPipe,

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
        SelectedLocationsComponent,
        DynamicLinksDialogComponent,
        AccountInformationComponent,
        ConfirmationDialogComponent,
        FulfillerComponent,
        ShippingAddressComponent,
        ShippingMethodComponent,
        AuditLogComponent,
        ToggleGridColumnsComponent,
        ProgressButtonComponent
    ],
    providers: [
        ConfirmationDialogService,
        ProgressButtonService
    ],
    entryComponents: [DynamicLinksDialogComponent],
    exports: [
        // Angular modules
        BrowserModule,
        BrowserAnimationsModule,
        FormsModule,
        ReactiveFormsModule,
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
        ListboxModule,
        TreeTableModule,
        TableModule,
        OverlayPanelModule,
        // pipes
        DatexPipe,
        EllipsisPipe,
        SafeHtmlPipe,
        SplitPipe,
        PhonePipe,
        SafeResourceUrlPipe,

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
        SelectedLocationsComponent,
        DynamicLinksDialogComponent,
        AccountInformationComponent,
        ConfirmationDialogComponent,
        FulfillerComponent,
        ShippingAddressComponent,
        ShippingMethodComponent,
        AuditLogComponent,
        ToggleGridColumnsComponent,
        ProgressButtonComponent
    ]
})

export class SharedModule { }
