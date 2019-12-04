import { Injectable } from '@angular/core';
import { LoggerService } from '@core';
import { HttpClientService } from '@core/extensions/http-client.service';
import { Constants } from '../../../infrastructure/constants';

@Injectable()
export class NavigationLeftUserActionService {

    constructor(
        private _httpService: HttpClientService,
        private _loggerService: LoggerService) { }

    public fetchRedirectionLinks = () => {
        this._loggerService.info('NavigationLeftUserActionService : fetchRedirectionLink');
        return this._httpService.get(Constants.JsonResources.redirectionLink);
    }
}
