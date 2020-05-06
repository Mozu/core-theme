import { Injectable} from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import {
LoggerService,
HttpClientService
} from '@core';
import { Constants } from '@shared';
import { Constants as GlobalConstant } from '@global/infrastructure/constants';
import { environment } from '@env';

@Injectable()
export class LocationGroupsListService {
    constructor(private _http: HttpClientService,
        private _loggerService: LoggerService) { }

    public fetchAllLocationGroups(): Observable<any> {
        this._loggerService.info('LocationGroupsListService: fetchAllLocationGroups');
        if (environment.isUseMocks) {
            return this._http.get(Constants.JsonResources.locationGroupList);
        } else {
            return this._http.get(GlobalConstant.webApis.getLocationGroups);
        }
    }

    public deleteLocationGroup(locationGroupCode): Observable<any> {
        this._loggerService.info('LocationGroupsListService: deleteLocationGroup');
        if (environment.isUseMocks) {
            return of(new HttpResponse({ status: 200 }));
        } else {
            return this._http.Delete(GlobalConstant.webApis.deleteLocationGroup + '/' + locationGroupCode);
        }
    }
}
