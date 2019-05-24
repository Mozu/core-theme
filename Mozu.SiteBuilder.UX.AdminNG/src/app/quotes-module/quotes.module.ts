import { NgModule } from '@angular/core';

import { TableModule } from 'primeng/table';

import {CalendarModule} from 'primeng/calendar';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { SharedModule } from '@shared/shared.module';

import { QuotesListComponent } from './list';

import { QuoteComponent, 
  QuoteSummaryComponent } from './quote';
  
import { QuoteItemsComponent } from './quote/items/items.component';

@NgModule({
  declarations: [
    QuotesListComponent,
    QuoteComponent,
    QuoteSummaryComponent,
    QuoteItemsComponent
  ],
  imports: [
    SharedModule,
    TableModule,
    CalendarModule,
    NgbModule.forRoot()
  ],
  entryComponents: [
    QuoteItemsComponent
  ]
})
export class QuotesModule { }
