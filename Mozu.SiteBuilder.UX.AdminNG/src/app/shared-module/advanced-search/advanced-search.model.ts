import { Constants } from '@shared';
import * as _ from 'lodash';

export class AdvancedFilterModel {
    searchField: any;
    splittedValues: any;
    lastKey: string;
    status = false;
    today = new Date();
    isExpirationToValid = false;
    filterModel: FilterModel;

    get populateSearchField(): string {
        const names = Object.getOwnPropertyNames(FilterModel.prototype);
        let getters = names.filter((name) => {
            const result = Object.getOwnPropertyDescriptor(FilterModel.prototype, name);
            return !!result.get;
        });

        getters = _.concat(getters, this.filterModel.GetAllGetters());
        _.forEach(getters, property => { this.searchField ? this.searchField += this.filterModel[property] : this.searchField = this.filterModel[property] });

        return this.searchField;
    }
}

export abstract class FilterModel {
    keyword = '';
    get getSearchBarkeyword(): string {
        return this.keyword ? this.keyword + ' ' : '';
    }
    public abstract ResetFilterValue(): void;
    public abstract GetAllGetters(): string[];
}

export class QuoteFilterModel extends FilterModel {
    name = '';
    quoteId: number = null;
    accountUserLastName = '';
    accountName = '';
    expirationFrom: Date;
    expirationTo: Date;
    projectName = '';

    public ResetFilterValue() {
        this.keyword = '';
        this.name = '';
        this.quoteId = null;
        this.accountUserLastName = '';
        this.accountName = '';
        this.expirationFrom = null;
        this.expirationTo = null;
        this.projectName = '';
    }

    public GetAllGetters(): string[] {
        const names = Object.getOwnPropertyNames(QuoteFilterModel.prototype);
        const getters = names.filter((name) => {
            const result = Object.getOwnPropertyDescriptor(QuoteFilterModel.prototype, name);
            return !!result.get;
        });
        return getters;
    }

    get getSearchBarQuoteName(): string {
        return this.name ? Constants.advancedFilter.name + Constants.advancedFilter.keyValueDelimiter + this.name + ' ' : '';
    }
    get getSearchBarQuoteId(): string {
        return this.quoteId ? Constants.advancedFilter.quoteId + Constants.advancedFilter.keyValueDelimiter + this.quoteId + ' ' : '';
    }
    get getSearchBarAccountUserLastName(): string {
        return this.accountUserLastName ? Constants.advancedFilter.accountUserLastName + Constants.advancedFilter.keyValueDelimiter + this.accountUserLastName + ' ' : '';
    }
    get getSearchBarAccountName(): string {
        return this.accountName ? Constants.advancedFilter.accountName + Constants.advancedFilter.keyValueDelimiter + this.accountName + ' ' : '';
    }

    set setSearchBarExpirationFrom(expirationDate: any) {
        this.expirationFrom = expirationDate;
    }
    get getSearchBarExpirationFrom(): string {
        return this.expirationFrom ? Constants.advancedFilter.expirationFrom + Constants.advancedFilter.keyValueDelimiter + this.expirationFrom + ' ' : '';
    }

    set setSearchBarExpirationTo(expirationDate: any) {
        this.expirationTo = expirationDate;
    }
    get getSearchBarExpirationTo(): string {
        return this.expirationTo ? Constants.advancedFilter.expirationTo + Constants.advancedFilter.keyValueDelimiter + this.expirationTo + ' ' : '';
    }
    get getProjectName(): string {
        return this.projectName ? Constants.advancedFilter.projectName + Constants.advancedFilter.keyValueDelimiter + this.projectName + ' ' : '';
    }
}
