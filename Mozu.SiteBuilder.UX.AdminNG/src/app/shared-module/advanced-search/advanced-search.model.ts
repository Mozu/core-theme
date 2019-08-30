import { Constants } from '@shared';

export class AdvancedFilterModel {
    searchField: any;
    splittedValues: any;
    lastKey: string;
    status = false;
    today = new Date();
    isExpirationToValid = false;
}

export class QuoteFilter {
    keyword: any = null;
    name = '';
    quoteId: number = null;
    accountUserLastName = '';
    accountName = '';
    expirationFrom: Date;
    expirationTo: Date;

    get getSearchBarkeyword(): string {
        return this.keyword ? this.keyword + ' ' : '';
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
}
