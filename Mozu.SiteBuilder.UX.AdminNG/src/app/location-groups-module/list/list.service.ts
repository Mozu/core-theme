import { Injectable} from '@angular/core';
import { Observable } from 'rxjs';
import { 
LoggerService, 
HttpClientService 
} from '@core';
import { Constants } from '@shared';
import { Constants as GlobalConstant } from '@global/infrastructure/constants';
import { LocationGroupModel } from '../create/location.group.model';

@Injectable()
export class LocationGroupsListService{
    constructor(private _http: HttpClientService,   
        private _loggerService: LoggerService){ }

    public fetchAllLocationGroups(): Observable<any>{
        this._loggerService.info("LocationGroupsListService: fetchAllLocationGroups");
        //return this._http.get(Constants.JsonResources.locationGroupList);
        return this._http.get(GlobalConstant.webApis.getLocationGroups);
    }

    public deleteLocationGroup(locationGroupId): Observable<any>{
        this._loggerService.info("LocationGroupsListService: deleteLocationGroup");
        return this._http.Delete(GlobalConstant.webApis.deleteLocationGroup + "/"+ locationGroupId);
    }
}