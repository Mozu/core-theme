
import { Injectable } from '@angular/core';

import {
    Http,
    XHRBackend,
    RequestOptions,
    Request,
    RequestOptionsArgs,
    Response,
    Headers
} from '@angular/http';

import { Observable } from 'rxjs/Observable';

import 'rxjs/add/observable/throw';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/finally';

import {
    Constants,
    UtilityService
} from '../infrastructure/index';

import { AuthService } from './auth.service';

@Injectable()
export class HttpService extends Http {

    constructor(backend: XHRBackend
        , options: RequestOptions
        , utilityService: UtilityService
        , private authService: AuthService) {       
        super(backend, options);
    }

    get(url: string, options?: RequestOptionsArgs): Observable<Response> {

        if (!options) {
            options = { headers: new Headers() };
        }

        options.withCredentials = false;

        this.authService.setAuthHeaders(options);

        return super.get(url, options)
            .catch((error) => {            
                  
                    if (error.status == 403) {
                        return this.authService
                            .refreshApiToken()
                            .mergeMap((accessToken) => {

                                this.authService.setAuthHeaders(options);
                                return super.get(url, options);

                            });      
                }        
                                    
                  return this.handleError(error);
             })
            .finally(() => {

            });
    }

    post(url: string, body: any, options?: RequestOptionsArgs): Observable<Response> {

        if (!options) {
            options = { headers: new Headers() };
        }

        options.withCredentials = false;

        this.authService.setAuthHeaders(options);

        return super.post(url, body, options)
            .catch((error) => {

                if (error.status == 403) {
                    return this.authService
                        .refreshApiToken()
                        .mergeMap((accessToken) => {

                            this.authService.setAuthHeaders(options);
                            return super.post(url, body, options);

                        });
                }

                return this.handleError(error);
            })
            .finally(() => {

            });

    }

    private handleError(error: any): Observable<any>{
        return Observable.throw(error);
    }
}