import { NgModule } from '@angular/core';
import { QuotesListComponent } from './quotes/list.component';
import { SharedModule } from '@shared/shared.module';
import { QuoteHomeComponent } from './home/home.component';
// plugins
import {TableModule} from 'primeng/table';


@NgModule({
  declarations: [QuotesListComponent, 
    QuoteHomeComponent],
  imports: [
    SharedModule,
    TableModule
  ]
})
export class QuotesModule { }
