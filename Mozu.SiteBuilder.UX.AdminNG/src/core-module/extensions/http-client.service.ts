import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UtilityService } from '../infrastructure/index';
import { AuthService } from './auth.service';
import 'rxjs/add/operator/finally';
import 'rxjs/add/operator/catch';

// Created custom interface as RequestOptionsArgs interface deprecated.
export interface IRequestOptions {
    headers?: HttpHeaders;
    observe?: 'body';
    params?: HttpParams;
    reportProgress?: boolean;
    responseType?: 'json';
    withCredentials?: boolean;
    body?: any;
}

export function httpClientServiceCreator(http: HttpClient, utilityService: UtilityService, authService: AuthService) {
    return new HttpClientService(http, utilityService, authService);
}

Injectable()
export class HttpClientService {

    // Extending the HttpClient through the Angular DI.
    public constructor(public http: HttpClient, utilityService: UtilityService, private authService: AuthService) {
    }

    /**
     * GET request
     * @param {string} url  end point of the api
     * @param {IRequestOptions} options options of the request like headers, body, etc.
     * @returns {Observable<T>}
     */
    public get<T>(url: string, options?: IRequestOptions): Observable<T> {
        if (!options) {
            options = { headers: new HttpHeaders() };
        }
        options.withCredentials = false;
        this.authService.setAuthHeaders(options);
        return this.http.get<T>(url, options)
            .catch((error) => {
                if (error.status === 403) {
                    return this.authService
                        .refreshApiToken()
                        .map((accessToken) => {
                            this.authService.setAuthHeaders(options);
                            return this.http.get(url, options);
                        });
                }
                return this.handleError(error);
            })
            .finally(() => {

            });

    }

    /**
     * POST request
     * @param {string} url end point of the api
     * @param {Object} params body of the request.
     * @param {IRequestOptions} options options of the request like headers, body, etc.
     * @returns {Observable<T>}
     */
    public post<T>(url: string, params: Object, options?: IRequestOptions): Observable<T> {
        if (!options) {
            options = { headers: new HttpHeaders() };
        }
        options.withCredentials = false;
        this.authService.setAuthHeaders(options);
        return this.http.post<T>(url, params, options)
            .catch((error) => {
                if (error.status === 403) {
                    return this.authService
                        .refreshApiToken()
                        .map((accessToken) => {

                            this.authService.setAuthHeaders(options);
                            return this.http.post(url, params, options);
                        });
                }
                return this.handleError(error);
            })
            .finally(() => {

            });

    }

    /**
     * PUT request
     * @param {string} url end point of the api
     * @param {Object} params body of the request.
     * @param {IRequestOptions} options options of the request like headers, body, etc.
     * @returns {Observable<T>}
     */
    public Put<T>(url: string, params: Object, options?: IRequestOptions): Observable<T> {
        if (!options) {
            options = { headers: new HttpHeaders() };
        }
        options.withCredentials = false;
        this.authService.setAuthHeaders(options);
        return this.http.put<T>(url, params, options)
            .catch((error) => {
                if (error.status === 403) {
                    return this.authService
                        .refreshApiToken()
                        .map((accessToken) => {

                            this.authService.setAuthHeaders(options);
                            return this.http.put(url, params, options);
                        });
                }
                return this.handleError(error);
            })
            .finally(() => {

            });
    }

    /**
     * DELETE request
     * @param {string} url end point of the api
     * @param {IRequestOptions} options options of the request like headers, body, etc.
     * @returns {Observable<T>}
     */
    public Delete<T>(url: string, options?: IRequestOptions): Observable<T> {
        if (!options) {
            options = { headers: new HttpHeaders() };
        }
        options.withCredentials = false;
        this.authService.setAuthHeaders(options);
        return this.http.delete<T>(url, options)
            .catch((error) => {
                if (error.status === 403) {
                    return this.authService
                        .refreshApiToken()
                        .map((accessToken) => {
                            this.authService.setAuthHeaders(options);
                            return this.http.delete(url, options);
                        });
                }
                return this.handleError(error);
            })
            .finally(() => {

            });
    }

    private handleError(error: any): Observable<any> {
        return Observable.throw(error);
    }
}