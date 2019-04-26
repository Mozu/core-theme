import { Component, 
  OnInit } from '@angular/core';

import { Router } from '@angular/router';

import { MenuItem } from 'primeng/api';

import { LoggerService, 
  HttpError, 
  ErrorCode, 
  ErroNotificationType} from '@core'

import { Constants } from '@shared';

import { QuotesListService } from './list.service';

import { QuotesListModel } from './list.model';

@Component({
  selector: 'quotes-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css'],
  providers: [QuotesListService]
})
export class QuotesListComponent implements OnInit {
  public model: QuotesListModel;
  numerOfRows = Constants.numerOfRows;
  menuItem: MenuItem[];
  selectedQuote: any;
  
  constructor(private _quotesListService : QuotesListService ,private _loggerService : LoggerService, private router: Router) { }

  ngOnInit() {
    this._loggerService.info("QuotesListComponent : ngOnInit");
    this.model = new QuotesListModel();
    this.model.items = [];
    //p-menu items
    this.menuItem = [
      { label: 'Edit', command: (event) => this.viewQuote() }
    ];
    this.populateQuoteGrid();    
  }

  onRowSelect(event) {
    this.selectedQuote = event.data;
  };

  viewQuote(){
    let tenantId =  this.selectedQuote.tenantId;
    this.router.navigate(['/' + Constants.uiRoutes.quotesEdit + '/' + tenantId]);
    //this.menuItem[0].routerLink = ['/quotesEdit/' + this.selectedQuote.tenantId]
  }

  public populateQuoteGrid = () => {
    
    this._loggerService.info("QuotesListComponent : populateQuoteGrid");

    this._quotesListService.fetchAllQuotes().subscribe((successResponse:Response) =>{
      this._loggerService.info("QuotesListComponent : _quotesListService.fetchAllQuotes_quotesResponse");
       let responseJson = successResponse;
        if (responseJson != null && responseJson != undefined && responseJson['items'].length > 0) {
          this.model.items = responseJson['items'];
        }
    }, (errResponse) => {
      this._loggerService.info("QuotesListComponent : _quotesListService.fetchAllQuotes_errResponse");
      throw new HttpError(ErrorCode.QuoteListGetFailed,ErroNotificationType.Toaster);
    })
  }
}
