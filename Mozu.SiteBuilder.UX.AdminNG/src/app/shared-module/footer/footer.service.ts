import {
    Injectable,
    Inject
} from '@angular/core';

import { Observable } from 'rxjs/Observable';

import {
    HttpService,
    LoggerService
} from '@core';

@Injectable()
export class FooterService {

    constructor(
        private _http: HttpService,
        private _logger: LoggerService
    ) {
        this._logger.info('FooterService : constructor ');
    }

    getFooterSupportContactInfo(entityId: number): Observable<any> {

        this._logger.info('FooterService : getFooterSupportContactInfo ');

        return Observable.of('support@test.company');
    }
}
