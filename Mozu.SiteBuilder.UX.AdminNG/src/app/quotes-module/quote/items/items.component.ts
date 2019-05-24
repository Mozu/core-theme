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

  public showModal: boolean = false;
  public itemId: string;
  public deleteRow: any;
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

  openModal(id: string, row: any) {
    this.itemId = id;
    this.deleteRow = row;
    this.showModal = true;
    this._modalService.open('confirmationModal');
  }

  closeModal(){
    this.showModal = false;
  }

  deleteItem(){
    this._loggerService.info("QuoteItemsComponent : deleteItem");
    this.showModal = false;
    this._quoteItemsService.deleteItem(this.quoteId, this.itemId).subscribe((successResponse:any) =>{
      this._loggerService.info("QuoteItemsComponent : _quoteItemsService.deleteItem_quotesResponse");
      let responseJson = successResponse;
      if (responseJson != null && responseJson != undefined) {
        this.quoteItems.splice(this.deleteRow ,1);
      }
    }, (errResponse) => {
      this._loggerService.info("QuoteItemsComponent : _quoteItemsService.deleteItem_errResponse");
      throw new HttpError(ErrorCode.QuoteListGetFailed,ErroNotificationType.Toaster);
    })
  }
}
