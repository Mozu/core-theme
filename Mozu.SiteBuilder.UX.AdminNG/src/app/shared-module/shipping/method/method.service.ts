import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { LoggerService, HttpClientService } from '@core';
import { Constants } from '@shared';
import { ShippingRate } from '@shared/shipping';

@Injectable()
export class ShippingMethodService {
    constructor(private _http: HttpClientService,
        private _loggerService: LoggerService) { }

    public fetchShippingMethod(quoteId: string): Observable<ShippingRate[]> {
        this._loggerService.info("ShippingMethodService: fetchShippingMethod");
        return this._http.get<ShippingRate[]>(Constants.JsonResources.shippingMethods);
    }
}