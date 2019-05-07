import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LoggerService, HttpError, ErrorCode, ErroNotificationType } from '@core';
import { QuotesEditService } from './edit.service';
import { QuotesEditModel } from './edit.model';

@Component({
  selector: 'quotes-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.css'],
  providers: [QuotesEditService]
})
export class QuotesEditComponent implements OnInit {
  quoteId: string;
  public model: QuotesEditModel;

  constructor(private route: ActivatedRoute,
    private _quotesEditService: QuotesEditService,
    private _loggerService : LoggerService ) { }

  ngOnInit() {
    this._loggerService.info("QuotesEditComponent : ngOnInit");
    this.model = new QuotesEditModel();
    this.model.items = [];

    this.quoteId = this.route.snapshot.paramMap.get("quoteId");
    this.quoteId = '0da178726c6b9e27784ebfec0000432a';
    this.populateQuote(this.quoteId);
  }

  public populateQuote = (quoteId:string) => {
    
    this._loggerService.info("QuotesEditComponent : populateQuote");

    this._quotesEditService.fetchAllQuotes().subscribe((successResponse:Response) =>{
      this._loggerService.info("QuotesEditComponent : _quotesListService.fetchAllQuotes_quotesResponse");
       let responseJson = successResponse;
        if (responseJson != null && responseJson != undefined && responseJson['items'].length > 0) {
          this.model.items = responseJson['items'].filter(item => item.id === quoteId)[0];
        }
    }, (errResponse) => {
      this._loggerService.info("QuotesEditComponent : _quotesListService.fetchAllQuotes_errResponse");
      throw new HttpError(ErrorCode.QuoteListGetFailed,ErroNotificationType.Toaster);
    })
  }
}
