import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { LoggerService } from '@core';
import { HttpClientService } from '@core/extensions/http-client.service';
import { Constants } from '../../../infrastructure/constants';
import { HttpHeaders } from '@angular/common/http';

@Injectable()
export class NavigationLeftSearchService {

    constructor(
        private _httpService: HttpClientService,
        private _loggerService: LoggerService) { }

    // Don't worry too much about the added tenant and masterCatalog parts Amit,
    // this is preparing for fixing API calls so product works as well
    public getOrderSearchResults(query: string, tenant: number, masterCatalog: number, isMockResponse: boolean): Observable<any> {
        this._loggerService.info('NavigationLeftSearchService : getOrderSearchResults');
        if (!isMockResponse) {
            const filter = Constants.searchFilterParameter.filterParam1 + query + Constants.searchFilterParameter.filterParam2;
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
        this._loggerService.info('NavigationLeftSearchService : getCustomerSearchResults');
        if (!isMockResponse) {
            const filter = Constants.searchFilterParameter.filterParam1 + query + Constants.searchFilterParameter.filterParam2;
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
        this._loggerService.info('NavigationLeftSearchService : geProductSearchResults');
        if (!isMockResponse) {
            const filter = Constants.searchFilterParameter.filterParam1 + query + Constants.searchFilterParameter.filterParam2;
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
