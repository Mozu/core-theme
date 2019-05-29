import { Injectable} from '@angular/core';
import { Observable, of } from 'rxjs';
import { 
LoggerService, 
HttpClientService 
} from '@core';
import { Constants } from '@shared';
import { Constants as GlobalConstant } from '@global/infrastructure/constants';
import { LocationGroupModel } from './location.group.model';
import { HttpResponse } from '@angular/common/http';

@Injectable()
export class CreateLocationGroupService{
    constructor(private _http: HttpClientService,   
        private _loggerService: LoggerService){ }

    public addLocationGroup(lgModel: LocationGroupModel): Observable<any>{
        this._loggerService.info("CreateLocationGroupService: addLocationGroup"+JSON.stringify(lgModel));
        //return this._http.post(GlobalConstant.webApis.addLocationGroup, lgModel);
        return of(new HttpResponse({ status: 200 })); // dummy response to test.
    }
}