import { Component, 
  OnInit } from '@angular/core';

import { Router } from '@angular/router';

import { LoggerService, 
  HttpError, 
  ErrorCode, 
  ErroNotificationType,
  SpinnerService} from '@core'

import { TranslateService } from '@ngx-translate/core';

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
  
  constructor(private _quotesListService : QuotesListService ,
    private _loggerService : LoggerService, 
    private _translate: TranslateService,
    private router: Router,
    private _spinner: SpinnerService) { }

  ngOnInit() {
    this._loggerService.info("QuotesListComponent : ngOnInit");
    this.model = new QuotesListModel(); 
    this.model.numberOfRows =  Constants.numberOfRows; 
    this.model.items = [];
    this.model.quoteGridContextMenuItem =[];
    
    this._translate.get('QUOTES.GridContextMenu').subscribe((successResponse) => { 
      this.gridContextMenu(successResponse);
    });
    
    this.populateQuoteGrid();    
  }

  onRowSelect(event) {
    this.model.selectedQuote = event.data;
  };

  public gridContextMenu = (contextMenu) => {
    this.model.quoteGridContextMenuItem.push({ label: contextMenu.edit, command: (event) => this.viewQuote() })
  }

  viewQuote(){
    let quoteId =  this.model.selectedQuote.id;
    this.router.navigate(['/' + Constants.uiRoutes.quotesEdit + '/' + quoteId]);
  }

  public populateQuoteGrid = () => {
    this._spinner.start();
    this._loggerService.info("QuotesListComponent : populateQuoteGrid");

    this._quotesListService.fetchAllQuotes().subscribe((quotesListSuccessResponse:Response) =>{
      this._loggerService.info("QuotesListComponent : _quotesListService.fetchAllQuotes_quotesResponse");
       let responseJson = quotesListSuccessResponse;
        if (responseJson != null && responseJson != undefined && responseJson['items'].length > 0) {
          this.model.items = responseJson['items'];
        }
          this._spinner.stop();
    }, (errResponse) => {
      this._spinner.stop();
      this._loggerService.info("QuotesListComponent : _quotesListService.fetchAllQuotes_errResponse");
      throw new HttpError(ErrorCode.QuoteListGetFailed,ErroNotificationType.Toaster);
    })
  }
}
