import { Injectable } from '@angular/core';
import { LoggerService } from '@core';
import { HttpClientService } from '@core/extensions/http-client.service';
import { Constants } from '../infrastructure/constants';

@Injectable()
export class HeaderService {

  constructor(
    private _httpClientService: HttpClientService,
    private _loggerService: LoggerService ) { }

  public fetchRedirectionLinks = () => {
    this._loggerService.info('HeaderService : fetchRedirectionLink');
    return this._httpClientService.get(Constants.JsonResources.redirectionLink);
  }
}

    public geProductSearchResults(query: string, tenant: number, masterCatalog: number, isMockResponse: boolean): Observable<any> {
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