import { Component, OnInit, Input, SimpleChanges } from '@angular/core';

import { LoggerService } from '@core';

@Component({
  selector: 'quote-items',
  templateUrl: './items.component.html',
  styleUrls: ['./items.component.css']
})
export class QuoteItemsComponent implements OnInit {
  @Input('QuoteId') quoteId: string;
  @Input('Quote') quote: any;

  quoteItems = [];
  constructor(private _loggerService : LoggerService) { }

  ngOnChanges(changes: SimpleChanges){
    this._loggerService.info("QuoteItemsComponent : ngOnChanges");
    this.quoteItems = changes["quote"].currentValue;
  }
  
  ngOnInit() {
  }

}
