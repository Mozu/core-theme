import { Constants } from '@shared';

export class AdvancedFilterModel {
    searchBox: any;
    splittedValues: any;
    lastKey: string;
    status = false;
}

export class QuoteFilter {
    keyword: any = null;
    quoteName = '';
    quoteId: number = null;
    accountUser = '';
    accountName = '';
    expirationDateFrom: Date;
    expirationDateTo: Date;

    get getSearchBarkeyword(): string {
        return this.keyword ? this.keyword + ' ' : '';
    }
    get getSearchBarQuoteName(): string {
        return this.quoteName ? Constants.advancedFilter.quoteName + Constants.advancedFilter.keyValueDelimiter + this.quoteName + ' ' : '';
    }
    get getSearchBarQuoteId(): string {
        return this.quoteId ? Constants.advancedFilter.quoteId + Constants.advancedFilter.keyValueDelimiter + this.quoteId + ' ' : '';
    }
    get getSearchBarAccountUser(): string {
        return this.accountUser ? Constants.advancedFilter.accountUser + Constants.advancedFilter.keyValueDelimiter + this.accountUser + ' ' : '';
    }
    get getSearchBarAccountName(): string {
        return this.accountName ? Constants.advancedFilter.accountName + Constants.advancedFilter.keyValueDelimiter + this.accountName + ' ' : '';
    }
    get getSearchBarExpirationDateFrom(): string {
        return this.expirationDateFrom ? Constants.advancedFilter.expirationDateFrom + Constants.advancedFilter.keyValueDelimiter + this.expirationDateFrom.toJSON() + ' ' : '';
    }
    get getSearchBarExpirationDateTo(): string {
        return this.expirationDateTo ? Constants.advancedFilter.expirationDateTo + Constants.advancedFilter.keyValueDelimiter + this.expirationDateTo.toJSON() + ' ' : '';
    }
}
