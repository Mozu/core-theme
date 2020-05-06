import { Constants } from '@shared';
import * as moment from 'moment';
import { FilterModel } from '@shared/advanced-search/advanced-search.model';

export class QuoteFilterModel extends FilterModel {
    name = '';
    quoteId: number = null;
    accountUserLastName = '';
    accountId: number = null;
    expirationFrom: Date;
    expirationTo: Date;
    projectName = '';
    status = null;
    createFrom: Date;
    createTo: Date;
    b2bAccounts: any = [];
    quoteStatus: any = [];

    public resetFilterValue() {
        this.keyword = '';
        this.name = '';
        this.quoteId = null;
        this.accountUserLastName = '';
        this.accountId = null;
        this.expirationFrom = null;
        this.expirationTo = null;
        this.projectName = '';
        this.status = null;
        this.createFrom = null;
        this.createTo = null;
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
        return this.accountId ? Constants.advancedFilter.accountId + Constants.advancedFilter.keyValueDelimiter + this.accountId + ' ' : '';
    }
    get getSearchBarExpirationFrom(): string {
        return this.expirationFrom ? Constants.advancedFilter.expirationFrom + Constants.advancedFilter.keyValueDelimiter + moment(this.expirationFrom).format(Constants.advSearchDateFormat) + ' ' : '';
    }
    get getSearchBarExpirationTo(): string {
        return this.expirationTo ? Constants.advancedFilter.expirationTo + Constants.advancedFilter.keyValueDelimiter + moment(this.expirationTo).format(Constants.advSearchDateFormat) + ' ' : '';
    }
    get getProjectName(): string {
        return this.projectName ? Constants.advancedFilter.projectName + Constants.advancedFilter.keyValueDelimiter + this.projectName + ' ' : '';
    }
    get getStatus(): string {
        return this.status ? Constants.advancedFilter.status + Constants.advancedFilter.keyValueDelimiter + this.status + ' ' : '';
    }
    get getSearchBarCreateFrom(): string {
        return this.createFrom ? Constants.advancedFilter.createFrom + Constants.advancedFilter.keyValueDelimiter + moment(this.createFrom).format(Constants.advSearchDateFormat) + ' ' : '';
    }
    get getSearchBarCreateTo(): string {
        return this.createTo ? Constants.advancedFilter.createTo + Constants.advancedFilter.keyValueDelimiter + moment(this.createTo).format(Constants.advSearchDateFormat) + ' ' : '';
    }
}
