import { Component, 
  OnInit } from '@angular/core';

import { Constants } from '@shared/infrastructure/constants';

@Component({
  selector: 'navigation-top-quote',
  templateUrl: './top-quotes.component.html',
  styleUrls: ['./top-quotes.component.css']
})
export class NavigationTopQuotesComponent implements OnInit {
  uiRoutes = Constants.uiRoutes.quotes;
  
  constructor() { }

  ngOnInit() { }

}
