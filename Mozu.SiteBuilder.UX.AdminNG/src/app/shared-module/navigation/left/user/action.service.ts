import { Injectable } from '@angular/core';
import { LoggerService } from '@core';
import { HttpClientService } from '@core/extensions/http-client.service';
import { Constants } from '../../../infrastructure/constants';
import { TranslateService } from '@ngx-translate/core';
import { ConfigurationSettings } from '@shared/infrastructure/configuration-settings';

@Injectable()
export class NavigationLeftUserActionService {
    private browserLang: string;
    private languageConfiguredForJson: string;

    constructor(
        private _httpService: HttpClientService,
        private _loggerService: LoggerService,        
        private _translate: TranslateService) {
        this.browserLang = _translate.getBrowserLang();
        this.languageConfiguredForJson = this.browserLang.match(
            ConfigurationSettings.supportedBrowserLanguages.join('|'))
            ? this.browserLang : ConfigurationSettings.fallbackBrowserLanguage;
    }

    public fetchRedirectionLinks = () => {
        this._loggerService.info('NavigationLeftUserActionService : fetchRedirectionLink');
        //return this._httpService.get(Constants.JsonResources.redirectionLink);
        return this._httpService.get(Constants.setRedirectionLinkJsonFile(this.languageConfiguredForJson));
    }
}
