import { Injectable} from '@angular/core';
import { Observable } from 'rxjs';

import {
         LoggerService,
         HttpClientService
} from '@core';

import { Constants } from '@shared';

@Injectable()
export class AuditLogService {
    constructor(private _http: HttpClientService,
        private _loggerService: LoggerService) { }

    public fetchAuditLog(): Observable<any> {
        this._loggerService.info('AuditLogService: fetchAuditLog');
        return this._http.get(Constants.JsonResources.auditLog);
    }
}
