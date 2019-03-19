import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  OnDestroy
} from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { 
  LoggerService ,
  HttpError,
  ErrorCode, 
  ErroNotificationType} from '@core'

import { NotificationService } from '@global'
import {
  AccessTileModel,
  AccessTileLink,
  Constants
} from '@shared/index';

import { DashboardModel } from './dashboard.model';

import { DashbaordService } from './dashboard.service';

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
    private _loggerService: LoggerService
  ) {

    this._loggerService.info("AdminDashboardComponent : constructor");
    this.model = new DashboardModel();
    this.subscriptions = [];
  }

  ngOnInit() {
    this._loggerService.info("AdminDashboardComponent : ngOnInit");

    this.pupulateSystemAndMainTiles();
    this.model.isShowSystemTiles = false;
    this.subscriptions.push(
      this._notificationService.loadAccessTileCategories.subscribe((activeTab: string) => {
        this.model.isShowSystemTiles = (activeTab == "System");
        this._changeDetectionRef.detectChanges();
      })
    );
  }

  ngOnDestroy() {
    this._loggerService.info("AdminDashboardComponent : ngOnDestroy");

    this.subscriptions.forEach((s) => {
      s.unsubscribe();
    });
  }


  public pupulateSystemAndMainTiles = () => {
    this._loggerService.info("AdminDashboardComponent : pupulateSystemAndMainTiles");

    this._dashboardService.fetchAllDashboardTiles().subscribe((successResponse) => {
      this._loggerService.info("AdminDashboardComponent : _dashboardService.fetchAllDashboardTiles_successResponse");;
      this.model.systemTiles = this.MapDasasboardCategoryToTiles(successResponse.filter(function (eachCategory) { return eachCategory.navParent == Constants.systemTileJsonNavParentPrefix; }));
      this.model.mainTiles = this.MapDasasboardCategoryToTiles(successResponse.filter(function (eachCategory) { return eachCategory.navParent == Constants.mainTileJsonNavParentPrefix; }));
      this._changeDetectionRef.detectChanges();

    }, (errResponse) => {
      this._loggerService.info("AdminDashboardComponent : _dashboardService.fetchAllDashboardTiles_errResponse");;
      throw new HttpError(ErrorCode.DashboardTilesGetFailed,ErroNotificationType.Toaster);
    });
  }

  private MapDasasboardCategoryToTiles(dashboardCategories: any): AccessTileModel[] {
    this._loggerService.info("AdminDashboardComponent : MapDasasboardCategoryToTiles");
    let allAccessTiles: AccessTileModel[];
    if (dashboardCategories != null && dashboardCategories != undefined && dashboardCategories.length > 0) {
      allAccessTiles = [];
      dashboardCategories.forEach(eachDasboardCategory => {
        let accessTileModel = new AccessTileModel();
        accessTileModel.sectionText = eachDasboardCategory.label;
        accessTileModel.sectionImageURL = eachDasboardCategory.imageURL;
        if (eachDasboardCategory.items != null && eachDasboardCategory.items != undefined && eachDasboardCategory.items.length > 0) {
          accessTileModel.sectionLinks = [];
          eachDasboardCategory.items.forEach(eachDasbhboardCategoryItem => {
            let sectionLink = new AccessTileLink();
            sectionLink.linkDataText = eachDasbhboardCategoryItem.label;
            sectionLink.linkDataURL = Constants.voidNavigationLink;
            accessTileModel.sectionLinks.push(sectionLink);
          });
        }
        allAccessTiles.push(accessTileModel);
      });
    }
    return allAccessTiles;
  }
}