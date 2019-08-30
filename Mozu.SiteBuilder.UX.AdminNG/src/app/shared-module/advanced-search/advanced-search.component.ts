import { Component, Input, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { NotificationService } from '@global';
import * as _ from 'lodash';
import { NavigationContainerType, Constants, QuotesAdvFilterFields } from '@shared/infrastructure';
import { AdvancedFilterModel, QuoteFilter } from './advanced-search.model';

@Component({
  selector: 'advanced-search',
  templateUrl: './advanced-search.component.html',
  styleUrls: ['./advanced-search.component.css']
})
export class AdvancedSearchComponent implements OnInit {
  @Input() navigationContainerType: string;
  @Input() isEditMode: boolean;
  navigationType = NavigationContainerType;
  public model: AdvancedFilterModel;
  public quoteFilter: QuoteFilter;

  constructor(private _notificationService: NotificationService,
    private datePipe: DatePipe) { }

  ngOnInit() {
    this.model = new AdvancedFilterModel();
    this.quoteFilter = new QuoteFilter();
    this.model.searchField = this.quoteFilter.getSearchBarkeyword + this.quoteFilter.getSearchBarQuoteName + this.quoteFilter.getSearchBarQuoteId + this.quoteFilter.getSearchBarAccountName + this.quoteFilter.getSearchBarAccountUserLastName;
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
        this._notificationService.notifyQuoteSearched(JSON.stringify(_.pickBy(_.pick(this.quoteFilter, _.keys(this.quoteFilter)), _.identity)));
        break;
    }
  }

  modelChanged(event, keyField) {
    this.setDateValueToModel(event, keyField);
    this.fieldValidations();

    this.model.status = true;
    this.model.searchField = this.quoteFilter.getSearchBarkeyword + this.quoteFilter.getSearchBarQuoteName +
    this.quoteFilter.getSearchBarQuoteId + this.quoteFilter.getSearchBarAccountName +
    this.quoteFilter.getSearchBarAccountUserLastName + this.quoteFilter.getSearchBarExpirationFrom +
    (!this.model.isExpirationToValid ? this.quoteFilter.getSearchBarExpirationTo : '');
  }

  fieldValidations() {
    if (new Date(this.quoteFilter.expirationTo) < new Date(this.quoteFilter.expirationFrom)) {
      this.model.isExpirationToValid = true;
    } else {
      this.model.isExpirationToValid = false;
    }
  }

  setDateValueToModel(event: any, keyField: string) {
    switch (keyField) {
      case Constants.advancedFilter.from:
          this.quoteFilter.expirationFrom = event;
        this.quoteFilter.setSearchBarExpirationFrom = event ?  this.datePipe.transform(event, Constants.advSearchDateFormat) : '';
        break;

      case Constants.advancedFilter.to:
          this.quoteFilter.expirationTo = event;
          this.quoteFilter.setSearchBarExpirationTo = event ?  this.datePipe.transform(event, Constants.advSearchDateFormat) : '';
          break;
      default:
        break;
    }
  }

  setAdvancedFilterValue(filterValue: string) {
    this.resetAdvancedFilterValue();
    this.model.splittedValues = _.split(filterValue, Constants.advancedFilter.searchFieldSeperator);

    this.model.splittedValues.forEach((item, index) => {
      if (item) {
      const colonIndex = _.indexOf(item, Constants.advancedFilter.keyValueDelimiter),
        key = (colonIndex !== -1) ? item.substr(0, colonIndex) : Constants.advancedFilter.keyword,
        isKeywordSearch = (colonIndex === -1 || !this.isFieldSupported(key));

      if (isKeywordSearch) {
        this.addKeywordOrAppendToLastKey(item, index);
      } else {
        this.addKeyValue(key, item, colonIndex);
      }
    }
    });
  }

  public isFieldSupported = (keyField: any) => {
    let match: any;
    if (!keyField) {
      return false;
    }
    match = Object.keys(QuotesAdvFilterFields).filter(index => _.lowerCase(QuotesAdvFilterFields[index]) === _.lowerCase(keyField));
    return match !== null;
  }

  public addKeyValue = (key: any, item: string, colonIndex: number) => {
    if (!key.includes(Constants.advancedFilter.dateKeyword)) {
      this.quoteFilter[key] = item.substr(colonIndex + Constants.advancedFilter.keyValueDelimiter.length);
    }
    this.model.lastKey = key;
  }

  public addKeywordOrAppendToLastKey = (item: any, index: number) => {
    if (index === 0) {
      this.model.lastKey = Constants.advancedFilter.keyword;
      this.quoteFilter[this.model.lastKey] = item;
    } else if (this.model.lastKey) {
      this.quoteFilter[this.model.lastKey] = _.trim(this.quoteFilter[this.model.lastKey] + Constants.advancedFilter.searchFieldSeperator + item);
    }
  }

  resetAdvancedFilterValue() {
    this.quoteFilter.keyword = '';
    this.quoteFilter.name = '';
    this.quoteFilter.quoteId = null;
    this.quoteFilter.accountUserLastName = '';
    this.quoteFilter.accountName = '';
  }
}

