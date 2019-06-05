import {
  Component,
  OnInit
} from '@angular/core';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { LoggerService } from '@core/services';

import { ConfirmationDialogService } from './confirmation-dialog.service';

@Component({
  selector: 'confirmation-dialog',
  templateUrl: './confirmation-dialog.component.html',
  styleUrls: ['./confirmation-dialog.component.css']

})
export class ConfirmationDialogComponent implements OnInit {

  _displayModal = false;
  _dialogTitle: string;
  _message: string;
  _isShowPrimaryButton: boolean;
  _isShowSecondaryButton: boolean;
  _primaryButtonText: string;
  _secondaryButtonText: string;

  constructor(private _loggerService: LoggerService,
    private _modalService: NgbModal,
    private _confirmationDialogService: ConfirmationDialogService) {
    this._loggerService.info("ConfirmationDialogComponent : constructor ");
  }

  showConfirmationDialog(confirmationDialogTitle: string, confirmationDialogMessage: string, primaryButtonText: string, isShowSecondaryButton: boolean, secondaryButtonText: string) {
    this._loggerService.info("ConfirmationDialogComponent : showConfirmationDialog ");
    this._dialogTitle = confirmationDialogTitle;
    this._message = confirmationDialogMessage;
    this._isShowSecondaryButton = isShowSecondaryButton;
    this._primaryButtonText = primaryButtonText;
    this._secondaryButtonText = secondaryButtonText;
    this._displayModal = true;
    this._modalService.open('confirmationModal');
  }

  ngOnInit() {
    this._loggerService.info("ConfirmationDialogComponent : ngOnInit ");
    this._confirmationDialogService.showConfirmationDialog = this.showConfirmationDialog.bind(this);
  }

  confirm():void {
    this._confirmationDialogService.confirm();
    this._displayModal = false;
  }
}
