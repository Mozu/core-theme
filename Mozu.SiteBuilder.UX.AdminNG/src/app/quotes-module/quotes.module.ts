import { NgModule } from '@angular/core';

import { SharedModule } from '@shared/shared.module';

import {
  QuotesListComponent,
  QuotesEditComponent
} from './quotes';

// plugins
import { TableModule } from 'primeng/table';


@NgModule({
  declarations: [
    QuotesListComponent,
    QuotesEditComponent],
  imports: [
    SharedModule,
    TableModule
  ]
})
export class QuotesModule { }
