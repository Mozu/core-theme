import { 
    Component, 
    OnInit, 
    ChangeDetectionStrategy,
    ChangeDetectorRef 
  } from '@angular/core';

import {  LoggerService } from '@core'
import { NotificationService } from '@global/services/notifications.service';
import { NavigationService } from '../navigation.service';
import { TopNavigationModel, TopNavigationTabs } from './top.model';

@Component({
  selector: 'navigation-top',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './top.component.html',
  styleUrls: ['./top.component.css']
})
export class NavigationTopComponent implements OnInit {

  public model : TopNavigationModel;
  activeTab : TopNavigationTabs

  constructor(
      private navigationService : NavigationService,
      private changeDetectorRef : ChangeDetectorRef,
      private notificationService : NotificationService,
      private _loggerService : LoggerService
      ) { 
        this._loggerService.info("NavigationTopComponent : constructor");
      }

  ngOnInit() {
    this._loggerService.info("NavigationTopComponent : ngOnInit");
    this.model = new TopNavigationModel();
    this.fetchHomeTabsName();
  }

  public tabSelectionChanged = (selectedTab: any) => {
    this._loggerService.info("NavigationTopComponent : tabSelectionChanged");
    this.activeTab = selectedTab;
    this.notificationService.notifyLoadAccessTileCategories(selectedTab.tabName);
  }

  public fetchHomeTabsName = () => {
    this._loggerService.info("NavigationTopComponent : fetchHomeTabsName");
    this.navigationService.fetchTabsName().subscribe((successResponse) => {
    this._loggerService.info("NavigationTopComponent : navigationService.fetchTabsName_SuccessResponse"); 
    this.model.navigationTabs = JSON.parse(JSON.stringify(successResponse));
    this.activeTab = this.model.navigationTabs[0];
    this.changeDetectorRef.detectChanges();
    },(errorResponse) => {
      this._loggerService.info("NavigationTopComponent : navigationService.fetchTabsName_ErrorResponse"); 
    });
  }

}