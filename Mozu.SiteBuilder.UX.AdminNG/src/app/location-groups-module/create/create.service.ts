import { Injectable} from '@angular/core';
import { Observable } from 'rxjs';
import { 
LoggerService, 
HttpClientService 
} from '@core';
import { Constants } from '@shared';
import { Constants as GlobalConstant } from '@global/infrastructure/constants';
import { LocationGroupModel } from './location.group.model';

@Injectable()
export class CreateLocationGroupService{
    constructor(private _http: HttpClientService,   
        private _loggerService: LoggerService){ }

    public addLocationGroup(lgModel: LocationGroupModel): Observable<any>{
        this._loggerService.info("CreateLocationGroupService: addLocationGroup");
        return this._http.post(GlobalConstant.webApis.addLocationGroup, lgModel);
    }
}