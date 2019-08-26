import { Constants } from '@shared';

export class AdvancedFilterModel {
    searchBox: any;
    splittedValues: any;
    lastKey: string;
    status = false;
}

export class QuoteFilter {
    keyword: any = null;
    name = '';
    quoteId: number = null;
    accountUserLastName = '';
    accountName = '';
    expirationDateFrom: Date;
    expirationDateTo: Date;

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
    get getSearchBarExpirationDateFrom(): string {
        return this.expirationDateFrom ? Constants.advancedFilter.expirationDateFrom + Constants.advancedFilter.keyValueDelimiter + this.expirationDateFrom.toJSON() + ' ' : '';
    }
    get getSearchBarExpirationDateTo(): string {
        return this.expirationDateTo ? Constants.advancedFilter.expirationDateTo + Constants.advancedFilter.keyValueDelimiter + this.expirationDateTo.toJSON() + ' ' : '';
    }
}
