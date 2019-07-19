import { Injectable} from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
LoggerService,
HttpClientService
} from '@core';
import { Constants } from '@shared';
import { environment } from '@env';
import { Constants as GlobalConstants} from '@global/infrastructure/constants';

@Injectable()
export class AccountInfoService {
    constructor(private _http: HttpClientService,
        private _loggerService: LoggerService) { }

    public fetchAccountInformation(customerAccountId: number, userId: string): Observable<any> {
        this._loggerService.info('AccountInfoService: fetchAccountInformation');
        const filter = new HttpParams().set(Constants.queryParameters.filter, JSON.stringify({ userid : userId}));
        if (environment.isUseMocks) {
            return this._http.get(Constants.JsonResources.accountInformation);
        } else {
            return this._http.get(GlobalConstants.webApis.getB2BUserAccount + '/' + customerAccountId + Constants.userAPIDeepLink,
            {
                params: filter
            });
        }
    }
}
