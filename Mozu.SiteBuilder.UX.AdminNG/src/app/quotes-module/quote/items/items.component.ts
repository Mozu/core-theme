import { Component,
  OnInit,
  Input,
  SimpleChanges,
  OnChanges,
  OnDestroy} from '@angular/core';

import { LoggerService,
  HttpError,
  ErrorCode,
  ErroNotificationType,
  SpinnerService } from '@core';

import { NotificationService } from '@global';

import { ConfirmationDialogNotificationType,
  ConfirmationDialogNotificationCode,
  ConfirmationDialogService} from '@shared';

import { QuoteItemsService } from './items.service';

@Component({
  selector: 'quote-items',
  templateUrl: './items.component.html',
  styleUrls: ['./items.component.css'],
  providers: [QuoteItemsService, SpinnerService]
})
export class QuoteItemsComponent implements OnChanges, OnInit, OnDestroy {
  @Input('QuoteId') quoteId: string;
  @Input('Quote') quote: any;

  public itemId: string;
  public quoteItemTobeDeleted: any;
  quoteItems = [];
  subscriptions = [];

  constructor(private _loggerService: LoggerService,
    public _quoteItemsService: QuoteItemsService,
    private _confirmationDialogService: ConfirmationDialogService,
    private _notificationService: NotificationService,
    private _spinner: SpinnerService ) {
    }

    ngOnChanges(changes: SimpleChanges) {
      this._loggerService.info('QuoteItemsComponent : ngOnChanges');
      this.quoteItems = changes['quote'].currentValue;
    }

  ngOnInit() {
    this.subscriptions.push(
      this._notificationService.QuoteItemDeleteConfirmation.subscribe((action: string) => {
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
