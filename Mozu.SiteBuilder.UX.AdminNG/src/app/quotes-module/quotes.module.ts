import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

//import { QuotesRoutingModule } from './quotes-routing.module';
import { QuotesComponent } from './quotes/quotes.component';
import { SharedModule } from '@shared/shared.module';
import { QuoteHomeComponent } from './home/home.component';
// plugins
import {TableModule} from 'primeng/table';


@NgModule({
  declarations: [QuotesComponent, QuoteHomeComponent],
  imports: [
    CommonModule,
    //QuotesRoutingModule,
    SharedModule,
    TableModule
  ]
})
export class QuotesModule { }
