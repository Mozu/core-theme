import { Component, OnInit, Input, SimpleChanges, ViewChild } from '@angular/core';

import { LoggerService, HttpError, ErrorCode, ErroNotificationType } from '@core';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { QuoteItemsService } from './items.service';

//import { ConfirmationDialogComponent } from '@shared';

@Component({
  selector: 'quote-items',
  templateUrl: './items.component.html',
  styleUrls: ['./items.component.css'],
  providers: [QuoteItemsService]
})
export class QuoteItemsComponent implements OnInit {
  @Input('QuoteId') quoteId: string;
  @Input('Quote') quote: any;
  //@ViewChild('ref') modalRef: any;

  public showModal: boolean = false;
  public itemId: string;
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

  openModal(id: string) {
    this.itemId = id;
    this.showModal = true;
    this._modalService.open('confirmationModal');
  }

  closeModal(){
    //this.modalRef.closeModal();
    this.showModal = false;
  }

  deleteItem(){
    this.showModal = false;
    this._quoteItemsService.deleteItem(this.itemId).subscribe((successResponse:any) =>{
      let responseJson = successResponse;
      if (responseJson != null && responseJson != undefined) {
          console.log(this.itemId); //do delete logic here
      }
    })
  }
}
