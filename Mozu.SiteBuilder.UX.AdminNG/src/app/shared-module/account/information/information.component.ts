import { Component,
  OnInit,
  Input,
  SimpleChanges,
  SimpleChange,
  OnChanges,
  OnDestroy} from '@angular/core';

import * as _ from 'lodash';

import {
  LoggerService,
  HttpError,
  ErrorCode,
  ErroNotificationType,
  UtilityService,
  SpinnerService
} from '@core';

import { NotificationService, SharedDataService } from '@global';

import { Constants } from '@shared';

import { environment } from '@env';

import { AccountInfoService } from './information.service';

import { AccountInfoModel } from './information.model';
import { Subscription } from 'rxjs';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'account-information',
  templateUrl: './information.component.html',
  styleUrls: ['./information.component.css']
})
export class AccountInformationComponent implements OnChanges, OnInit, OnDestroy {
  @Input('UserId') userId: string;
  @Input('CustomerAccountId') customerAccountId: number;
  public model: AccountInfoModel;
  customerAccountURL: string;
  baseNavigationURL: string;
  subscriptions: Subscription[];

  constructor(private _accountInfoService: AccountInfoService,
    private _loggerService: LoggerService,
    private _notificationService: NotificationService,
    private _utilityService: UtilityService,
    public _sharedData: SharedDataService,
    private _spinner: SpinnerService ) {
      this.subscriptions = [];
    }

  ngOnChanges(changes: SimpleChanges) {
    this._loggerService.info('AccountInformationComponent : ngOnChanges');
    this.userId = changes['userId'].currentValue;
    this.customerAccountId = changes['customerAccountId'].currentValue;
    if (this.userId !== undefined && this.customerAccountId !== undefined) {
      this.populateAccountInfo(this.customerAccountId, this.userId);
    }
  }

  ngOnInit() {
    this._spinner.start();
    this.model = new AccountInfoModel();
    this.model.users = [];
    this.baseNavigationURL = this._utilityService.getNavigationURL(this._sharedData.leftNavigationMenuItems, 'b2baccount', 'b2baccounts');
  }

  public populateAccountInfo = (customerAccountId: number, userId: string) => {
    this._loggerService.info('AccountInformationComponent : populateAccountInfo');

    this._accountInfoService.fetchAccountInformation(customerAccountId, userId).subscribe((accountSuccessResponse: any) => {
      this._loggerService.info('AccountInformationComponent : _accountInfoService.fetchAccountInformation_successResponse');
      if (accountSuccessResponse !== null && accountSuccessResponse !== undefined && accountSuccessResponse['items'].length > 0) {
        this.model = accountSuccessResponse;
        this.model.users = _.filter(accountSuccessResponse['items'],
        function (el: any) {
          return el.userId === userId;
        });
        this.generateCustomerAccountUrl();
          this._spinner.stop();
      }
    }, (accountErrResponse) => {
      this._spinner.stop();
      this._loggerService.info('AccountInformationComponent : _accountInfoService.fetchAccountInformation_errResponse');
      throw new HttpError(ErrorCode.GetAccountInfoFailed, ErroNotificationType.Toaster);
    });
  }

  public generateCustomerAccountUrl = () => {
    this.customerAccountURL =  this.baseNavigationURL + Constants.editNavigationDeepLink + this.customerAccountId ;
  }

  ngOnDestroy() {
    this._loggerService.info('AccountInformationComponent : ngOnDestroy');
    this.subscriptions.forEach((s) => {
        s.unsubscribe();
    });
  }

}
