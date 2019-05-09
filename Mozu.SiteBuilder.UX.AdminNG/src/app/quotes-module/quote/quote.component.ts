import { Component, 
  OnInit } from '@angular/core';

import { ActivatedRoute } from '@angular/router';

import * as _ from 'lodash';

import { LoggerService, 
  HttpError, 
  ErrorCode, 
  ErroNotificationType } from '@core';

import { QuoteService } from './quote.service';

import { QuoteItem } from './quote.model';

@Component({
  selector: 'quote',
  templateUrl: './quote.component.html',
  styleUrls: ['./quote.component.css'],
  providers: [QuoteService]
})
export class QuoteComponent implements OnInit {
  quoteId: string;
  userId: any;
  public model: QuoteItem;

  constructor(private route: ActivatedRoute,
    private _quoteService: QuoteService,
    private _loggerService : LoggerService ) { }

  ngOnInit() {
    this._loggerService.info("QuoteComponent : ngOnInit");
    this.model = new QuoteItem();
    this.model.items = [];

    this.quoteId = this.route.snapshot.paramMap.get("quoteId");
    this.populateQuote(this.quoteId);
  }

  public populateQuote = (quoteId:string) => {
    
    this._loggerService.info("QuoteComponent : populateQuote");

    this._quoteService.fetchAllQuotes().subscribe((successResponse:Response) =>{
      this._loggerService.info("QuoteComponent : _quotesListService.fetchAllQuotes_quotesResponse");
       let responseJson = successResponse;
        if (responseJson != null && responseJson != undefined && responseJson['items'].length > 0) {
          this.model = _.filter(responseJson['items'], function (el : any) { return el.id == quoteId })[0];
          this.userId = this.model.userId; 
        }
    }, (errResponse) => {
      this._loggerService.info("QuoteComponent : _quotesListService.fetchAllQuotes_errResponse");
      throw new HttpError(ErrorCode.QuoteListGetFailed,ErroNotificationType.Toaster);
    })
  }
}
