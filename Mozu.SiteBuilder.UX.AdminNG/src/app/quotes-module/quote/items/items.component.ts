import {
  Component,
  OnInit,
  Input,
  SimpleChanges,
  OnChanges,
  OnDestroy,
  Output,
  EventEmitter
} from '@angular/core';

import {
  LoggerService,
  HttpError,
  ErrorCode,
  ErroNotificationType,
  SpinnerService
} from '@core';

import { NotificationService } from '@global';

import {
  ConfirmationDialogNotificationType,
  ConfirmationDialogNotificationCode,
  ConfirmationDialogService
} from '@shared';

import { QuoteItemsService } from './items.service';
import { Item, QuoteSubtotalModel } from '../quote.model';

@Component({
  selector: 'quote-items',
  templateUrl: './items.component.html',
  styleUrls: ['./items.component.css'],
  providers: [QuoteItemsService]
})
export class QuoteItemsComponent implements OnChanges, OnInit, OnDestroy {
  @Input('QuoteId') quoteId: string;
  @Input('Quote') quote: any;
  @Output() onQuoteSubtotalChanged: EventEmitter<QuoteSubtotalModel> = new EventEmitter<QuoteSubtotalModel>();
  public quoteSubtotal: QuoteSubtotalModel;

  public itemId: string;
  public quoteItemTobeDeleted: any;
  quoteItems = [];
  subscriptions = [];

  constructor(private _loggerService: LoggerService,
    public _quoteItemsService: QuoteItemsService,
    private _confirmationDialogService: ConfirmationDialogService,
    private _notificationService: NotificationService,
    private _spinner: SpinnerService) {
  }

  ngOnChanges(changes: SimpleChanges) {
    this._loggerService.info('QuoteItemsComponent : quoteSubtotalChanged');
    this.quoteItems = changes['quote'].currentValue;
    if (this.quoteItems) {
      this.quoteSubtotal.estimatedTax = this.quoteItems.reduce((sum, current) =>
        sum + current.itemTaxTotal, this.quoteSubtotal.estimatedTax);

      this.quoteSubtotal.subTotalExclTax = this.quoteItems.reduce((sum, current) =>
        sum + current.extendedTotal, this.quoteSubtotal.subTotalExclTax);

      this.quoteSubtotal.subTotalInclTax = this.quoteItems.reduce((sum, current) =>
        sum + current.subtotal, this.quoteSubtotal.subTotalInclTax);

      this.quoteSubtotal.totalCost = this.quoteItems.reduce((sum, current) =>
        sum + current.product.price.price, this.quoteSubtotal.totalCost);

      this.onQuoteSubtotalChanged.emit(this.quoteSubtotal);
    }
  }

  ngOnInit() {
    this.quoteSubtotal = new QuoteSubtotalModel();
    this.subscriptions.push(
      this._notificationService.quoteItemDeleted.subscribe((action: string) => {
        if (action === ConfirmationDialogNotificationCode.DeleteQuoteItem) {
          this.deleteQuoteItem();
        }
      })
    );
  }

  openQuoteDeleteConfirmationDialog(id: string, row: any) {
    this.itemId = id;
    this.quoteItemTobeDeleted = row;
    this._confirmationDialogService.openConfirmationDialog(ConfirmationDialogNotificationCode.DeleteQuoteItem,
      ConfirmationDialogNotificationType.Confirmation);
  }

  deleteQuoteItem() {
    this._spinner.start();
    this._loggerService.info('QuoteItemsComponent : deleteItem');
    this._quoteItemsService.deleteQuoteItem(this.quoteId, this.itemId).subscribe((deleteQuoteItemSuccessResponse: any) => {
      this._loggerService.info('QuoteItemsComponent : _quoteItemsService.deleteItem_quotesResponse');
      if (deleteQuoteItemSuccessResponse !== null && deleteQuoteItemSuccessResponse !== undefined) {
        this.quoteItems.splice(this.quoteItemTobeDeleted, 1);
        this._spinner.stop();
      }
    }, (deleteQuoteItemErrorResponse) => {
      this._spinner.stop();
      this._loggerService.info('QuoteItemsComponent : _quoteItemsService.deleteItem_deleteQuoteItemErrorResponse');
      throw new HttpError(ErrorCode.QuoteListGetFailed, ErroNotificationType.Toaster);
    });
  }

  ngOnDestroy() {
    this._loggerService.info('QuoteItemsComponent : ngOnDestroy');
    this.subscriptions.forEach((s) => {
      s.unsubscribe();
    });
  }

}
