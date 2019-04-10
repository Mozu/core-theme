import {Injectable} from '@angular/core';
import { HttpService } from '@core/extensions/http.service';
import { LoggerService } from '@core';
import { Observable } from 'rxjs';

@Injectable()
export class QuotesService{
    constructor(private _http: HttpService,   
        private _loggerService: LoggerService){
            this._loggerService.info("QuotesService : constructor");
    }

    public fetchAllQuotes(): Observable<any>{
        this._loggerService.info("QuotesService: fetchAllQuotes");
        return this._http.get("./assets/json/quote-list.json");
    }
}