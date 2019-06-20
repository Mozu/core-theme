import {
  Component,
  OnInit
} from '@angular/core';

import { ActivatedRoute } from '@angular/router';

import * as _ from 'lodash';

import {
  LoggerService,
  HttpError,
  ErrorCode,
  ErroNotificationType
} from '@core';

import { QuoteService } from './quote.service';

import { QuoteItemModel } from './quote.model';

@Component({
  selector: 'quote',
  templateUrl: './quote.component.html',
  styleUrls: ['./quote.component.css'],
  providers: [QuoteService]
})
export class QuoteComponent implements OnInit {
  quoteId: string;
  userId: any;
  public model: QuoteItemModel;
  customerAccountId: number;

  constructor(private route: ActivatedRoute,
    private _quoteService: QuoteService,
    private _loggerService: LoggerService) { }

  ngOnInit() {
    this._loggerService.info('QuoteComponent : ngOnInit');
    this.model = new QuoteItemModel();
    this.quoteId = this.route.snapshot.paramMap.get('quoteId');
    this.populateQuote(this.quoteId);
  }

  public populateQuote = (quoteId: string) => {

    this._loggerService.info('QuoteComponent : populateQuote');

    this._quoteService.fetchAllQuotes().subscribe((quoteListSuccessResponse: Response) => {
      this._loggerService.info('QuoteComponent : _quoteListService.fetchAllQuotes_quotesResponse');
      if (quoteListSuccessResponse !== null && quoteListSuccessResponse !== undefined && quoteListSuccessResponse['items'].length > 0) {
        this.model = _.filter(quoteListSuccessResponse['items'],
          function (el: any) {
            return el.id === quoteId;
          })[0];
        this.userId = this.model.userId;
        this.customerAccountId = this.model.customerAccountId;
      }
    }, (quoteListErrResponse) => {
      this._loggerService.info('QuoteComponent : _quotesListService.fetchAllQuotes_errResponse');
      throw new HttpError(ErrorCode.QuoteListGetFailed, ErroNotificationType.Toaster);
    });
  }
}
