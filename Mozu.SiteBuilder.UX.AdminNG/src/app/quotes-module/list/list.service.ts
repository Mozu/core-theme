import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
    LoggerService,
    HttpClientService
} from '@core';
import { Constants as GlobalConstant } from '@global/infrastructure/constants';


@Injectable()
export class QuotesListService {
    constructor(private _http: HttpClientService,
        private _loggerService: LoggerService) { }

    public fetchAllQuotes(): Observable<any> {
        this._loggerService.info("QuotesListService: fetchAllQuotes");
        return this._http.get(GlobalConstant.webApis.getQuoteList);
    }
}
