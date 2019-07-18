import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { MenuItem } from 'primeng/api';
import {
    NgbModal
} from '@ng-bootstrap/ng-bootstrap';
import { environment } from '@env';
import { Constants } from './constants';
import { LoggerService } from '../services/logger.service';


export class EnvironmentConfig {
    environmentName: string;
    apiTokenUrl: string;
    appUrl: string;
    domain: string;
}

@Injectable()
export class UtilityService {

    features = 'width = 800, height = 580, top = 15, left == 15, location=no,directories=no,titlebar=no,status=no, toolbar = no, menubar = no, scrollbars = 1, resizable = 1, location = 0';
    environmentName: string;
    public masterCatalogToken: any;
    public catalogToken: any;
    public siteToken: any;
    public tenantToken: any;
    public contextType: any[] = ['m', 'c', 's', 't'];

    constructor(
        private _logger: LoggerService,
        private _config: EnvironmentConfig,
        private modalService: NgbModal
    ) {
        this._logger.info('UtilityService : constructor ');
        this.environmentName = _config.environmentName;
    }

    // First parameter URL is mandatory, other parameters are optional.
    public openInNewWindow = (url: string, target?: string, features?: string, replace?: boolean): Window => {
        this._logger.info('UtilityService : openInNewWindow');
        if (url !== undefined && url !== '') {
            features = (features !== undefined && features !== '') ? features : this.features;
            return window.open(url, target, features, replace);
        } else {
            return null;
        }
    }

    public openInNewTab = (url?: string, target?: string): void => {
        this._logger.info('UtilityService : openInNewTab');
        if (url !== undefined && url !== '') {
            window.open(url, target);
        }
    }

    public redirectToURL(href: string) {
        window.location.href = href;
    }

    public hideAppLoadingWidget(): void {
        const appLazyLoadingElement = document.getElementById('appInitloadingWidget');
        if (appLazyLoadingElement) {
            appLazyLoadingElement.style.visibility = 'hidden';
        }
    }

    public showAppLoadingWidget(): void {
        const appLazyLoadingElement = document.getElementById('appInitloadingWidget');
        if (appLazyLoadingElement) {
            appLazyLoadingElement.style.visibility = 'visible';
        }
    }

    public roundToNearestTenth(input: number): number {
        return (input % 10 <= 5) ? this.roundToLowerTenth(input) : this.roundToUpperTenth(input);
    }
    public roundToLowerTenth(input: number): number {
        return parseInt((input / 10).toString()) * 10;
    }
    public roundToUpperTenth(input: number): number {
        return parseInt((input / 10).toString()) * 10 + 10;
    }
    public floor(input: number, decimalPlaces: number): number {
        return Math.floor(input * parseInt(Math.pow(10, decimalPlaces).toString()) / parseInt(Math.pow(10, decimalPlaces).toString()));
    }
    public ceiling(input: number, decimalPlaces: number): number {
        return Math.ceil(input * parseInt(Math.pow(10, decimalPlaces).toString())) / parseInt(Math.pow(10, decimalPlaces).toString());
    }
    public round(input: number, decimalPlaces: number): number {
        return Math.round(input * parseInt(Math.pow(10, decimalPlaces).toString())) / parseInt(Math.pow(10, decimalPlaces).toString());
    }
    public contains(array: string[], searchTerm: string): boolean {
        for (let i = 0; i < array.length; i++) {
            if (array[i].trim() == searchTerm) { return true; }
        }
        return false;
    }
    public filterLinksByBehaviorId = (accessLinks: any, loggedInUsersData: any) => {
        const loggedInUsersBehaviorIds = loggedInUsersData._sharedData.items.ctUser.behaviorIds;
        accessLinks = this.filterLocalizationLink(accessLinks);
        let allFilteredLinks = [];
        let isMenuVisible = false;
        allFilteredLinks = _.filter(accessLinks, function (v: any) {
            if (v.visible) {
                if (v.behaviorIds) {
                    isMenuVisible = (loggedInUsersBehaviorIds.includes(v.behaviorIds));
                } else {
                    isMenuVisible = true;
                }
                return isMenuVisible;
            }
        });

        _.map(allFilteredLinks, function (el) {
            const filteredSubItems = _.filter(el.items, function (el: any) {
                if (el.visible) {
                    if (el.behaviorIds) {
                        isMenuVisible = (loggedInUsersBehaviorIds.indexOf(el.behaviorIds) >= 0);
                    } else {
                        isMenuVisible = true;
                    }
                    return isMenuVisible;
                }
            });
            el.items = filteredSubItems;
        });

        return allFilteredLinks;
    }

    public filterLocalizationLink = (accessLinks: any) => {
        return accessLinks.filter(function (v: any) { return (v.id !== Constants.localization.localizationAccessLink); });
    }

    public populateNavigationLinksbyContextType = (navigationlinks: any, identityTaContext: any) => {
        this._logger.info('UtilityService : populateNavigationLinksbyContextType');
        _.map(navigationlinks, (eachNavigationlink: any) => {
            _.filter(eachNavigationlink.items, (eachSubLink: any) => {
                switch (eachSubLink.contextType) {
                    case Constants.contextTypes.catalogContextType:
                        eachSubLink.url = eachSubLink.contextType + '-' +
                            identityTaContext.masterCatalogs[0].catalogs[0].id + '/' + eachSubLink.address;
                        break;
                    case Constants.contextTypes.siteContextType:
                        eachSubLink.url = eachSubLink.contextType + '-' +
                            identityTaContext.masterCatalogs[0].sites[0].id + '/' + eachSubLink.address;
                        break;
                    case Constants.contextTypes.masterCatalogContextType:
                        eachSubLink.url = eachSubLink.contextType + '-' +
                            identityTaContext.masterCatalogs[0].id + '/' + eachSubLink.address;
                        break;
                }
                return eachSubLink;
            });
        });

        return navigationlinks;
    }

    public getNavigationURL(menuItems: MenuItem[], parentMenuItemText: string, linkAddress: string): string {
        this._logger.info('UtilityService : getNavigationURL');
        const parentMenuItem = _.find(menuItems, { id: parentMenuItemText });
        if (parentMenuItem !== null && parentMenuItem !== undefined
            && parentMenuItem.items != null) {
            const addressLinkMenuItem = _.find(parentMenuItem.items, { address: linkAddress }) as MenuItem;
            if (addressLinkMenuItem !== null && addressLinkMenuItem !== undefined) {
                return environment.appUrl + addressLinkMenuItem.url;
            }
        }
    }

    public stringFormat(str, data) {
        data = data || {};
        Object.keys(data).forEach(function (key) {
            str = str.replace(new RegExp('{{' + key + '}}', 'g'), data[key]);
        });
        return str;
    }

}
