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
    get searchBarkeyword(): string {
        return this.keyword ? this.keyword + ' ' : '';
    }
    get searchBarQuoteName(): string {
        return this.quoteName ? Constants.advancedFilter.quoteName + Constants.advancedFilter.keyValueDelimiter + this.quoteName + ' ' : '';
    }
    get searchBarQuoteId(): string {
        return this.quoteId ? Constants.advancedFilter.quoteId + Constants.advancedFilter.keyValueDelimiter + this.quoteId + ' ' : '';
    }
}
