import { Component, 
  OnInit } from '@angular/core';
import { LoggerService } from '@core';

import {
  NavigationContainerType
} from '@shared/index';

@Component({
  selector: 'quote-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class QuoteHomeComponent implements OnInit {
  navigationContainerType = NavigationContainerType;

  constructor(private _loggerService : LoggerService) { }

  ngOnInit() { }

}
