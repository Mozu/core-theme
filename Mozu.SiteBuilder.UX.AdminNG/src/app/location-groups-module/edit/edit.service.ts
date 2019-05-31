import { Injectable} from '@angular/core';
import { Observable, of } from 'rxjs';
import { 
LoggerService, 
HttpClientService 
} from '@core';
import { Constants } from '@shared';
import { Constants as GlobalConstant } from '@global/infrastructure/constants';

import { HttpResponse } from '@angular/common/http';
import { LocationGroupModel } from '../create/location.group.model';

@Injectable()
export class EditLocationGroupService{
    constructor(private _http: HttpClientService,   
        private _loggerService: LoggerService){ }

    public getLocationGroup(locationGroupId: string): Observable<any>{
        this._loggerService.info("EditLocationGroupService: getLocationGroup");
        return this._http.get(GlobalConstant.webApis.getLocationGroup + "/"+ locationGroupId);
        //return of(new HttpResponse({ status: 200 })); // dummy response to test.
    }

    public updateLocationGroup(lgModel: LocationGroupModel): Observable<any>{
        this._loggerService.info("CreateLocationGroupService: updateLocationGroup"+JSON.stringify(lgModel));
        return this._http.post(GlobalConstant.webApis.addLocationGroup, lgModel);
        //return of(new HttpResponse({ status: 200 })); // dummy response to test.
    }
}