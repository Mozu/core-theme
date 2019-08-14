import { Component, Input, OnInit } from '@angular/core';
import { NotificationService } from '@global';
import { NavigationContainerType, Constants } from '@shared/infrastructure';
import { AdvancedFilterModel, QuoteFilter } from './search-bar.model';
import * as _ from 'lodash';


@Component({
  selector: 'search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.css']
})
export class SearchBarComponent implements OnInit {
  @Input() navigationContainerType: string;
  @Input() isEditMode: boolean;
  navigationType = NavigationContainerType;
  public model: AdvancedFilterModel;
  public quoteFilter: QuoteFilter;

  status = false;
  constructor(private _notificationService: NotificationService) { }

  ngOnInit() {
    this.model = new AdvancedFilterModel();
    this.quoteFilter = new QuoteFilter();
    this.model.searchBox = this.quoteFilter.searchBarkeyword + this.quoteFilter.searchBarQuoteName + this.quoteFilter.searchBarQuoteId;
  }

  toggleIcon(searchBar: any) {
    this.status = searchBar.currentTarget && searchBar.currentTarget.value ? searchBar.currentTarget.value.length > 0 : false;
  }

  resetSerach(searchBar: HTMLInputElement) {
    searchBar.value = '';
    this.status = false;
    switch (this.navigationContainerType) {
      case NavigationContainerType.quotes:
        this._notificationService.notifyQuoteSearched(searchBar.value);
        break;
    }
  }

  search(value: string) {
    switch (this.navigationContainerType) {
      case NavigationContainerType.quotes:
        this._notificationService.notifyQuoteSearched(value);
        break;
    }
  }

}
