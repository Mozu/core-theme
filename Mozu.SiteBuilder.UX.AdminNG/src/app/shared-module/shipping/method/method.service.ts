import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { LoggerService, HttpClientService } from '@core';
import { Constants } from '@shared';
import { ShippingRateModel } from '@shared/shipping';

@Injectable()
export class ShippingMethodService {
    constructor(private _http: HttpClientService,
        private _loggerService: LoggerService) { }

    public fetchShippingMethod(quoteId: string): Observable<ShippingRateModel[]> {
        this._loggerService.info('ShippingMethodService: fetchShippingMethod');
        return this._http.get<ShippingRateModel[]>(Constants.JsonResources.shippingMethods);
    }
}
