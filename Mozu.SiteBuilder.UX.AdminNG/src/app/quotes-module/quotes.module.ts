import { NgModule } from '@angular/core';
import { QuotesListComponent, QuotesEditComponent } from './quotes';
import { SharedModule } from '@shared/shared.module';
import { QuoteHomeComponent } from './home/home.component';
// plugins
import {TableModule} from 'primeng/table';


@NgModule({
  declarations: [QuotesListComponent, 
    QuoteHomeComponent,
    QuotesEditComponent],
  imports: [
    SharedModule,
    TableModule
  ]
})
export class QuotesModule { }
