import { Component, OnInit, OnChanges, Input, SimpleChanges } from '@angular/core';
import { LoggerService, HttpError, ErrorCode, ErroNotificationType } from '@core';
import { ShippingMethodService } from './method.service';
import { ShippingRate } from './method.model';

@Component({
    selector: 'shipping-method',
    templateUrl: './method.component.html',
    styleUrls: ['./method.component.css'],
    providers: [ShippingMethodService]
})

export class ShippingMethodComponent implements OnInit, OnChanges {
    @Input('QuoteId') quoteId: string;
    public shippingRates: ShippingRate[];

    constructor(private _shippingMethodService: ShippingMethodService,
        private _loggerService: LoggerService) { }

    ngOnChanges(changes: SimpleChanges) {
        this._loggerService.info("ShippingMethodComponent : ngOnChanges");
        this.quoteId = changes["quoteId"].currentValue;
        if (this.quoteId != undefined) {
            this.populateShippingMethod(this.quoteId);
        }
    }

    ngOnInit() {
        // this.shippingRates = new ShippingRate();    
    }

    public populateShippingMethod = (quoteId: string) => {
        this._loggerService.info("ShippingMethodComponent : populateShippingMethod");

        this._shippingMethodService.fetchShippingMethod(quoteId).subscribe((successResponse: ShippingRate[]) => {
            this._loggerService.info("ShippingMethodComponent : _shippingMethodService.fetchShippingMethod_successResponse");

            if (successResponse != null && successResponse != undefined) {
                this.shippingRates = successResponse;
                console.log(this.shippingRates)
            }
        }, (errResponse) => {
            this._loggerService.info("ShippingMethodComponent : _shippingMethodService.fetchShippingMethod_errResponse");
            throw new HttpError(ErrorCode.QuoteListGetFailed, ErroNotificationType.Toaster);
        })
    }
}
