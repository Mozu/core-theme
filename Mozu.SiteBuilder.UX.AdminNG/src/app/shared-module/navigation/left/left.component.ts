import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef
} from '@angular/core';

import { MenuItem } from 'primeng/api';
import { LoggerService } from '@core'
import { NavigationService } from '../navigation.service';
import { LeftNavigationModel } from './left.model';

@Component({
  selector: 'navigation-left',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './left.component.html',
  styleUrls: ['./left.component.css']
})
export class NavigationLeftComponent implements OnInit {
  public model: LeftNavigationModel;
  items: MenuItem[];
  systemItems: MenuItem[];

  constructor(
    private navigationService: NavigationService,
    private changeDetectorRef: ChangeDetectorRef,
    private _loggerService : LoggerService
  ) { }

  visibleSidebar1;
  
  ngOnInit() {
    this._loggerService.info("NavigationLeftComponent : ngOnInit");
    this.model = new LeftNavigationModel();
    this.fetchNavigationItem();
  }

  public fetchNavigationItem = () => {
    this._loggerService.info("NavigationLeftComponent : fetchNavigationItem");

    this.navigationService.fetchLeftNavigationItems().subscribe((successResponse) => {
      this._loggerService.info("NavigationLeftComponent : navigationService.fetchLeftNavigationItems_successResponse");
      this.model.navigationTabs = JSON.parse(JSON.stringify(successResponse));
      this.items = this.model.navigationTabs.filter(function (el) { return el.navParent == 'main' });
      this.systemItems = this.model.navigationTabs.filter(function (el) { return el.navParent == 'sys' });
      this.changeDetectorRef.detectChanges();
    }, (errorResponse) => {
      this._loggerService.info("NavigationLeftComponent : navigationService.fetchLeftNavigationItems_errorResponse");
    });
  }
}
