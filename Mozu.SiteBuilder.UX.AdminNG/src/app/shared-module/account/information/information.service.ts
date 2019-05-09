import { Injectable} from '@angular/core';
import { Observable } from 'rxjs';
import { 
LoggerService, 
HttpClientService 
} from '@core';
import { Constants } from '@shared';

@Injectable()
export class AccountInfoService{
    constructor(private _http: HttpClientService,   
        private _loggerService: LoggerService){ }

    public fetchAccountInformation(): Observable<any>{
        this._loggerService.info("AccountInfoService: fetchAccountInformation");
        return this._http.get(Constants.JsonResources.accountInformation);
    }
}