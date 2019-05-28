import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { LoggerService } from '@core';
import { HttpClientService } from '@core/extensions/http-client.service';
import { Constants } from '../infrastructure/constants';
import { query } from '@angular/core/src/render3';
import { HttpHeaders } from '@angular/common/http';



@Injectable()
export class HeaderService {

    constructor(
        private _httpService: HttpClientService,
        private _loggerService: LoggerService) { }

    public fetchRedirectionLinks = () => {
        this._loggerService.info('HeaderService : fetchRedirectionLink');
        return this._httpService.get(Constants.JsonResources.redirectionLink);
    }

    // Don't worry too much about the added tenant and masterCatalog parts Amit, this is preparing for fixing API calls so product works as well
    public getOrderSearchResults(query: string, tenant: number, masterCatalog: number, isMockResponse: boolean): Observable<any> {
        if (!isMockResponse) {
            const filter = 'filter=%5B%7B%22property%22%3A%22all%22%2C%22value%22%3A%22' + query + '%22%7D%5D';
            const config = {
                headers: new HttpHeaders({
                    'x-vol-master-catalog': masterCatalog + '',
                    'x-vol-tenant': tenant + ''
                })
            };        
            return this._httpService
                .get(`${Constants.webApis.getOrderData + '?' + Constants.queryString.GlobalSearchParams + '&' + filter}`, config);
        } else {
            return this._httpService.get(`${Constants.JsonResources.orderSearchResults}`);
        }
    }

    public getCustomerSearchResults(query: string, tenant: number, masterCatalog: number, isMockResponse: boolean): Observable<any> {
        if (!isMockResponse) {
            const filter = 'filter=%5B%7B%22property%22%3A%22all%22%2C%22value%22%3A%22' + query + '%22%7D%5D';
            const config = {
                headers: new HttpHeaders({
                    'x-vol-master-catalog': masterCatalog + '',
                    'x-vol-tenant': tenant + ''
                })
            };        
            return this._httpService
                .get(`${Constants.webApis.getCustomerData + '?' + Constants.queryString.GlobalSearchParams + '&' + filter}`, config);
        } else {
            return this._httpService.get(`${Constants.JsonResources.customerSearchResults}`);
        }
    }

    public geProductSearchResults(query: string, tenant: number, masterCatalog: number, isMockResponse: boolean): Observable<any> {
        if (!isMockResponse) {
            const filter = 'filter=%5B%7B%22property%22%3A%22all%22%2C%22value%22%3A%22' + query + '%22%7D%5D';
            const config = {
                headers: new HttpHeaders({
                    'x-vol-master-catalog': masterCatalog + '',
                    'x-vol-tenant': tenant + ''
                })
            };        
            return this._httpService
                .get(`${Constants.webApis.getProductData + '?' + Constants.queryString.GlobalSearchParams + '&' + filter}`, config);
        } else {
            return this._httpService.get(`${Constants.JsonResources.productsSearchResults}`);
        }
    }
}