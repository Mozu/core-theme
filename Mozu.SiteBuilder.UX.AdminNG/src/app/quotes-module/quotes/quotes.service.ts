import {Injectable} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LoggerService } from '@core';
import { Observable } from 'rxjs';
import { httpFactory } from '@angular/http/src/http_module';

@Injectable()
export class QuotesService{
    constructor(private _http: HttpClient,   
        private _loggerService: LoggerService){
            this._loggerService.info("QuotesService : constructor");
    }

    public fetchAllQuotes(): Observable<any>{
        this._loggerService.info("QuotesService: fetchAllQuotes");
        return this._http.get("./assets/json/quote-list.json");
    }
}