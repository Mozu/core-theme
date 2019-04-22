import {Injectable} from '@angular/core';

import { Observable } from 'rxjs';

import { LoggerService } from '@core';

import { HttpClientService } from '@core/extensions/http-client.service'

import { Constants } from '@shared';

@Injectable()
export class QuotesListService{
    constructor(private _http: HttpClientService,   
        private _loggerService: LoggerService){ }

    public fetchAllQuotes(): Observable<any>{
        this._loggerService.info("QuotesService: fetchAllQuotes");
        return this._http.get(Constants.JsonResources.quoteList);
    }
}