import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
    LoggerService,
    HttpClientService
} from '@core';
import { Constants } from '@shared';
import { environment } from '@env';
import { Constants as GlobalConstants } from '@global/infrastructure/constants';
import { QuotesListModel } from './list.model';
import { HttpParams } from '@angular/common/http';

@Injectable()
export class QuotesListService {
    constructor(private _http: HttpClientService,
        private _loggerService: LoggerService) { }

    public fetchAllQuotes(advancedSearch?: string, startIndex?: number, pageSize?: number, sort?: string): Observable<QuotesListModel> {
        this._loggerService.info('QuotesListService: fetchAllQuotes');
        let filter = new HttpParams();
        filter = startIndex ? filter.append(Constants.queryParameters.startIndex, startIndex.toString()) : filter;
        filter = pageSize ? filter.append(Constants.queryParameters.pageSize, pageSize.toString()) : filter;
        filter = sort && sort !== '' ? filter.append(Constants.queryParameters.sort, sort) : filter;
        filter = advancedSearch && advancedSearch !== '' ? filter.append(Constants.queryParameters.advancedSearch, advancedSearch) : filter;
        if (environment.isUseMocks) {
            return this._http.get(Constants.JsonResources.quoteList);
        } else {
            return this._http.get(GlobalConstants.webApis.getQuoteList,
                {
                    params: filter
                });
        }
    }
}
