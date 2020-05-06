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
import { LocationGroupModel } from './location.group.model';

@Injectable()
export class CreateLocationGroupService {
    constructor(private _http: HttpClientService,
        private _loggerService: LoggerService) { }

    public addLocationGroup(lgModel: LocationGroupModel): Observable<any> {
        this._loggerService.info('CreateLocationGroupService: addLocationGroup' + JSON.stringify(lgModel));
        if (environment.isUseMocks) {
            return of(new HttpResponse({ status: 200 }));
        } else {
            return this._http.post(GlobalConstant.webApis.addLocationGroup, lgModel);
        }
    }

    public getLocationGroup(locationGroupCode: string): Observable<any> {
        this._loggerService.info('EditLocationGroupService: getLocationGroup');
        if (environment.isUseMocks) {
            return this._http.get(Constants.JsonResources.getLocationGroup);
        } else {
            return this._http.get(GlobalConstant.webApis.getLocationGroup + '/' + locationGroupCode);
        }
    }

    public updateLocationGroup(lgModel: LocationGroupModel): Observable<any> {
        this._loggerService.info('CreateLocationGroupService: updateLocationGroup' + JSON.stringify(lgModel));
        if (environment.isUseMocks) {
            return of(new HttpResponse({ status: 200 }));
         } else {
            return this._http.post(GlobalConstant.webApis.editLocationGroup, lgModel);
         }
    }
}
