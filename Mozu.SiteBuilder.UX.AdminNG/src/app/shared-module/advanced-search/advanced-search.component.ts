import { Component, Input, OnInit } from '@angular/core';
import { NotificationService } from '@global';
import * as _ from 'lodash';
import { NavigationContainerType, Constants, QuoteFilterStatus } from '@shared/infrastructure';
import { AdvancedFilterModel, FilterModel } from './advanced-search.model';
import { AccountInfoService } from '@shared/account/information/information.service';
import { B2BAccountListModel } from '@shared/account/information';
import { ErroNotificationType, ErrorCode, HttpError, LoggerService } from '@core';
import { QuoteFilterModel } from 'app/quotes-module/quote-filter.model';

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
  public b2bAccounts: any[];
  public quoteStatus: any;

  constructor(private _notificationService: NotificationService,
    private _accountInfoService: AccountInfoService,
    private _loggerService: LoggerService) { }

  ngOnInit() {
    this.model = new AdvancedFilterModel();
    this.filterModel = new QuoteFilterModel();
    this.model.filterModel = this.filterModel;
    this.quoteStatus = Object.values(QuoteFilterStatus);
  }

  toggleIcon(searchBar: any) {
    this.model.isIconToggled = searchBar.currentTarget && searchBar.currentTarget.value ? searchBar.currentTarget.value.length > 0 : false;
  }

  resetSerach(searchBar: HTMLInputElement) {
    searchBar.value = '';
    this.model.isIconToggled = false;
    switch (this.navigationContainerType) {
      case NavigationContainerType.quotes:
        this.filterModel.resetFilterValue();
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

  modelChanged() {
    this.model.isIconToggled = true;
    this.model.searchField = '';
    this.model.searchField = this.model.populateSearchField;
  }

  setAdvancedFilterValue(filterValue: string) {
    this.filterModel.resetFilterValue();
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

  public populateB2BAccounts = () => {
    this._accountInfoService.fetchAllB2BAccounts().subscribe((fetchB2BAccountsResponse: B2BAccountListModel) => {
      if (fetchB2BAccountsResponse !== null && fetchB2BAccountsResponse !== undefined) {
        this.b2bAccounts = fetchB2BAccountsResponse.items;
      }
    },
      (errResponse) => {
        this._loggerService.info('AccountInformationComponent : _accountInfoService.fetchB2BAccounts_errResponse');
        throw new HttpError(ErrorCode.GetAccountInfoFailed, ErroNotificationType.Toaster);
      });
  }
}

