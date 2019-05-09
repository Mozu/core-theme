import { Component, 
  OnInit, 
  Input, 
  SimpleChanges, 
  SimpleChange, 
  OnChanges } from '@angular/core';

import * as _ from 'lodash';

import {
  LoggerService,
  HttpError,
  ErrorCode,
  ErroNotificationType
} from '@core';

import { AccountInfoService } from './information.service';

import { AccountInfoModel } from './information.model';

@Component({
  selector: 'account-information',
  templateUrl: './information.component.html',
  styleUrls: ['./information.component.css'],
  providers: [AccountInfoService]
})
export class AccountInformationComponent implements OnChanges, OnInit {
  @Input('UserId') userId: string;
  public model: AccountInfoModel;
  constructor(private _accountInfoService: AccountInfoService,
    private _loggerService: LoggerService) { }

  ngOnChanges(changes: SimpleChanges) {
    this._loggerService.info("AccountInformationComponent : ngOnChanges");
    const user: SimpleChange = changes.userId;
    this.userId = user.currentValue;
    if (this.userId != undefined) {
      this.populateAccountInfo(this.userId);
    }
  }

  ngOnInit() {
    this.model = new AccountInfoModel();
    this.model.users = [];
  }


  public populateAccountInfo = (userId: string) => {

    this._loggerService.info("AccountInformationComponent : populateAccountInfo");

    this._accountInfoService.fetchAccountInformation().subscribe((successResponse: any) => {
      this._loggerService.info("AccountInformationComponent : _accountInfoService.fetchAccountInformation_successResponse");
      let responseJson = successResponse;
      if (responseJson != null && responseJson != undefined && responseJson['users'].length > 0) {
        this.model = responseJson;
        this.model.users = _.filter(responseJson['users'], function (el: any) { return el.userId == userId })[0];
      }
    }, (errResponse) => {
      this._loggerService.info("AccountInformationComponent : _accountInfoService.fetchAccountInformation_errResponse");
      throw new HttpError(ErrorCode.QuoteListGetFailed, ErroNotificationType.Toaster);
    })
  }

}
