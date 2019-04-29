import { NgModule } from '@angular/core';
import { HttpClient} from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import {
    RouterModule
} from '@angular/router';

// plugins

import { DialogModule } from 'primeng/dialog';
import {ToastModule} from 'primeng/toast';

import { NgbCarouselModule } from '@ng-bootstrap/ng-bootstrap';

import {TranslateModule, TranslateLoader} from '@ngx-translate/core';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';

import {
    RestrictInput,
    EnableDisableControls
} from './directive/index';

import {
    HeaderComponent
} from './header/index';

import { SpinnerComponent } from './spinner/spinner.component';
import { 
    NavigationComponent,
    NavigationTopShellComponent,
    NavigationLeftComponent,
    AccessTileComponent,
    NavigationTopQuotesComponent
 } from './index';

import {
    DatexPipe,
    EllipsisPipe,
    SafeHtmlPipe,
    SplitPipe,
    UserNameInitial,
    SplitLoggedUserName
} from './pipes/index';;

import {SidebarModule} from 'primeng/sidebar';
import {TabViewModule} from 'primeng/tabview';
import {MenuModule} from 'primeng/menu';;
import {CardModule } from 'primeng/card'
import {PanelMenuModule} from 'primeng/panelmenu';
import { SearchBarComponent } from './search-bar/search-bar.component'

declare var resourcesVersion: any;

export function createTranslateLoader(http: HttpClient) {
    return new TranslateHttpLoader(http, './assets/i18n/', '.json?v=' + resourcesVersion);
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
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: (createTranslateLoader),
                deps: [HttpClient]
            }
        })
    ],
    declarations: [
        // pipes
        DatexPipe,
        EllipsisPipe,
        SafeHtmlPipe,
        SplitPipe,
        UserNameInitial,
        SplitLoggedUserName,

        // directives
        RestrictInput,
        EnableDisableControls,

        // components
        NavigationComponent,
        NavigationTopShellComponent,
        NavigationLeftComponent,
        SpinnerComponent,
        HeaderComponent,
        AccessTileComponent,
        NavigationTopQuotesComponent,
        SearchBarComponent    ],
    providers: [
        
    ],
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
        // pipes
        DatexPipe,
        EllipsisPipe,
        SafeHtmlPipe,
        SplitPipe,
        UserNameInitial,
        SplitLoggedUserName,

        // directives
        RestrictInput,
        EnableDisableControls,

        // shared components
        NavigationComponent,
        NavigationTopShellComponent,
        NavigationLeftComponent,
        SpinnerComponent,
        HeaderComponent,
        AccessTileComponent,
        NavigationTopQuotesComponent,
        SearchBarComponent
    ]
})

export class SharedModule { }
