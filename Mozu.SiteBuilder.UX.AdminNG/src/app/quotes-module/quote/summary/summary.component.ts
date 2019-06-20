import { Component,
  Input,
  SimpleChanges,
  OnChanges
} from '@angular/core';

import { LoggerService } from '@core';

@Component({
  selector: 'quote-summary',
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.css']
})
export class QuoteSummaryComponent implements OnChanges {
  @Input('QuoteId') quoteId: string;
  @Input('Quote') quote: any;
  quoteInfo = [];

  constructor(private _loggerService: LoggerService) { }

  ngOnChanges(changes: SimpleChanges) {
    this._loggerService.info('QuoteSummaryComponent : ngOnChanges');
    this.quoteInfo = changes['quote'].currentValue;
  }

}
