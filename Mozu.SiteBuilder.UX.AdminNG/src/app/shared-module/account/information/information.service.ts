import { Injectable} from '@angular/core';
import { Observable } from 'rxjs';
import {
LoggerService,
HttpClientService
} from '@core';
import { Constants } from '@shared';
import { Constants as GlobalConstants} from '@global/infrastructure/constants';
import { HttpParams } from '@angular/common/http';

@Injectable()
export class AccountInfoService {
    constructor(private _http: HttpClientService,
        private _loggerService: LoggerService) { }

    public fetchAccountInformation(customerAccountId: number, userId: string): Observable<any> {
        this._loggerService.info('AccountInfoService: fetchAccountInformation');
        const filter = new HttpParams().set(Constants.filterQueryParameter, JSON.stringify({ userid : userId}));
        //return this._http.get(Constants.JsonResources.accountInformation); //NOTE - use it while running angular on localhost
        return this._http.get(GlobalConstants.webApis.getB2BUserAccount + '/' + customerAccountId + Constants.userAPIDeepLink, {params: filter}); // NOTE - comment it while running angular on localhost
    }
}
