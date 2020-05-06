import { Component,
  Input,
  SimpleChanges,
  OnChanges
} from '@angular/core';

import { LoggerService, SpinnerService } from '@core';

@Component({
  selector: 'quote-summary',
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.css']
})
export class QuoteSummaryComponent implements OnChanges {  
  @Input('Quote') quote: any;
  quoteInfo = [];

  constructor(private _loggerService : LoggerService,
    private _spinner: SpinnerService) { }

  ngOnChanges(changes: SimpleChanges) {
    this._loggerService.info('QuoteSummaryComponent : ngOnChanges');
    this.quoteInfo = changes['quote'].currentValue;
  }

}
