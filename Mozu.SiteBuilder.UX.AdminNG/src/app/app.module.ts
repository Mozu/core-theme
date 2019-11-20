import { BrowserModule } from '@angular/platform-browser';
import {
  NgModule,
  ErrorHandler
} from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {
  CurrencyPipe,
  DatePipe
} from '@angular/common';
import { GlobalErrorHandlerComponent } from '@core';
import { CoreModule } from '@core/core.module';
import { GlobalModule } from '@global/global.module';
import { SharedModule } from '@shared/shared.module';
import { AdminModule } from 'app/admin-module/admin.module';
import { QuotesModule } from 'app/quotes-module/quotes.module';
import { LocationGroupsModule } from 'app/location-groups-module/location.groups.module';
import { routing } from './app.routing';
import { AppComponent } from './app.component';
import { environment } from '../environments/environment';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    CoreModule.forRoot(
      {
        environmentName: environment.environmentName
        , apiTokenUrl: ''
        , appUrl: environment.appUrl
        , domain: environment.domain
      }),
    GlobalModule.forRoot(),
    BrowserAnimationsModule, // required animations module
    SharedModule,
    AdminModule,
    QuotesModule,
    LocationGroupsModule,
    routing,
  ],
  providers: [
    CurrencyPipe,
    DatePipe
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
