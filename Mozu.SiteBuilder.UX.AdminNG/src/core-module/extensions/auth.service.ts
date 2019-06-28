import { Injectable  } from '@angular/core';

import { Observable } from 'rxjs/Observable';

import 'rxjs/add/observable/of';
import 'rxjs/add/observable/throw';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/delay';

import { LoggerService } from '../services/logger.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import {
    UtilityService,
    EnvironmentConfig,
    Constants
} from '../infrastructure/index';

import {IRequestOptions} from './http-client.service';

import { ApiTokenModel } from './api-token.model';

@Injectable()
export class AuthService {

    // to be used internally, use externaly via isUserLoggedIn() method
    private isLoggedIn = false;
    private apiToken: ApiTokenModel;
    private sessionId: string;
    private isRefreshTokenCallInProgress = false;

    constructor(
        private _logger: LoggerService,
        private _utilityService: UtilityService,
        private _http: HttpClient,
        private _config: EnvironmentConfig
    ) {
        this._logger.info('AuthService : constructor ');

        this.apiToken = (JSON.parse(localStorage.getItem(Constants.localStorageKeys.apiToken)) as ApiTokenModel);
        this.isLoggedIn = localStorage.getItem(Constants.localStorageKeys.isLoggedIn) === 'true';
        this.sessionId = localStorage.getItem(Constants.localStorageKeys.sessionId);
        this.isLoggedIn = true;
    }

    isUserLoggedIn(): boolean {
        return this.isLoggedIn;
    }

    logOut(url: string): Observable<any> {
        this.isLoggedIn = false;
        this._logger.info('AuthService : LogOut');

        const options: IRequestOptions = { headers: new HttpHeaders() };
        options.withCredentials = false;
        this.setAuthHeaders(options);

        return this._http.post(url, null, options);
    }

    setAuthHeaders(options?: IRequestOptions): void {

        if (!options.headers) {
            options.headers = new HttpHeaders();
        }

        // reset password requires webapi access before login
        if (this.apiToken) {
            options.headers.set(Constants.requestHeader.authorization, `${Constants.requestHeader.bearer} ${this.apiToken.access_token}`);
            options.headers.set(Constants.requestHeader.sessionId, `${this.sessionId}`);
        }

        options.headers.set(Constants.requestHeader.accept, Constants.contentType.json);
    }

    refreshApiToken(): Observable<any> {

        if (this.isRefreshTokenCallInProgress) {
            return Observable.of(true).delay(5000);
        }

        this._logger.info('AuthService : refreshToken');

        const params = Constants.apiToken.refreshToken + this.apiToken.refresh_token;
        const headers = new HttpHeaders();
        headers.set(Constants.requestHeader.contentType, Constants.contentType.formUrlEncoded);

        this.isRefreshTokenCallInProgress = true;

        return this._http.post(this._config.apiTokenUrl, params, {
                headers: headers
            })
            // .map(res => res.json()) not needed httpClient by default call this.
            .map( data => {

                this.isRefreshTokenCallInProgress = false;
                const token = new ApiTokenModel();
                token.access_token = data['access_token'];
                token.refresh_token = data['refresh_token'];
                token['.expires'] = data['.expires'];
                this.apiToken = token;
                localStorage.setItem(Constants.localStorageKeys.apiToken, JSON.stringify(token));
            })
            .catch(
            (error) => {
                this._utilityService.redirectToURL(this._config.appUrl);
                return Observable.of(false);
            }
            );
    }
}
