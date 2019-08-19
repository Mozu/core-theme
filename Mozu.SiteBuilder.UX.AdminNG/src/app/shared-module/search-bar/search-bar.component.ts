import { Component, Input, OnInit } from '@angular/core';
import { NotificationService } from '@global';
import { NavigationContainerType, Constants, QuotesAdvFilterFields } from '@shared/infrastructure';
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

  constructor(private _notificationService: NotificationService) { }

  ngOnInit() {
    this.model = new AdvancedFilterModel();
    this.quoteFilter = new QuoteFilter();
    this.model.searchBox = this.quoteFilter.searchBarkeyword + this.quoteFilter.searchBarQuoteName + this.quoteFilter.searchBarQuoteId;
  }

  toggleIcon(searchBar: any) {
    this.model.status = searchBar.currentTarget && searchBar.currentTarget.value ? searchBar.currentTarget.value.length > 0 : false;
  }

  resetSerach(searchBar: HTMLInputElement) {
    searchBar.value = '';
    this.model.status = false;
    switch (this.navigationContainerType) {
      case NavigationContainerType.quotes:
          this.resetAdvancedFilterValue();
        this._notificationService.notifyQuoteSearched(searchBar.value);
        break;
    }
  }

  search(value: string) {
    switch (this.navigationContainerType) {
      case NavigationContainerType.quotes:
        this.setAdvancedFilterValue(value);
        console.log(_.pickBy(this.quoteFilter, _.identity));
        this._notificationService.notifyQuoteSearched(JSON.stringify(this.quoteFilter));
        break;
    }
  }

  modelChanged() {
    this.model.status = true;
    this.model.searchBox = this.quoteFilter.searchBarkeyword + this.quoteFilter.searchBarQuoteName + this.quoteFilter.searchBarQuoteId;
  }

  setAdvancedFilterValue(filterValue: string) {
      this.resetAdvancedFilterValue();
      this.model.splittedValues = _.split(filterValue, ' ');

      this.model.splittedValues.forEach((item, index) => {
        const colonIndex = _.indexOf(item, Constants.advancedFilter.keyValueDelimiter),
            key = (colonIndex !== -1) ? item.substr(0, colonIndex) : Constants.advancedFilter.keyword,
            isKeywordSearch = (colonIndex === -1 || !this.isFieldSupported(key));

        if (isKeywordSearch) {
            this.addKeywordOrAppendToLastKey(item, index);
        } else {
            this.addKeyValue(key, item, colonIndex);
        }
      });
  }

  public isFieldSupported = (keyField) => {
    let match;
    if (!keyField) {
        return false;
    }
    match = Object.keys(QuotesAdvFilterFields).filter(index => _.lowerCase(QuotesAdvFilterFields[index]) === _.lowerCase(keyField));
    return match !== null;
  }

  public addKeyValue = (key: any, item: string, colonIndex: number) => {
    this.quoteFilter[key] = item.substr(colonIndex + Constants.advancedFilter.keyValueDelimiter.length);
    this.model.lastKey = key;
  }

  public addKeywordOrAppendToLastKey = (item: any, index: number) => {
    if (index === 0) {
      this.model.lastKey = Constants.advancedFilter.keyword;
      this.quoteFilter[this.model.lastKey] = item;
    } else if (this.model.lastKey) {
      this.quoteFilter[this.model.lastKey] = _.trim(this.quoteFilter[this.model.lastKey] + ' ' + item);
    }
  }

  resetAdvancedFilterValue() {
    this.quoteFilter.keyword = '';
    this.quoteFilter.quoteName = '';
    this.quoteFilter.quoteId = null;
  }
}

