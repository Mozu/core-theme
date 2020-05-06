import { NgModule } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TableModule } from 'primeng/table';
import {TreeTableModule} from 'primeng/treetable';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { SidebarModule } from 'primeng/sidebar';
import { TabViewModule } from 'primeng/tabview';
import { MenuModule } from 'primeng/menu';
import { CardModule } from 'primeng/card';
import { PanelMenuModule } from 'primeng/panelmenu';
import {ListboxModule} from 'primeng/listbox';
import { DropdownModule } from 'primeng/dropdown';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { NgbCarouselModule, NgbModule, NgbDateAdapter, NgbDateNativeAdapter } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { PaginatorModule } from 'primeng/paginator';
 

import { environment } from '../../environments/environment';
import { CookieService } from 'ngx-cookie-service';


import {
    RestrictInput,
    EnableDisableControls
} from './directive/index';

import {
    NavigationComponent,
    NavigationTopShellComponent,
    NavigationLeftSearchComponent,
    NavigationLeftSandBoxComponent,
    NavigationLeftUserActionComponent,
    NavigationLeftComponent,
    AccessTileComponent,
    NavigationTopQuotesComponent,
    HeaderLocationGroupsComponent,
    HeaderComponent,
    HeaderOmsNavigationComponent,
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
    SafeResourceUrlPipe,
    DateTypecastPipe
} from './pipes/index';

// import { PhysicalLocationsComponent } from './physical/locations.component';
import { DynamicLinksDialogComponent } from './dynamic-links-dialog/dynamic-links-dialog.component';
import { AdvancedSearchComponent } from './advanced-search/advanced-search.component';
import { AccountInformationComponent } from './account/information/information.component';
import { ConfirmationDialogComponent } from './confirmation-dialog/confirmation-dialog.component';
import { ShippingAddressComponent, ShippingMethodComponent } from './shipping';
import { AuditLogComponent } from './audit-log/audit-log.component';
import { SpinnerComponent } from './spinner/spinner.component';
import { ToggleGridColumnsComponent } from './toggle-grid-columns/toggle-grid-columns.component';
import { ProgressButtonService } from './progress-button/progress-button.service';
import { DatepickerComponent } from './datepicker/datepicker.component';
import { AccountInfoService } from './account/information/information.service';
import { DateCompareDirective} from './directive/datepicker-compare-validator.directive';
import { DateService } from './datepicker/datepicker.service';
import { PaginatedNgSelectComponent } from './paginated-ngselect/paginated-ngselect.component';


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
        DropdownModule,
        AutoCompleteModule,
        OverlayPanelModule,
        ScrollPanelModule,
        PaginatorModule,
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
        SafeResourceUrlPipe,
        DateTypecastPipe,
        // directives
        RestrictInput,
        EnableDisableControls,
        DateCompareDirective,
        // components
        NavigationComponent,
        NavigationTopShellComponent,
        NavigationLeftSandBoxComponent,
        NavigationLeftSearchComponent,
        NavigationLeftUserActionComponent,
        NavigationLeftComponent,
        SpinnerComponent,
        HeaderComponent,
        HeaderOmsNavigationComponent,
        AppHomeComponent,
        AccessTileComponent,
        NavigationTopQuotesComponent,        
        HeaderLocationGroupsComponent,
        AdvancedSearchComponent,
        PhysicalLocationsComponent,
        LocationsListComponent,
        SelectedLocationsComponent,
        DynamicLinksDialogComponent,
        AccountInformationComponent,
        ConfirmationDialogComponent,
        ShippingAddressComponent,
        ShippingMethodComponent,
        AuditLogComponent,
        ToggleGridColumnsComponent,
        ProgressButtonComponent,
        DatepickerComponent,
        PaginatedNgSelectComponent
    ],
    providers: [
        ConfirmationDialogService,
        ProgressButtonService,
        {
            provide: NgbDateAdapter,
            useClass: NgbDateNativeAdapter
        },
        AccountInfoService,
        DateService,
        CookieService
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
        ScrollPanelModule,
        // pipes
        DatexPipe,
        EllipsisPipe,
        SafeHtmlPipe,
        SplitPipe,
        PhonePipe,
        SafeResourceUrlPipe,
        DateTypecastPipe,
        // directives
        RestrictInput,
        EnableDisableControls,
        DateCompareDirective,

        // shared components
        NavigationComponent,
        NavigationTopShellComponent,
        NavigationLeftSearchComponent,
        NavigationLeftSandBoxComponent,
        NavigationLeftSandBoxComponent,
        NavigationLeftUserActionComponent,
        NavigationLeftComponent,
        SpinnerComponent,
        HeaderComponent,
        HeaderOmsNavigationComponent,
        AppHomeComponent,
        AccessTileComponent,
        NavigationTopQuotesComponent,
        
        HeaderLocationGroupsComponent,
        AdvancedSearchComponent,
        PhysicalLocationsComponent,
        LocationsListComponent,
        SelectedLocationsComponent,
        DynamicLinksDialogComponent,
        AccountInformationComponent,
        ConfirmationDialogComponent,
        ShippingAddressComponent,
        ShippingMethodComponent,
        AuditLogComponent,
        ToggleGridColumnsComponent,
        ProgressButtonComponent,
        DatepickerComponent,
        PaginatedNgSelectComponent
    ]
})

export class SharedModule { }
