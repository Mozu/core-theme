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

  cols: any[];
  
  constructor(private _quotesService : QuotesService ,private _loggerService : LoggerService) { 
    this._loggerService.info("QuotesComponent : constructor");
  }

  ngOnInit() {
    this._loggerService.info("QuotesComponent : ngOnInit");
    this.model = new QuotesModel();
    this.model.items = [];
    this.populateQuoteGrid();

  }

  public populateQuoteGrid = () => {
    this._loggerService.info("QuotesComponent : populateQuoteGrid");
    this._quotesService.fetchAllQuotes().subscribe((quotesResponse) =>{
      
      this._loggerService.info("QuotesComponent : _quotesService.fetchAllQuotes_quotesResponse");
      
      if (quotesResponse != null && quotesResponse != undefined) {
        quotesResponse.items.forEach(eachQuotes => {
          let quoteItem = new QuoteItem();

          quoteItem.tenantId = eachQuotes.tenantId;
          quoteItem.customerInteractionType = eachQuotes.customerInteractionType;
          quoteItem.auditInfo = new AuditInfo();
          quoteItem.auditInfo.createDate = eachQuotes.auditInfo.createDate;
          quoteItem.name = eachQuotes.name;
          quoteItem.feeTotal = eachQuotes.feeTotal;
          quoteItem.currencyCode = eachQuotes.currencyCode;
          this.model.items.push(quoteItem);

        });
      }
    
    }, (errResponse) => {
      this._loggerService.info("QuotesComponent : _quotesService.fetchAllQuotes_errResponse");
      //throw new HttpError(ErrorCode.DashboardTilesGetFailed,ErroNotificationType.Toaster);
    })
    
  }

}
