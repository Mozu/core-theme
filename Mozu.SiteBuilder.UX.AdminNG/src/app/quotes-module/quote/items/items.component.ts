import { Component, 
  OnInit, 
  Input, 
  SimpleChanges, 
  OnChanges } from '@angular/core';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { LoggerService, 
  HttpError, 
  ErrorCode, ErroNotificationType } from '@core';

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

  public isShowModel: boolean = false;
  public itemId: string;
  public quoteItemTobeDeleted: any;
  quoteItems = [];

  constructor(private _loggerService : LoggerService,
    public _quoteItemsService: QuoteItemsService,
    public _modalService: NgbModal ) { }
  
    ngOnChanges(changes: SimpleChanges){
      this._loggerService.info("QuoteItemsComponent : ngOnChanges");
      this.quoteItems = changes["quote"].currentValue;
    }

  ngOnInit() {
  }

  openQuoteDeleteConfirmationDialog(id: string, row: any) {
    this.itemId = id;
    this.quoteItemTobeDeleted = row;
    this.isShowModel = true;
    this._modalService.open('confirmationModal');
  }

  closeQuoteDeleteConfirmationDialog(){
    this.isShowModel = false;
  }

  deleteQuoteItem(){
    this._loggerService.info("QuoteItemsComponent : deleteItem");
    this.isShowModel  = false;
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
}
