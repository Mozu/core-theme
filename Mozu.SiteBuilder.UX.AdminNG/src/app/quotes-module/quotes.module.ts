import { NgModule } from '@angular/core';

import { TableModule } from 'primeng/table';

import { SharedModule } from '@shared/shared.module';

import {
  QuotesListComponent,
  QuotesEditComponent
} from './quotes/index';

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
