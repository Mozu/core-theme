import {
    Component,
    OnChanges,
    Input,
    Output,
    SimpleChanges,
    LOCALE_ID,
    Inject,
    EventEmitter
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

export class ShippingMethodComponent implements OnChanges {
    @Input('QuoteId') quoteId: string;
    @Input('ShippingMethodCode') shippingMethodCode: string;
    @Output() onShippingMethodChanged: EventEmitter<ShippingRateModel> = new EventEmitter<ShippingRateModel>();
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
        this._loggerService.info('ShippingMethodComponent : ngOnChanges');
        if (changes && changes.quoteId && changes.quoteId.currentValue) {
            this.quoteId = changes['quoteId'].currentValue;
        }
        if (changes && changes.shippingMethodCode && changes.shippingMethodCode.currentValue) {
            this.shippingMethodCode = changes['shippingMethodCode'].currentValue;
            this.populateShippingMethod();
        }
    }

    public populateShippingMethod = () => {
        this._loggerService.info('ShippingMethodComponent : populateShippingMethod');

        if (this.quoteId) {
            const currencyPipe = new CurrencyPipe(this.locale);
            this._shippingMethodService.fetchShippingMethod(this.quoteId).subscribe((fetchShippingMethodResponse: ShippingRateModel[]) => {
                this._loggerService.info('ShippingMethodComponent : _shippingMethodService.fetchShippingMethod_successResponse');
                if (fetchShippingMethodResponse !== null && fetchShippingMethodResponse !== undefined) {
                    this.shippingRates = fetchShippingMethodResponse;
                    this.shippingRates.map((shippingRate, i) => {
                        shippingRate.shippingMethodName = shippingRate.shippingMethodName + ' '
                            + currencyPipe.transform(shippingRate.price);
                    });
                    if (this.shippingMethodCode) {
                        this.selectedShippingRate = this.shippingRates.filter(x => x.shippingMethodCode === this.shippingMethodCode)[0];
                    }
                } else {
                    this.shippingRates = [];
                }
            },
                (errResponse) => {
                    this._loggerService.info('ShippingMethodComponent : _shippingMethodService.fetchShippingMethod_errResponse');
                    throw new HttpError(ErrorCode.QuoteListGetFailed, ErroNotificationType.Toaster);
                })
        } else {
            this.shippingRates = [];
        }
    }

    public shippingMethodChanged(): void {
        this.onShippingMethodChanged.emit(this.selectedShippingRate);
    }
}
