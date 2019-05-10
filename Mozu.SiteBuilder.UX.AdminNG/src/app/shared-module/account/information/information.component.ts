import { Component, 
  OnInit, 
  Input, 
  SimpleChanges, 
  SimpleChange, 
  OnChanges } from '@angular/core';

import * as _ from 'lodash';

import { SharedDataService } from '@global';

import {
  LoggerService,
  HttpError,
  ErrorCode,
  ErroNotificationType
} from '@core';

import { AccountInfoService } from './information.service';

import { AccountInfoModel } from './information.model';
import { Constants } from '@shared';

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
  appendSiteToken: string;

  constructor(private _accountInfoService: AccountInfoService,
    private _loggerService: LoggerService,
    private _sharedData : SharedDataService,) { }

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
        this.fetchSitesFromUserIdentity();
      }
    }, (errResponse) => {
      this._loggerService.info("AccountInformationComponent : _accountInfoService.fetchAccountInformation_errResponse");
      throw new HttpError(ErrorCode.QuoteListGetFailed, ErroNotificationType.Toaster);
    })
  }

  public fetchSitesFromUserIdentity = () => {
      this._loggerService.info("AccountInformationComponent : fetchSitesFromUserIdentity");
      let siteId = this._sharedData._sharedData.items.ctTaContext.masterCatalogs[0].sites[0].id;
      this.appendSiteToken = Constants.urlParameters.site + siteId + Constants.urlParameters.b2bAccount 
      + Constants.urlParameters.edit + this.customerAccountId ;

      this.appendSiteToken = "https://t19636.ngdev06.kibong-dev.com/Admin/s-23790/b2baccounts/edit/1033"; // To be removed
  }

}
