
import { Injectable } from '@angular/core';

import { CookieService as Cookie } from 'ngx-cookie-service';

import { LoggerService } from './logger.service';

import { EnvironmentConfig } from '../infrastructure/utility.service';

 @Injectable()
export class CookieService {

    environmentName: string;
    domain: string;

    constructor(
        private _logger: LoggerService,
        private _config: EnvironmentConfig,
        private _cookie: Cookie
    ) {
        this._logger.info('CookieService : constructor ');
        this.environmentName = _config.environmentName;
        this.domain = _config.domain;
    }

    public getCookie(cookieName: string): string {
        return this._cookie.get(this.environmentName + cookieName);
    }

    public setCookie(cookieName: string, value: string): void {
        document.cookie = this.environmentName + cookieName + '=' + value + ';domain=.' + this.domain + '; path = /';
    }

    public deleteCookie(cookieName: string): void {
        this._cookie.delete(this.environmentName + cookieName);
    }

    public doesCookieExists(cookieName: string): boolean {
        return this._cookie.check(this.environmentName + cookieName);
    }
}
