import { Component, Input, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { NotificationService } from '@global';
import * as _ from 'lodash';
import { NavigationContainerType, Constants } from '@shared/infrastructure';
import { AdvancedFilterModel, FilterModel, QuoteFilterModel } from './advanced-search.model';

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
  public filterModel: FilterModel;

  constructor(private _notificationService: NotificationService,
    private datePipe: DatePipe) { }

  ngOnInit() {
    this.model = new AdvancedFilterModel();
    this.filterModel = new QuoteFilterModel();
    this.model.filterModel = this.filterModel;
  }

  toggleIcon(searchBar: any) {
    this.model.status = searchBar.currentTarget && searchBar.currentTarget.value ? searchBar.currentTarget.value.length > 0 : false;
  }

  resetSerach(searchBar: HTMLInputElement) {
    searchBar.value = '';
    this.model.status = false;
    switch (this.navigationContainerType) {
      case NavigationContainerType.quotes:
        this.filterModel.ResetFilterValue();
        this._notificationService.notifyQuoteSearched(searchBar.value);
        break;
    }
  }

  search(value: string) {
    switch (this.navigationContainerType) {
      case NavigationContainerType.quotes:
        this.setAdvancedFilterValue(value);
        this._notificationService.notifyQuoteSearched(JSON.stringify(_.pickBy(_.pick(this.filterModel, _.keys(this.filterModel)), _.identity)));
        break;
    }
  }

  modelChanged(event?, keyField?) {
    this.setDateValueToModel(event, keyField);
    this.fieldValidations();

    this.model.status = true;
    this.model.searchField = '';
    this.model.searchField = this.model.populateSearchField;
  }

  fieldValidations() {
    //this.model.isExpirationToValid = this.filterModel.expirationTo && this.filterModel.expirationFrom ? (new Date(this.filterModel.expirationTo) < new Date(this.filterModel.expirationFrom)) : false;
  }

  setDateValueToModel(event: any, keyField: string) {
    // switch (keyField) {
    //   case Constants.advancedFilter.from:
    //     this.filterModel.expirationFrom = event;
    //     this.filterModel.setSearchBarExpirationFrom = event ? this.datePipe.transform(event, Constants.advSearchDateFormat) : '';
    //     break;

    //   case Constants.advancedFilter.to:
    //     this.filterModel.expirationTo = event;
    //     this.filterModel.setSearchBarExpirationTo = event ? this.datePipe.transform(event, Constants.advSearchDateFormat) : '';
    //     break;
    //   default:
    //     break;
    // }
  }

  setAdvancedFilterValue(filterValue: string) {
    this.filterModel.ResetFilterValue();
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
    const keys = Object.keys(this.filterModel);
    match = Object.keys(this.filterModel).filter(index => _.lowerCase(this.filterModel[index]) === _.lowerCase(keyField));
    return match !== null;
  }

  public addKeyValue = (key: any, item: string, colonIndex: number) => {
    if (!key.includes(Constants.advancedFilter.dateKeyword)) {
      this.filterModel[key] = item.substr(colonIndex + Constants.advancedFilter.keyValueDelimiter.length);
    }
    this.model.lastKey = key;
  }

  public addKeywordOrAppendToLastKey = (item: any, index: number) => {
    if (index === 0) {
      this.model.lastKey = Constants.advancedFilter.keyword;
      this.filterModel[this.model.lastKey] = item;
    } else if (this.model.lastKey) {
      this.filterModel[this.model.lastKey] = _.trim(this.filterModel[this.model.lastKey] + Constants.advancedFilter.searchFieldSeperator + item);
    }
  }
}

