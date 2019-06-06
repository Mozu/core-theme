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

  displayModal = false;
  dialogTitle: string;
  message: string;
  isShowPrimaryButton: boolean;
  isShowSecondaryButton: boolean;
  primaryButtonText: string;
  secondaryButtonText: string;

  constructor(private _loggerService: LoggerService,
    private _modalService: NgbModal,
    private _confirmationDialogService: ConfirmationDialogService) {
    this._loggerService.info("ConfirmationDialogComponent : constructor ");
  }

  showConfirmationDialog(confirmationDialogTitle: string, confirmationDialogMessage: string, primaryButtonText: string, isShowSecondaryButton: boolean, secondaryButtonText: string) {
    this._loggerService.info("ConfirmationDialogComponent : showConfirmationDialog ");
    this.dialogTitle = confirmationDialogTitle;
    this.message = confirmationDialogMessage;
    this.isShowSecondaryButton = isShowSecondaryButton;
    this.primaryButtonText = primaryButtonText;
    this.secondaryButtonText = secondaryButtonText;
    this.displayModal = true;
    this._modalService.open('confirmationModal');
  }

  ngOnInit() {
    this._loggerService.info("ConfirmationDialogComponent : ngOnInit ");
    this._confirmationDialogService.showConfirmationDialog = this.showConfirmationDialog.bind(this);

  }

  confirm(): void {
    this._confirmationDialogService.confirm();
    this.displayModal = false;
  }

}
