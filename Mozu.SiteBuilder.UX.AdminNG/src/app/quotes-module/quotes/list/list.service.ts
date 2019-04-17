import {Injectable} from '@angular/core';
import { LoggerService, HttpService } from '@core';
import { Observable } from 'rxjs';
import { Constants } from '@shared';

@Injectable()
export class QuotesListService{
    constructor(private _http: HttpService,   
        private _loggerService: LoggerService){ }

    public fetchAllQuotes(): Observable<any>{
        this._loggerService.info("QuotesService: fetchAllQuotes");
        return this._http.get(Constants.JsonResources.quoteList);
    }
}