import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef
} from '@angular/core';

import { MenuItem } from 'primeng/api';
import { LoggerService } from '@core'
import { NavigationService } from '../navigation.service';
import { LeftNavigationModel, LeftNavigationTabs } from './left.model';
import { SharedDataService } from '@global/services/shared-data.service';

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
    private _sharedData : SharedDataService
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
      this.filterfn  = this.filterBehaviourId(this.model.navigationTabs);
      this.mainItems = this.filterfn.filter(function (el : any) { return el.navParent == 'main' });
      this.systemItems = this.filterfn.filter(function (el : any) { return el.navParent == 'sys' });
      this.changeDetectorRef.detectChanges();
    }, (errorResponse) => {
      this._loggerService.info("NavigationLeftComponent : navigationService.fetchLeftNavigationItems_errorResponse");
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
        }
        else if(v.visible && v.visible== "true") {
          return records;
        }
      });
    return result;
  }

  public pruneInvalidLinks = (records : any) => {
    return records.filter(function(v : any) { return (v.id != 'localization'); });
  }
}
