import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  EventEmitter,
  Output
} from '@angular/core';

//import { HttpUrlEncodingCodec } from '@angular/common/http';
import { MenuItem } from 'primeng/api';
import * as _ from 'lodash';
import { LoggerService } from '@core'
import { SharedDataService } from '@global/services/shared-data.service';
import { NavigationService } from '../navigation.service';
import { LeftNavigationModel } from './left.model';
import { UtilityService } from '@core/infrastructure/utility.service';
import { Constants } from '@shared/infrastructure/constants';



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
    private modalService: NgbModal,
    private config: NgbModalConfig,
    //private httpUrlEncoding : HttpUrlEncodingCodec,
  ) { 
    this.filterBehaviourId_Record = [];
    // config.backdrop = 'static';
    // config.keyboard = false; 
    }

  visibleSidebar1;
  
  ngOnInit() {
    this._loggerService.info("NavigationLeftComponent : ngOnInit");
    this.model = new LeftNavigationModel();
    //this.leftNavTabmodel = new LeftNavigationTabs();
    this.fetchNavigationItem();
  }

  public fetchNavigationItem = () => {
    this.navigationService.fetchLeftNavigationItems().subscribe( leftNavigationItemsSuccessResponse => {
      this._loggerService.info("NavigationLeftComponent : fetchLeftNavigationItems");
      /* filter the menus on the basis of logged in user behaviour id */
      this.model.filteredNavigationLinks  = this.utilityService.filterLinksByBehaviorId(leftNavigationItemsSuccessResponse, this._sharedData._sharedData.items.ctUser.behaviorIds);
      this.model.filteredNavigationLinks = this.utilityService.populateNavigationLinksbyContextType(this.model.filteredNavigationLinks,this._sharedData._sharedData.items.ctTaContext);

      this.mainItems = _.filter(this.model.filteredNavigationLinks, function (el : any) { return el.navParent == Constants.LefMenuMainTabJsonNavParentPrefix });
      this.systemItems = _.filter(this.model.filteredNavigationLinks, function (el : any) { return el.navParent == Constants.LefMenuSystemTabJsonNavParentPrefix});
      this.changeDetectorRef.detectChanges();
    }, (leftNavigationItemsErrorResponse) => {
      this._loggerService.info("NavigationLeftComponent : navigationService.fetchLeftNavigationItems_errorResponse");
    });
  }

  public openDialog = (e : any, visibleSidebar1 : boolean) => {
    var field = 'appId';
    var importexportLinks = JSON.parse(JSON.stringify(this._sharedData._sharedData.items.ctEntities));
    var appId = _.some(importexportLinks, function(o) { if( _.has(o, field)) {  return o.appId } } );
    
    this.navigationService.fetchCapabilitiesForSecureForm(appId).subscribe( data => {
      var secureForm = JSON.parse(JSON.stringify(data));
      if(secureForm.items) {
      this.ImportExportencodedValues = 'dt=' + encodeURIComponent(secureForm.items.dateStamp) + '&messageHash=' + encodeURIComponent(secureForm.items.messageHash);
      //  this.secureFormAppId.emit(data.dateStamp);
      const modalRef = this.modalService.open(DynamicLinksComponent);
      modalRef.componentInstance.src = this.ImportExportencodedValues;
    }
    });
  }
}
