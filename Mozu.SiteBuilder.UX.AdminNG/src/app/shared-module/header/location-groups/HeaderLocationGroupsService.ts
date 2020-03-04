import { Injectable} from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import {
LoggerService,
HttpClientService
} from '@core';
import { Constants as GlobalConstant } from '@global/infrastructure/constants';
import { Constants } from '@shared/infrastructure/constants';
import { environment } from '@env';

@Injectable()
export class HeaderLocationGroupsService {
    constructor(private _http: HttpClientService,
        private _loggerService: LoggerService) { }

    public getLocationGroup(locationGroupCode: string): Observable<any> {
        this._loggerService.info('HeaderLocationGroupsService: getLocationGroup');
        if (environment.isUseMocks) {
            return this._http.get(Constants.JsonResources.getLocationGroup);
        } else {
            return this._http.get(GlobalConstant.webApis.getLocationGroup + '/' + locationGroupCode);
        }
    }
}
