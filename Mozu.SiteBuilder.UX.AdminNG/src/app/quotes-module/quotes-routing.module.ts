import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { Constants } from '@shared';

import { QuoteHomeComponent } from './home/home.component';


const routes: Routes = [
  {
    path: Constants.uiRoutes.quotes, // "http://sb.ngdev06.kibong-dev.com/Admin/qoutes"
    component: QuoteHomeComponent,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class QuotesRoutingModule { }
