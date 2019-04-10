import { Component, OnInit } from '@angular/core';
import {  LoggerService, HttpError, ErrorCode, ErroNotificationType } from '@core'
import { QuotesService } from './quotes.service';
import { QuotesModel, QuoteItem, AuditInfo } from './quotes.model';

@Component({
  selector: 'quotes-list',
  templateUrl: './quotes.component.html',
  styleUrls: ['./quotes.component.css'],
  providers: [QuotesService]
})
export class QuotesComponent implements OnInit {
  public model: QuotesModel;

  constructor(private _quotesService : QuotesService ,private _loggerService : LoggerService) { 
    this._loggerService.info("QuotesComponent : constructor");
  }

  ngOnInit() {
    this._loggerService.info("QuotesComponent : ngOnInit");
    this.model = new QuotesModel();
    this.populateQuoteGrid();
  }

  public populateQuoteGrid = () => {
    this.model.items = [];
    this._loggerService.info("QuotesComponent : populateQuoteGrid");

    this._quotesService.fetchAllQuotes().subscribe((successResponse:Response) =>{
      this._loggerService.info("QuotesComponent : _quotesService.fetchAllQuotes_quotesResponse");
      let responseJson = successResponse.json();
        var tempQuoteArray = [];
        if (responseJson != null && responseJson != undefined && responseJson['items'].length > 0) {
          responseJson['items'].forEach(eachQuotes => {

          let quoteItem = new QuoteItem();
          quoteItem.tenantId = eachQuotes.tenantId;
          quoteItem.customerInteractionType = eachQuotes.customerInteractionType;
          quoteItem.auditInfo = new AuditInfo();
          quoteItem.auditInfo.createDate = eachQuotes.auditInfo.createDate;
          quoteItem.name = eachQuotes.name;
          quoteItem.feeTotal = eachQuotes.feeTotal;
          quoteItem.currencyCode = eachQuotes.currencyCode;
          tempQuoteArray.push(quoteItem);
        });
        this.model.items = tempQuoteArray;
      }
    }, (errResponse) => {
      this._loggerService.info("QuotesComponent : _quotesService.fetchAllQuotes_errResponse");
      throw new HttpError(ErrorCode.QuoteListGetFailed,ErroNotificationType.Toaster);
    })
  }
}
