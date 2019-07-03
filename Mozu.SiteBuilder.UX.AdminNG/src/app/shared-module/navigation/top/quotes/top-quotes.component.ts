import { Component,
  OnInit } from '@angular/core';

import { Constants } from '@shared/infrastructure/constants';

@Component({
  selector: 'navigation-top-quote',
  templateUrl: './top-quotes.component.html',
  styleUrls: ['./top-quotes.component.css']
})
export class NavigationTopQuotesComponent {
  uiRoutes = Constants.uiRoutes.quotes;
  status = false;

  constructor() { }

  toggleIcon(searchBar: HTMLInputElement) {
      this.status = true;
      if(searchBar.value.length === 1) {
        this.status = false;
      }
  }

  resetSerach(searchBar: HTMLInputElement) {
    searchBar.value = '';
    this.status = false;
  }

}