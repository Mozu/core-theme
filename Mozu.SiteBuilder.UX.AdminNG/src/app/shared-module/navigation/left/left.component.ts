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
import { 
  NgbModal, 
  NgbModalConfig
} from '@ng-bootstrap/ng-bootstrap';
import { DynamicLinksComponent } from './dynamic-links/dynamic-links.component';


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
  public _isImportExportMenuLinks = false;
  public secureFormData : any;
  public distinctImportExportLinks;
  public ImportExportencodedValues : string;
  // @Output() secureFormAppId = new EventEmitter<any>();


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
    this.navigationService.fetchLeftNavigationItems().subscribe( data => {
      this._loggerService.info("NavigationLeftComponent : fetchLeftNavigationItems");
      let responseJson = data
      //  this.model.navigationTabs = JSON.parse(JSON.stringify(responseJson));
      /* filter the menus on the basis of logged in user behaviour id */
      this.model.filteredNavigationLinks  = this.utilityService.filterLinksByBehaviorId(responseJson, this._sharedData);
      /*import/export*/
      if(this._sharedData._sharedData.items.ctEntities.length > 0) { /*if import/export app is enabled*/
        this.model.filteredNavigationLinks = this.utilityService.mergeImportExportLinks(this.model.filteredNavigationLinks, this._sharedData);
      }
      this.mainItems = _.filter(this.model.filteredNavigationLinks, function (el : any) { return el.navParent == 'main' });
      this.systemItems = _.filter(this.model.filteredNavigationLinks, function (el : any) { return el.navParent == 'sys' });
      this.changeDetectorRef.detectChanges();
    }, (errorResponse : any) => {
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
