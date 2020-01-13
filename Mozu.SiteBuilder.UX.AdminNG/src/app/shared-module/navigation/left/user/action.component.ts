import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef
} from '@angular/core';

import { LoggerService } from '@core';
import { SharedDataService } from '@global';
import { MenuItem } from 'primeng/api';
import { NavigationLeftUserActionModel } from './action.model';
import { NavigationLeftUserActionService } from './action.service';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'navigation-left-user-action',
  templateUrl: './action.component.html',
  styleUrls: ['./action.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [NavigationLeftUserActionService]
})
export class NavigationLeftUserActionComponent implements OnInit {
  public model: NavigationLeftUserActionModel;
  
  constructor(
    private _sharedData: SharedDataService,
    private _loggerService: LoggerService,
    private _navigationLeftUserActionService: NavigationLeftUserActionService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _cookieService: CookieService
  ) { }

  ngOnInit() {
    this._loggerService.info('NavigationLeftUserActionComponent : ngOnInit');
    this.model = new NavigationLeftUserActionModel();
    this.fetchloggedInUserData();
    this.model.showSwitchAdminButton = this._sharedData._sharedData.items.ctTaContext.hasLegacyAdmin;
  }
  public fetchRedirectionLink = () => {
    this._loggerService.info('NavigationLeftUserActionComponent : fetchRedirectionLink');
    this._navigationLeftUserActionService.fetchRedirectionLinks().subscribe(redirectionLinksResponse => {
      this.model.userRedirectionLinks = redirectionLinksResponse;
      this._changeDetectorRef.detectChanges();
    });
  }

  public fetchloggedInUserData = () => {
    this._loggerService.info('NavigationLeftUserActionComponent : fetchloggedInUserData');
    this.model.loggedInUserName = this._sharedData._sharedData.items.ctUser.firstName
      + ' ' + this._sharedData._sharedData.items.ctUser.lastName;
    this.model.loggedInUserInitials = this._sharedData._sharedData.items.ctUser.firstName.charAt(0)
      + this._sharedData._sharedData.items.ctUser.lastName.charAt(0);
    this.model.tenantName = this._sharedData._sharedData.items.ctTaContext.name;
  }

  onClickSwitchAdminButton() {
    this._cookieService.set('isUnified', 'false', null, '/');
    window.location.reload(true);
  }

}
