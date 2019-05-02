import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef
} from '@angular/core';

import { MenuItem } from 'primeng/api';
import * as _ from 'lodash';
import { LoggerService } from '@core'
import { SharedDataService } from '@global/services/shared-data.service';
import { NavigationService } from '../navigation.service';
import { LeftNavigationModel } from './left.model';
import { UtilityService } from '@core/infrastructure/utility.service';

@Component({
  selector: 'navigation-left',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './left.component.html',
  styleUrls: ['./left.component.css']
})
export class NavigationLeftComponent implements OnInit {
  public model: LeftNavigationModel;
  //public leftNavTabmodel : LeftNavigationTabs;
  mainItems: MenuItem[];
  systemItems: MenuItem[];
  public filterBehaviourId_Record : any[];
  public filterfn : any;

  constructor(
    private navigationService: NavigationService,
    private changeDetectorRef: ChangeDetectorRef,
    private _loggerService : LoggerService,
    private _sharedData : SharedDataService,
    private utilityService : UtilityService,
  ) { this.filterBehaviourId_Record = []; }

  visibleSidebar1;
  
  ngOnInit() {
    this._loggerService.info("NavigationLeftComponent : ngOnInit");
    this.model = new LeftNavigationModel();
    //this.leftNavTabmodel = new LeftNavigationTabs();
    this.fetchNavigationItem();
  }

  public fetchNavigationItem = () => {
    this.navigationService.fetchLeftNavigationItems().subscribe( data => {
      this._loggerService.info("NavigationLeftComponent : fetchLeftNavigationItems");
      let responseJson = data
      this.model.navigationTabs = JSON.parse(JSON.stringify(responseJson));
      /* filter the menus on the basis of logged in user behaviour id */
      this.model.filteredNavigationLinks  = this.utilityService.filterLinksByBehaviorId(responseJson, this._sharedData._sharedData.items.ctUser.behaviorIds);

      this.mainItems = _.filter(this.model.filteredNavigationLinks, function (el : any) { return el.navParent == 'main' });
      this.systemItems = _.filter(this.model.filteredNavigationLinks, function (el : any) { return el.navParent == 'sys' });
      this.changeDetectorRef.detectChanges();
    }, (errorResponse) => {
      this._loggerService.info("NavigationLeftComponent : navigationService.fetchLeftNavigationItems_errorResponse");
    });
  }
}
