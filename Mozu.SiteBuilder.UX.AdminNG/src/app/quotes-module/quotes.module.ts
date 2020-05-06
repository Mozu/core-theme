import { NgModule } from '@angular/core';

import { TableModule } from 'primeng/table';

import {CalendarModule} from 'primeng/calendar';

import {FileUploadModule} from 'primeng/fileupload';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { SharedModule } from '@shared/shared.module';

import { QuotesListComponent } from './list';

import { QuoteComponent,
  QuoteSummaryComponent } from './quote';

import { QuoteItemsComponent } from './quote/items/items.component';

import { QuoteNegotiationCommentsComponent,
  QuoteNegotiationComponent } from './quote/negotiation';

@NgModule({
  declarations: [
    QuotesListComponent,
    QuoteComponent,
    QuoteSummaryComponent,
    QuoteItemsComponent,
    QuoteNegotiationComponent,
    QuoteNegotiationCommentsComponent
  ],
  imports: [
    SharedModule,
    TableModule,
    CalendarModule,
    FileUploadModule,
    NgbModule
  ],
  entryComponents: [
    QuoteItemsComponent
  ]
})
export class QuotesModule { }
