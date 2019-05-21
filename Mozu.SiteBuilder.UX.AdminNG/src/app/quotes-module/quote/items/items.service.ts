import { Injectable} from '@angular/core';
import { Observable } from 'rxjs';
import { 
LoggerService, 
HttpClientService 
} from '@core';
import { Constants } from '@shared';

@Injectable()
export class QuoteItemsService{
    constructor(private _http: HttpClientService,   
        private _loggerService: LoggerService){ }

    public fetchAllQuotes(): Observable<any>{
        this._loggerService.info("QuoteItemsService: fetchAllQuotes");
        return this._http.get(Constants.JsonResources.quoteList);
    }
}