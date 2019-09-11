import {
    Component,
    OnInit
} from '@angular/core';

import { ActivatedRoute } from '@angular/router';

import * as _ from 'lodash';
import { NotificationService } from '@global';
import {
    LoggerService,
    HttpError,
    ErrorCode,
    ErroNotificationType,
    SpinnerService
} from '@core';

import { QuoteService } from './quote.service';
import { QuoteItemModel, QuoteSubtotalModel } from './quote.model';
import { ShippingRateModel } from '@shared/shipping';
import { Constants, SubtotalOptions, NegotiatedPriceDiscount } from '@shared';

@Component({
    selector: 'quote',
    templateUrl: './quote.component.html',
    styleUrls: ['./quote.component.css'],
    providers: [QuoteService]
})
export class QuoteComponent implements OnInit {
    quoteId: string;
    userId: any;
    public model: QuoteItemModel;
    customerAccountId: number;
    public shippingRate: ShippingRateModel;
    public quoteSubtotal: QuoteSubtotalModel;
    public subtotalList: any[];
    public selectedSubTotal: any;

    constructor(private route: ActivatedRoute,
        private _quoteService: QuoteService,
        private _loggerService: LoggerService,
        private _spinner: SpinnerService,
        private _notificationService: NotificationService) { }

    ngOnInit() {
        this._spinner.start();
        this._loggerService.info('QuoteComponent : ngOnInit');
        this.model = new QuoteItemModel();

        this.shippingRate = new ShippingRateModel();
        this.quoteId = this.route.snapshot.paramMap.get('quoteId');
        this.populateQuote(this.quoteId);
        this.subtotalList = Constants.quoteSubtotal;
    }

    onChange(deviceValue: string) {
        switch (deviceValue) {
            case 'select':
                this.model.subtotalOption = null;
                this.model.subtotalOptionValue = 0;
                break;
            case SubtotalOptions.subTotalExclTax:
                this.model.subtotalOption = SubtotalOptions.subTotalExclTax;
                this.model.subtotalOptionValue = this.model.subTotal;
                break;
            case SubtotalOptions.subTotalInclTax:
                this.model.subtotalOption = SubtotalOptions.subTotalInclTax;
                this.model.subtotalOptionValue = this.model.extendedTotal;
                break;
            case SubtotalOptions.estimatedTax:
                this.model.subtotalOption = SubtotalOptions.estimatedTax;
                this.model.subtotalOptionValue = this.model.itemTaxTotal;
                break;
            default:
                break;
        }
    }

    public populateQuote = (quoteId: string) => {

        this._loggerService.info('QuoteComponent : populateQuote');

        this._quoteService.fetchAllQuotes().subscribe((quoteSuccessResponse: Response) => {
            this._loggerService.info('QuoteComponent : _quoteService.fetchAllQuotes_quotesResponse');
            if (quoteSuccessResponse !== null && quoteSuccessResponse !== undefined && quoteSuccessResponse['items'] && quoteSuccessResponse['items'].length > 0) {
                this.model = _.filter(quoteSuccessResponse['items'], function (el: any) { return el.id === quoteId; })[0];
                console.log(this.model);
                this.userId = this.model.userId;
                this.customerAccountId = this.model.customerAccountId;
                this._notificationService.notifyQuoteHeaderValuesReceived(this.model.quoteNumber, this.model.status);
            }
            this._spinner.stop();
        }, (quoteListErrResponse) => {
            this._spinner.stop();
            this._loggerService.info('QuoteComponent : _quoteService.fetchAllQuotes_errResponse');
            throw new HttpError(ErrorCode.QuoteListGetFailed, ErroNotificationType.Toaster);
        });
    }

    public applyShippingRates(shippingRate: ShippingRateModel): void {
        if (shippingRate) {
            this.model.shippingMethodName = shippingRate.shippingMethodName;
            this.model.shippingMethodCode = shippingRate.shippingMethodCode;
            this.model.shippingTotal = shippingRate.price;
        } else {
            this.model.shippingMethodName = null;
            this.model.shippingMethodCode = null;
            this.model.shippingTotal = 0;
        }
    }

    public applyQuoteSubtotal(quoteSubtotal: QuoteSubtotalModel): void {
        this.quoteSubtotal = quoteSubtotal;
        this.model.itemTaxTotal = quoteSubtotal.estimatedTax;
        this.model.subTotal = quoteSubtotal.subTotalExclTax;
        this.model.extendedTotal = quoteSubtotal.subTotalInclTax;
    }

    isNegotiatedPriceDiscountEnable(negotiatedPriceDiscount: any): boolean {
        return this.model.negotiatedPriceDiscount === negotiatedPriceDiscount;
    }

    onNegotiatedPriceDiscountTypeChange(event) {
        switch (event.target.value) {
            case NegotiatedPriceDiscount.percentageDiscount:

                break;
            case NegotiatedPriceDiscount.amountDiscount:
                break;
            case NegotiatedPriceDiscount.proposedPrice:
                break;
        }
        this.model.negotiatedPriceDiscount = event.target.value;
    }

    onPercentageDiscountChange(event) {

    }

    onAmountDiscountChange(event) {

    }

    onPromposedPriceChange(event) {

    }

    get negotiatedPriceDiscount() { return NegotiatedPriceDiscount; }
}
