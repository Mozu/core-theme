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

import { SharedDataService } from '@global';

import { Constants } from '@shared';

import { environment } from '@env';

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
  @Input('CustomerAccountId') customerAccountId: number;
  public model: AccountInfoModel;
  customerAccountUrl: string;

  constructor(private _accountInfoService: AccountInfoService,
    private _loggerService: LoggerService,
    private _sharedData : SharedDataService,) { }

  ngOnChanges(changes: SimpleChanges) {
    this._loggerService.info("AccountInformationComponent : ngOnChanges");
    this.userId = changes["userId"].currentValue;
    console.log("this.userId::",this.userId);
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
        this.generateCustomerAccountUrl();
      }
    }, (errResponse) => {
      this._loggerService.info("AccountInformationComponent : _accountInfoService.fetchAccountInformation_errResponse");
      throw new HttpError(ErrorCode.QuoteListGetFailed, ErroNotificationType.Toaster);
    })
  }

  public generateCustomerAccountUrl = () => {
      this._loggerService.info("AccountInformationComponent : generateCustomerAccountUrl");
      let siteId = this._sharedData._sharedData.items.ctTaContext.masterCatalogs[0].sites[0].id;
      this.customerAccountUrl = environment.accountUrl + Constants.urlParameter.site + siteId + Constants.urlParameter.b2bAccount 
      + Constants.urlParameter.edit + this.customerAccountId ;
  }

}
