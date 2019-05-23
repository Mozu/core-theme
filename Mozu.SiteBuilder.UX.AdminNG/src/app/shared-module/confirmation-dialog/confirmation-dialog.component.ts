import { Component, 
  OnInit, 
  ContentChild, 
  TemplateRef, 
  Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'confirmation-dialog',
  templateUrl: './confirmation-dialog.component.html',
  styleUrls: ['./confirmation-dialog.component.css']
})
export class ConfirmationDialogComponent implements OnInit {
  @ContentChild('modalHeader') modalHeader: TemplateRef<any>;
  @ContentChild('modalBody') modalBody: TemplateRef<any>;
  @ContentChild('modalFooter') modalFooter: TemplateRef<any>;
  
  @Input('ref') ref : string;
  @Input('size') size : string;

  constructor() { }//public _activeModal: NgbActiveModal

  ngOnInit() {
  }

  closeModal(){
    //this._activeModal.dismiss();
  }
}
