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
  Constants
} from '@shared/index';

import {Response} from '@angular/http';

import { DashboardModel } from './dashboard.model';

import { DashbaordService } from './dashboard.service';

import { CookieService as Cookie } from 'ngx-cookie-service';

import { SharedDataService } from '@global/services/shared-data.service';


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
  public filterfn : any;
  public filterBehaviourId_Record : any[];

  constructor(
    private _notificationService: NotificationService,
    private _changeDetectionRef: ChangeDetectorRef,
    private _dashboardService: DashbaordService,
    private _loggerService: LoggerService,
    private _cookie: Cookie,
    private _sharedData : SharedDataService
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

    this._dashboardService.fetchAllDashboardTiles().subscribe(successResponse => {
      let responseJson = successResponse;
      this._loggerService.info("AdminDashboardComponent : _dashboardService.fetchAllDashboardTiles_successResponse");
       /* filter the menus on the basis of logged in user behaviour id */
       this.filterfn  = this.filterBehaviourId(responseJson);
      this.model.systemTiles = this._dashboardService.MapDasasboardCategoryToTiles(responseJson.filter(function (eachCategory) { return eachCategory.navParent == Constants.systemTileJsonNavParentPrefix; }));
      this.model.mainTiles = this._dashboardService.MapDasasboardCategoryToTiles(responseJson.filter(function (eachCategory) { return eachCategory.navParent == Constants.mainTileJsonNavParentPrefix; }));
      this._changeDetectionRef.detectChanges();

    }, (errResponse) => {
      this._loggerService.info("AdminDashboardComponent : _dashboardService.fetchAllDashboardTiles_errResponse");;
      throw new HttpError(ErrorCode.DashboardTilesGetFailed,ErroNotificationType.Toaster);
    });
  }

  public filterBehaviourId = (records : any) => {
    records = this.pruneInvalidLinks(records);
    let sharedData_behavioursIds : any[];
    this.filterBehaviourId_Record =[] ;     
    sharedData_behavioursIds = this._sharedData._sharedData.items.ctUser.behaviorIds;
    var result = [];
    result = records.filter(function(v : any) { 
        if (v.behaviorIds) { 
          return (sharedData_behavioursIds.indexOf(v.behaviorIds) >= 0 && v.visible== "true");
        } else if(v.visible && v.visible== "true") {
          return records;
        }
      });
    return result;
  }

  public pruneInvalidLinks = (records : any) => { 
    return records.filter(function(v : any) { return (v.id != 'localization'); });
  }

      
}