import { NgModule } from '@angular/core';

import { TableModule } from 'primeng/table';

import {CalendarModule} from 'primeng/calendar';

import { SharedModule } from '@shared/shared.module';

import {
  QuotesListComponent,
  QuotesEditComponent
} from './quotes';
import { QuoteInformationComponent } from './quotes/edit/quote-information/quote-information.component';

@NgModule({
  declarations: [
    QuotesListComponent,
    QuotesEditComponent,
    QuoteInformationComponent],
  imports: [
    SharedModule,
    TableModule,
    CalendarModule
  ]
})
export class QuotesModule { }
