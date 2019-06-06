import { Component, 
  OnInit, 
  Input, 
  SimpleChanges, 
  OnChanges } from '@angular/core';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { LoggerService, 
  HttpError, 
  ErrorCode, 
  ErroNotificationType } from '@core';

import { NotificationService } from '@global';

import { ConfirmationDialogNotificationType, 
  ConfirmationDialogNotificationCode,
  NotificationDialogActions,
  ConfirmationDialogService} from '@shared';

import { QuoteItemsService } from './items.service';

@Component({
  selector: 'quote-items',
  templateUrl: './items.component.html',
  styleUrls: ['./items.component.css'],
  providers: [QuoteItemsService]
})
export class QuoteItemsComponent implements OnChanges, OnInit {
  @Input('QuoteId') quoteId: string;
  @Input('Quote') quote: any;

  public itemId: string;
  public quoteItemTobeDeleted: any;
  quoteItems = [];
  subscriptions = [];

  constructor(private _loggerService : LoggerService,
    public _quoteItemsService: QuoteItemsService,
    private _confirmationDialogService: ConfirmationDialogService,
    private _notificationService: NotificationService,
    public _modalService: NgbModal ) { 
    }
  
    ngOnChanges(changes: SimpleChanges){
      this._loggerService.info("QuoteItemsComponent : ngOnChanges");
      this.quoteItems = changes["quote"].currentValue;
    }

  ngOnInit() {
    this.subscriptions.push(
      this._notificationService.ConfirmationActionFromDialog.subscribe((action: string) => {
        if (action === NotificationDialogActions.confirm) {
          this.deleteQuoteItem();
        }
      })
    );
  }

  openQuoteDeleteConfirmationDialog(id: string, row: any) {
    this.itemId = id;
    this.quoteItemTobeDeleted = row;
    this._confirmationDialogService.openConfirmationDialog(ConfirmationDialogNotificationCode.DeleteItem, ConfirmationDialogNotificationType.Confirmation);
  }

  deleteQuoteItem(){
    this._loggerService.info("QuoteItemsComponent : deleteItem");
    this._quoteItemsService.deleteQuoteItem(this.quoteId, this.itemId).subscribe((deleteQuoteItemSuccessResponse :any) =>{
      this._loggerService.info("QuoteItemsComponent : _quoteItemsService.deleteItem_quotesResponse");
      if (deleteQuoteItemSuccessResponse != null && deleteQuoteItemSuccessResponse != undefined) {
        this.quoteItems.splice(this.quoteItemTobeDeleted, 1);
      }
    }, (deleteQuoteItemErrorResponse) => {
      this._loggerService.info("QuoteItemsComponent : _quoteItemsService.deleteItem_deleteQuoteItemErrorResponse");
      throw new HttpError(ErrorCode.QuoteListGetFailed,ErroNotificationType.Toaster);
    })
  }
  
  ngOnDestroy() {
    this._loggerService.info("QuoteItemsComponent : ngOnDestroy");
    this.subscriptions.forEach((s) => {
        s.unsubscribe();
    });
  }

}
