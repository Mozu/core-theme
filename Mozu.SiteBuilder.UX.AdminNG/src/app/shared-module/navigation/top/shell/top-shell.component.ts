import {
    Component,
    OnInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef
  } from '@angular/core';

import { LoggerService } from '@core';
import { NotificationService } from '@global/services/notifications.service';
import { NavigationService } from '@shared/navigation/navigation.service';
import { TopNavigationModel,
         TopNavigationTabs
  } from './top-shell.model';

@Component({
  selector: 'navigation-top-shell',
  templateUrl: './top-shell.component.html',
  styleUrls: ['./top-shell.component.css']
})
export class NavigationTopShellComponent implements OnInit {

  public model: TopNavigationModel;
  activeTab: TopNavigationTabs;

  constructor(
      private navigationService: NavigationService,
      private changeDetectorRef: ChangeDetectorRef,
      private notificationService: NotificationService,
      private _loggerService: LoggerService
      ) {
        this._loggerService.info('NavigationTopShellComponent : constructor');
      }

  ngOnInit() {
    this._loggerService.info('NavigationTopShellComponent : ngOnInit');
    this.model = new TopNavigationModel();
    this.fetchHomeTabsName();
  }

  public tabSelectionChanged = (selectedTab: any) => {
    this._loggerService.info('NavigationTopShellComponent : tabSelectionChanged');
    this.activeTab = selectedTab;
    this.notificationService.notifyLoadAccessTileCategories(selectedTab.tabName);
  }

  public fetchHomeTabsName = () => {
    this._loggerService.info('NavigationTopShellComponent : fetchHomeTabsName');
    this.navigationService.fetchTabsName().subscribe((successResponse) => {
    this._loggerService.info('NavigationTopShellComponent : navigationService.fetchTabsName_SuccessResponse');
    this.model.navigationTabs = JSON.parse(JSON.stringify(successResponse));
    this.activeTab = this.model.navigationTabs[0];
    this.changeDetectorRef.detectChanges();
    }, (errorResponse) => {
      this._loggerService.info('NavigationTopShellComponent : navigationService.fetchTabsName_ErrorResponse');
    });
  }

}
