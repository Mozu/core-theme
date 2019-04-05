import { Component, OnInit } from '@angular/core';
import { LoggerService } from '@core';

import {
  TopNavigationFlag
} from '@shared/index';

@Component({
  selector: 'quote-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class QuoteHomeComponent implements OnInit {
  quotesNavigation = TopNavigationFlag.quotes;

  constructor(private _loggerService : LoggerService) { 
    this._loggerService.info("QuoteHomeComponent : constructor");
  }

  ngOnInit() {
    this._loggerService.info("QuoteHomeComponent : ngOnInit");
    
  }

}
