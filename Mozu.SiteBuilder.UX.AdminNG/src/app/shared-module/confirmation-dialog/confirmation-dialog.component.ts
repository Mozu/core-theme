import {
  Component,
  OnInit
} from '@angular/core';

import { LoggerService } from '@core/services';

import { ConfirmationDialogService } from './confirmation-dialog.service';

import { Constants } from '@shared/infrastructure/constants';

@Component({
  selector: 'confirmation-dialog',
  templateUrl: './confirmation-dialog.component.html',
  styleUrls: ['./confirmation-dialog.component.css']

})
export class ConfirmationDialogComponent implements OnInit {

  displayModal = false;
  dialogTitle: string;
  message: string;
  isShowSecondaryButton: boolean;
  primaryButtonText: string;
  secondaryButtonText: string;
  itemName: string;
  secondaryMessage: string;
  deleteLabel = Constants.gridActionItem.Delete;

  constructor(private _loggerService: LoggerService,
    private _confirmationDialogService: ConfirmationDialogService) {
    this._loggerService.info('ConfirmationDialogComponent : constructor ');
  }

  showConfirmationDialog(confirmationDialogTitle: string, confirmationDialogMessage: string, primaryButtonText: string,
    isShowSecondaryButton: boolean, secondaryButtonText: string, itemName: string, confirmationDialogSecondaryMessage: string) {
    this._loggerService.info('ConfirmationDialogComponent : showConfirmationDialog ');
    this.dialogTitle = confirmationDialogTitle;
    this.message = confirmationDialogMessage;
    this.isShowSecondaryButton = isShowSecondaryButton;
    this.primaryButtonText = primaryButtonText;
    this.secondaryButtonText = secondaryButtonText;
    this.displayModal = true;
    this.itemName = itemName;
    this.secondaryMessage = confirmationDialogSecondaryMessage;
  }

  ngOnInit() {
    this._loggerService.info('ConfirmationDialogComponent : ngOnInit ');
    this._confirmationDialogService.showConfirmationDialog = this.showConfirmationDialog.bind(this);

  }

  confirm(): void {
    this._confirmationDialogService.confirm();
    this.displayModal = false;
  }

  cancel(): void {
    this._confirmationDialogService.cancel();
    this.displayModal = false;
  }
}
