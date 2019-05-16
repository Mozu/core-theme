import { Component, 
  OnInit, 
  Input, 
  SimpleChanges, 
  SimpleChange, 
  OnChanges
} from '@angular/core';

import { LoggerService } from '@core';

@Component({
  selector: 'quote-summary',
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.css']
})
export class QuoteSummaryComponent implements OnChanges, OnInit {
  @Input('QuoteId') quoteId: string;
  @Input('Quote') quote: any;
  expirationDate: Date;

  constructor(private _loggerService : LoggerService) { }

  ngOnChanges(changes: SimpleChanges){
    this._loggerService.info("QuoteSummaryComponent : ngOnChanges");
    this.expirationDate = new Date(changes["quote"].currentValue.expirationDate);
  }

  ngOnInit() {

  }

}
