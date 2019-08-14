export class AdvancedFilterModel {
    searchBox: any;
}

export class QuoteFilter {
    keyword: any;
    quoteName: string;
    quoteId: number;
    get searchBarkeyword(): string {
        return this.keyword ? this.keyword + ' ' : '';
    }
    get searchBarQuoteName(): string {
        return this.quoteName ? 'quoteName : ' + this.quoteName + ' ' : '';
    }
    get searchBarQuoteId(): string {
        return this.quoteId ? 'quoteId : ' + this.quoteId + ' ' : '';
    }
}
