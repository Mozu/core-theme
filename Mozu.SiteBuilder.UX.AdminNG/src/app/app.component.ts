import {
    Component,
    OnInit
} from '@angular/core';

import {
    Event,
    Router,
    NavigationStart
} from '@angular/router';

import { TranslateService } from '@ngx-translate/core';
import {
    AuthService,
    LoggerService
} from '@core';

import {
    NotificationService,
    SharedDataService
} from './global-module/index';

import {
    ConfigurationSettings,
    Constants,
    NavigationContainerType
} from '@shared';

@Component({
    moduleId: module.id,
    selector: 'unified-admin-app',
    templateUrl: 'app.component.html',
    styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
    isUserLoggedIn = false;
    containerType: NavigationContainerType;

    constructor(
        private _logger: LoggerService,
        private _translate: TranslateService,
        private _router: Router,
        private _authService: AuthService,
        private _notificationService: NotificationService       
    ) {

        this.containerType = NavigationContainerType.dashboard;

        this._logger.info('AppComponent : constructor ');

        this._logger.info('"AppComponent : constructor => language configured');

        _translate.addLangs(ConfigurationSettings.supportedBrowserLanguages);
        _translate.setDefaultLang(ConfigurationSettings.fallbackBrowserLanguage);

        const browserLang = _translate.getBrowserLang();

        this._logger.info('AppComponent : constructor => Current browserLang Is :' + browserLang);

        const languageConfiguredForApplication = browserLang.match(
            ConfigurationSettings.supportedBrowserLanguages.join('|'))
            ? browserLang : ConfigurationSettings.fallbackBrowserLanguage;

        _translate.use(languageConfiguredForApplication);

        this._logger.info('AppComponent : constructor => Application language is set to :' + languageConfiguredForApplication);
        this._router.events.subscribe((event: Event) => {
            if (event instanceof NavigationStart) {
                if (event.url.includes(Constants.uiRoutes.quotes) || event.url.includes(Constants.uiRoutes.quotesEdit)) {
                    this.containerType = NavigationContainerType.quotes;
                    this._notificationService.notifyHamburgerMenuCollapsed(this.containerType);
                } else if (event.url.includes(Constants.uiRoutes.locationGroups) ||
                    event.url.includes(Constants.uiRoutes.locationGroupCreate) ||
                    event.url.includes(Constants.uiRoutes.locationGroupEdit) ||
                    event.url.includes(Constants.uiRoutes.locationGroupConfig)) {
                    this.containerType = NavigationContainerType.locationGroups;
                    this._notificationService.notifyHamburgerMenuCollapsed(this.containerType);
                } else {
                    this.containerType = NavigationContainerType.dashboard;
                }
            }
        });
    }

    ngOnInit() {
        this.isUserLoggedIn = this._authService.isUserLoggedIn();
        this._logger.info('AppComponent : ngOnInit() ');
    }

    onWindowResized(event: any) {

    }

}
