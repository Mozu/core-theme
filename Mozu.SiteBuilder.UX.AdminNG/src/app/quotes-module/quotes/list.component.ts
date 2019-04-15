import { Component, 
  OnInit } from '@angular/core';
import { LoggerService, 
  HttpError, 
  ErrorCode, 
  ErroNotificationType } from '@core'
import { QuotesListService } from './list.service';
import { QuotesListModel} from './list.model';

@Component({
  selector: 'quotes-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css'],
  providers: [QuotesListService]
})
export class QuotesListComponent implements OnInit {
  public model: QuotesListModel;

  constructor(private _quotesListService : QuotesListService ,private _loggerService : LoggerService) { }

  ngOnInit() {
    this._loggerService.info("QuotesListComponent : ngOnInit");
    this.model = new QuotesListModel();
    this.populateQuoteGrid();
  }

  public populateQuoteGrid = () => {
    this.model.items = [];
    this._loggerService.info("QuotesListComponent : populateQuoteGrid");

    this._quotesListService.fetchAllQuotes().subscribe((successResponse:Response) =>{
      this._loggerService.info("QuotesListComponent : _quotesListService.fetchAllQuotes_quotesResponse");
      let responseJson = successResponse.json();
        if (responseJson != null && responseJson != undefined && responseJson['items'].length > 0) {
          this.model.items = responseJson['items'];
        }
    }, (errResponse) => {
      this._loggerService.info("QuotesListComponent : _quotesListService.fetchAllQuotes_errResponse");
      throw new HttpError(ErrorCode.QuoteListGetFailed,ErroNotificationType.Toaster);
    })
  }
}
