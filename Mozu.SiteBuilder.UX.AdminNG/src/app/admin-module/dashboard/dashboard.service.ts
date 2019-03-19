import { Injectable } from '@angular/core';
import { Constants } from '@shared';
import { HttpClient } from '@angular/common/http';

import {
    HttpService
} from '@core';
import { Observable } from 'rxjs';

@Injectable()
export class DashbaordService {

    constructor(private _http: HttpClient) { }

    public fetchAllDashboardTiles(): Observable<any> {
        return this._http.get(Constants.JsonResources.dasbhoardTiles);
    }
}

