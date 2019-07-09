import { Injectable} from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import {
LoggerService,
HttpClientService
} from '@core';
import { Constants as GlobalConstant } from '@global/infrastructure/constants';
import { Constants } from '@shared';
import { environment } from '@env';

@Injectable()
export class LocationGroupConfigService {
    constructor(private _http: HttpClientService,
        private _loggerService: LoggerService) { }

    public getLocationGroupConfig(locationGroupId: string, siteId : string): Observable<any> {
        this._loggerService.info('LocationGroupConfigService: getLocationGroupConfig');
        if (environment.debug) {
            return this._http.get(Constants.JsonResources.getLocationGroupConfig);
        } else {
            return this._http.get(GlobalConstant.webApis.getLocationGroupConfig + '/' + locationGroupId + '/' + siteId );
        }
    }
}
