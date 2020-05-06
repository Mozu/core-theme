import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  OnDestroy
} from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import {
  LoggerService,
  HttpError,
  ErrorCode,
  ErroNotificationType
} from '@core';

import { NotificationService } from '@global';
import { Constants, NavigationContainerType } from '@shared/index';
import { DashboardModel } from './dashboard.model';
import { DashbaordService } from './dashboard.service';
import { CookieService as Cookie } from 'ngx-cookie-service';
import { SharedDataService } from '@global/services/shared-data.service';
import { UtilityService } from '@core/infrastructure/utility.service';
import * as _ from 'lodash';

@Component({
  selector: 'admin-dashboard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  providers: [DashbaordService]
})
export class AdminDashboardComponent implements OnInit, OnDestroy {

  model: DashboardModel;
  subscriptions: Subscription[];

  constructor(
    private _notificationService: NotificationService,
    private _changeDetectionRef: ChangeDetectorRef,
    private _dashboardService: DashbaordService,
    private _loggerService: LoggerService,
    private _cookie: Cookie,
    private _sharedData: SharedDataService,
    private utilityService: UtilityService,
  ) {

    this._loggerService.info('AdminDashboardComponent : constructor');
    this.model = new DashboardModel();
    this.model.dashboardCSSClass = 'dashboard';
    this.subscriptions = [];
  }

  ngOnInit() {
    this._loggerService.info('AdminDashboardComponent : ngOnInit');
    this.pupulateSystemAndMainTiles();
    this.model.isShowSystemTiles = false;
    this.subscriptions.push(
      this._notificationService.loadAccessTileCategories.subscribe((activeTab: string) => {
        this.model.isShowSystemTiles = (activeTab === Constants.systemTabDisplayText);
        this._changeDetectionRef.detectChanges();
      })
    );

    this.subscriptions.push(
      this._notificationService.expandHamburgerMenuNotification.subscribe((navContainerType: NavigationContainerType) => {
        if (navContainerType === NavigationContainerType.dashboard) {
          this.model.dashboardCSSClass = 'dashboardRightShifted';
          this._changeDetectionRef.detectChanges();
        } else {
          this.model.dashboardCSSClass = 'dashboard';
          this._changeDetectionRef.detectChanges();  
        }
      })
    );

    this.subscriptions.push(
      this._notificationService.collapseHamburgerMenuNotification.subscribe((navContainerType: NavigationContainerType) => {
        this.model.dashboardCSSClass = 'dashboard';
        this._changeDetectionRef.detectChanges();
      })
    );
  }

  ngOnDestroy() {
    this._loggerService.info('AdminDashboardComponent : ngOnDestroy');

    this.subscriptions.forEach((s) => {
      s.unsubscribe();
    });
  }


  public pupulateSystemAndMainTiles = () => {
    this._loggerService.info('AdminDashboardComponent : pupulateSystemAndMainTiles');
    this._dashboardService.fetchAllDashboardTiles().subscribe(dashboardTileLinksResponse => {
      this._loggerService.info('AdminDashboardComponent : _dashboardService.fetchAllDashboardTiles_successResponse');
      /* filter the menus on the basis of logged in user behaviour id */
      this.model.filteredAccessLinks = this.utilityService.filterLinksByBehaviorId(dashboardTileLinksResponse, this._sharedData);
      this.model.filteredAccessLinks =
        this.utilityService.populateSubNavigationLinksbyContextType
          (this.model.filteredAccessLinks, this._sharedData._sharedData.items.ctTaContext);

      this.model.systemTiles = this._dashboardService.
        MapDasasboardCategoryToTiles(this.model.filteredAccessLinks
          .filter(function (eachCategory) { return eachCategory.navParent === Constants.systemTileJsonNavParentPrefix; }));
      this.model.mainTiles = this._dashboardService.
        MapDasasboardCategoryToTiles(this.model.filteredAccessLinks.
          filter(function (eachCategory) { return eachCategory.navParent === Constants.mainTileJsonNavParentPrefix; }));
      this.applyTileIconColorsToAccessTile();
      this._changeDetectionRef.detectChanges();

    }, (dashboardTileLinksErrResponse) => {
      this._loggerService.info('AdminDashboardComponent : _dashboardService.fetchAllDashboardTiles_errResponse');
      throw new HttpError(ErrorCode.DashboardTilesGetFailed, ErroNotificationType.Toaster, dashboardTileLinksErrResponse);
    });
  }

  public applyTileIconColorsToAccessTile(): void {
    let linkColorIndex = 1;
    _.forEach(this.model.mainTiles, (eachItem, index) => {
      if (linkColorIndex % 4 === 0) {
        linkColorIndex = 0;
      }
      eachItem.tileIconColor = this.model.linkColors[linkColorIndex];
      linkColorIndex = linkColorIndex + 1;
    });
    linkColorIndex = 1;
    _.forEach(this.model.systemTiles, (eachItem, index) => {
      if (linkColorIndex % 4 === 0) {
        linkColorIndex = 0;
      }
      eachItem.tileIconColor = this.model.linkColors[linkColorIndex];
      linkColorIndex = linkColorIndex + 1;
    });
  }
}
