import {
    Component,   
    OnChanges,
    Input,
    SimpleChanges,
    LOCALE_ID,
    Inject,
    DoCheck
} from '@angular/core';
import {
    LoggerService,
    HttpError,
    ErrorCode,
    ErroNotificationType
} from '@core';
import { NgSelectConfig } from '@ng-select/ng-select';
import { TranslateService } from '@ngx-translate/core';
import { ShippingMethodService } from './method.service';
import { ShippingRateModel } from './method.model';
import { CurrencyPipe } from '@angular/common';

@Component({
    selector: 'shipping-method',
    templateUrl: './method.component.html',
    styleUrls: ['./method.component.css'],
    providers: [ShippingMethodService]
})

export class ShippingMethodComponent implements OnChanges, DoCheck {
    @Input('QuoteId') quoteId: string;
    public shippingRates: ShippingRateModel[];
    public selectedShippingRate: ShippingRateModel;    

    constructor(private _shippingMethodService: ShippingMethodService,
        private _loggerService: LoggerService,
        private config: NgSelectConfig,
        @Inject(LOCALE_ID) public locale: string,
        private _translate: TranslateService) {
        this._translate.get('SHARED.SHIPPING.Method')
            .subscribe((successResponse) => {
                this.config.loadingText = successResponse.loadingText;
                this.config.notFoundText = successResponse.notFoundText;
            }, (errorResponse) => {

            });
    }

    ngOnChanges(changes: SimpleChanges) {
        this._loggerService.info("ShippingMethodComponent : ngOnChanges");
        this.quoteId = changes["quoteId"].currentValue;
    }

    ngDoCheck() {
    }

    public populateShippingMethod = () => {
        this._loggerService.info("ShippingMethodComponent : populateShippingMethod");

        if (this.quoteId) {
            var currencyPipe = new CurrencyPipe(this.locale);
            this._shippingMethodService.fetchShippingMethod(this.quoteId).subscribe((fetchShippingMethodResponse: ShippingRateModel[]) => {
                this._loggerService.info("ShippingMethodComponent : _shippingMethodService.fetchShippingMethod_successResponse");
                if (fetchShippingMethodResponse != null && fetchShippingMethodResponse != undefined) {
                    this.shippingRates = fetchShippingMethodResponse;
                    this.shippingRates.map((shippingRate, i) => {
                        shippingRate.shippingMethodName = shippingRate.shippingMethodName + " " + currencyPipe.transform(shippingRate.price);
                    });                  
                } else {
                    this.shippingRates = [];
                }
            },
                (errResponse) => {
                    this._loggerService.info("ShippingMethodComponent : _shippingMethodService.fetchShippingMethod_errResponse");                   
                    throw new HttpError(ErrorCode.QuoteListGetFailed, ErroNotificationType.Toaster);
                })
        }
    }
}
