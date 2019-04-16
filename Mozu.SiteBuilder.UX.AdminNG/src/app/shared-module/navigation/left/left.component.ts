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
import { Response } from '@angular/http';
import { SharedDataService, CtUser } from '@global';

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
    //  var filterfn  = this.filterBehaviourId(this.model.navigationTabs);
    //  console.log(filterfn, "filterfn");
      this.mainItems = this.model.navigationTabs.filter(function (el) { return el.navParent == 'main' });
      this.systemItems = this.model.navigationTabs.filter(function (el) { return el.navParent == 'sys' });
      this.changeDetectorRef.detectChanges();
    }, (errorResponse) => {
      this._loggerService.info("NavigationLeftComponent : navigationService.fetchLeftNavigationItems_errorResponse");
    });
  }

  // public filterBehaviourId = (records) => {
   
  //   let sharedData_behavioursIds : any[];
  //   this.filterBehaviourId_Record =[] ;     
  //   sharedData_behavioursIds = this._sharedData._sharedData.items.ctUser.behaviorIds
  //   if (this._sharedData._sharedData.items.ctUser.behaviorIds.length) {
  //     records.forEach(function (record) { 
  //            if (sharedData_behavioursIds.indexOf(record.behaviorIds) === -1) {
  //             //return false;
  //             records.pop(record);
  //             }
  //             debugger
  //           //this.filterBehaviourId_Record.push(record); 
  //          //console.log(this.filterBehaviourId_Record);
  //          console.log(records);
  //           return record;
  //     });
  //   //  return filterBehaviourId_Record.push(record);    
  //   }  
  // }

}
