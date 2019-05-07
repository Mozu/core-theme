import { Component, OnInit, Input } from '@angular/core';
import { LoggerService, HttpError, ErrorCode, ErroNotificationType } from '@core';
import { AccountInfoService } from './account-information.service';
import { AccountInfoModel } from './account-information.model';

@Component({
  selector: 'account-information',
  templateUrl: './account-information.component.html',
  styleUrls: ['./account-information.component.css'],
  providers: [AccountInfoService]
})
export class AccountInformationComponent implements OnInit {
  @Input('QuoteId') userId: string;
  public model: AccountInfoModel;
  constructor( private _accountInfoService: AccountInfoService,
    private _loggerService : LoggerService) { }

  ngOnInit() {
    this.model = new AccountInfoModel();
    this.model.users = [];
    this.populateAccountInfo(this.userId);
  }

  
  public populateAccountInfo = (userId:string) => {
    
    this._loggerService.info("AccountInformationComponent : populateAccountInfo");

    this._accountInfoService.fetchAccountInformation().subscribe((successResponse:Response) =>{
      this._loggerService.info("AccountInformationComponent : _accountInfoService.fetchAccountInformation_successResponse");
       let responseJson = successResponse;
        if (responseJson != null && responseJson != undefined && responseJson['users'].length > 0) {
          this.model.users = responseJson['users'];
        }
    }, (errResponse) => {
      this._loggerService.info("AccountInformationComponent : _accountInfoService.fetchAccountInformation_errResponse");
      throw new HttpError(ErrorCode.QuoteListGetFailed,ErroNotificationType.Toaster);
    })
  }

}
