import { Component, OnInit } from '@angular/core';
import {  LoggerService, HttpError, ErrorCode, ErroNotificationType } from '@core'
import { QuotesService } from './quotes.service';
import { QuotesModel } from './quotes.model';

@Component({
  selector: 'quotes-list',
  templateUrl: './quotes.component.html',
  styleUrls: ['./quotes.component.css'],
  providers: [QuotesService]
})
export class QuotesComponent implements OnInit {
  model: QuotesModel;
  quoteListObj: object;
  cols: any[];
  quotes : QuotesModel[] = [];

  constructor(private _quotesService : QuotesService ,private _loggerService : LoggerService) { 
    this._loggerService.info("QuotesComponent : constructor");
  }

  ngOnInit() {
    this._loggerService.info("QuotesComponent : ngOnInit");
    this._quotesService.fetchAllQuotes().subscribe((successResponse) =>{
      this._loggerService.info("QuotesComponent : _quotesService.fetchAllQuotes_successResponse");
      this.quoteListObj = successResponse;
    }, (errResponse) => {
      this._loggerService.info("QuotesComponent : _quotesService.fetchAllQuotes_errResponse");
      throw new HttpError(ErrorCode.DashboardTilesGetFailed,ErroNotificationType.Toaster);
    })

    this.cols = [
      { field: 'vin', header: 'Vin' },
      { field: 'year', header: 'Year' },
      { field: 'brand', header: 'Brand' },
      { field: 'color', header: 'Color' }
  ];

  var obj = new QuotesModel();
  obj.b2bAccountName = "test1";
  obj.buyerName = "test1";
  obj.lastModifiedDate = new Date();
  obj.quoteName = "test1";
  obj.quoteTotal = 100;
  obj.status = "test1";
  this.quotes.push(obj);
  this.quotes.push(obj);
  this.quotes.push(obj);
  this.quotes.push(obj);

  }

}
