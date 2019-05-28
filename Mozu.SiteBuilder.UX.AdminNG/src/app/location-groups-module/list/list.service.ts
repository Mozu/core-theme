import { Injectable} from '@angular/core';
import { Observable } from 'rxjs';
import { 
LoggerService, 
HttpClientService 
} from '@core';
import { Constants } from '@shared';

@Injectable()
export class LocationGroupsListService{
    constructor(private _http: HttpClientService,   
        private _loggerService: LoggerService){ }

    public fetchAllLocationGroups(): Observable<any>{
        this._loggerService.info("LocationGroupsListService: fetchAllLocationGroups");
        return this._http.get(Constants.JsonResources.locationGroupList);
    }
}