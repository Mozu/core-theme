import { Component, 
  OnInit, 
  Input
} from '@angular/core';

import { LoggerService } from '@core';

@Component({
  selector: 'quote-summary',
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.css']
})
export class QuoteSummaryComponent implements OnInit {
  @Input('QuoteId') quoteId: string;
  @Input('Quote') quote: any;

  constructor(private _loggerService : LoggerService) { }

  ngOnInit() {

  }

}
