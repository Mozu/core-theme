import {
    Component,
    OnInit,
  } from '@angular/core';

import {  LoggerService } from '@core'
import { NotificationService } from '@global/services/notifications.service';
import { NavigationService } from '../navigation.service';
import { TopNavigationModel, TopNavigationTabs } from './top.model';
import { Response } from '@angular/http';

@Component({
  selector: 'navigation-top-shell',
  templateUrl: './top-shell.component.html',
  styleUrls: ['./top-shell.component.css']
})
export class NavigationTopShellComponent implements OnInit {

  public model : TopNavigationModel;
  activeTab : TopNavigationTabs

  constructor(
      private navigationService : NavigationService,
      private notificationService : NotificationService,
      private _loggerService : LoggerService
      ) { 
        this._loggerService.info("NavigationTopShellComponent : constructor");
      }

  ngOnInit() {
    this._loggerService.info("NavigationTopShellComponent : ngOnInit");
    this.model = new TopNavigationModel();
    this.fetchHomeTabsName();
  }

  public tabSelectionChanged = (selectedTab: any) => {
    this._loggerService.info("NavigationTopShellComponent : tabSelectionChanged");
    this.activeTab = selectedTab;
    this.notificationService.notifyLoadAccessTileCategories(selectedTab.tabName);
  }

  public fetchHomeTabsName = () => {
    this._loggerService.info("NavigationTopComponent : fetchHomeTabsName");
    this.navigationService.fetchTabsName().subscribe(successResponse => {
    this._loggerService.info("NavigationTopComponent : navigationService.fetchTabsName_SuccessResponse");
    let responseJson = successResponse
    this.model.navigationTabs = JSON.parse(JSON.stringify(responseJson));
    this.activeTab = this.model.navigationTabs[0];
    },(errorResponse) => {
      this._loggerService.info("NavigationTopShellComponent : navigationService.fetchTabsName_ErrorResponse"); 
    });
  }

}