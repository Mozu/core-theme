import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  EventEmitter,
  Output
} from '@angular/core';

import { MenuItem } from 'primeng/api';
import * as _ from 'lodash';
import { 
  NgbModal, 
  NgbModalConfig
} from '@ng-bootstrap/ng-bootstrap';
import { LoggerService,
  HttpError, 
  ErrorCode, 
  ErroNotificationType } from '@core'
import { UtilityService } from '@core/infrastructure/utility.service';

import { SharedDataService } from '@global/services/shared-data.service';

import { Constants } from '@shared/infrastructure/constants';

import { NavigationService } from '../navigation.service';
import { LeftNavigationModel, SecureForm } from './left.model';
import { DynamicLinksComponent } from './dynamic-links/dynamic-links.component';

@Component({
  selector: 'navigation-left',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './left.component.html',
  styleUrls: ['./left.component.css']
})
export class NavigationLeftComponent implements OnInit {
  public model: LeftNavigationModel;
  
  constructor(
    private navigationService: NavigationService,
    private changeDetectorRef: ChangeDetectorRef,
    private _loggerService : LoggerService,
    private _sharedData : SharedDataService,
    private utilityService : UtilityService,
    private modalService: NgbModal,
    private config: NgbModalConfig,
  ) { }

  visibleSidebar1;
  
  ngOnInit() {
    this._loggerService.info("NavigationLeftComponent : ngOnInit");
    this.model = new LeftNavigationModel();
    this.fetchNavigationItem();
  }

  public fetchNavigationItem = () => {
    this.navigationService.fetchLeftNavigationItems().subscribe( leftNavigationItemsSuccessResponse => {
      this._loggerService.info("NavigationLeftComponent : fetchLeftNavigationItems");
      /* filter the menus on the basis of logged in user behaviour id */
      this.model.filteredNavigationLinks  = this.utilityService.filterLinksByBehaviorId(leftNavigationItemsSuccessResponse, this._sharedData);
       /*import/export*/
      if(this._sharedData._sharedData.items.ctEntities.length > 0) { /*if import/export app is enabled*/
        this.model.filteredNavigationLinks = this.appendDynamicLinks(this.model.filteredNavigationLinks);
      }
      this.model.filteredNavigationLinks = this.utilityService.populateNavigationLinksbyContextType(this.model.filteredNavigationLinks,this._sharedData._sharedData.items.ctTaContext);

      this.model.mainItems = _.filter(this.model.filteredNavigationLinks, function (el : any) { return el.navParent == Constants.LefMenuMainTabJsonNavParentPrefix });
      this.model.systemItems = _.filter(this.model.filteredNavigationLinks, function (el : any) { return el.navParent == Constants.LefMenuSystemTabJsonNavParentPrefix});
      this.changeDetectorRef.detectChanges();
    }, (leftNavigationItemsErrorResponse) => {
      this._loggerService.info("NavigationLeftComponent : navigationService.fetchLeftNavigationItems_errorResponse");
    });
  }

  public appendDynamicLinks = (allFilteredLinks) => {
    this._loggerService.info("NavigationLeftComponent : appendDynamicLinks");
    var distinctDynamicLinks = this.navigationService.distictImportExportLinks(this._sharedData);
       
        var filteredDynamicLinks = [];
        
        distinctDynamicLinks.forEach(element => {
          filteredDynamicLinks.push({
                label: element.modalWindowTitle,  
                location: element.location,
                navUrl : element.href,
                appId : element.appId,
                command: (event : any) => { this.openDynamicLinksDialog(element.href, element.appId) }
            });
        });
        this.model.filteredNavigationLinks = this.navigationService.mergeDynamicLinks(allFilteredLinks, filteredDynamicLinks);
        return this.model.filteredNavigationLinks;
  }

  public openDynamicLinksDialog = (url, appId) => {
    this._loggerService.info("NavigationLeftComponent : openDynamicLinksDialog");     
    this.navigationService.fetchCapabilitiesForSecureForm(appId).subscribe( data => {
        var secureForm = JSON.parse(JSON.stringify(data));
        if(secureForm.items) {
        this.model.dynamicLinkIframeURL = url + Constants.dateStamp + encodeURIComponent(secureForm.items.dateStamp) + Constants.messageHash + encodeURIComponent(secureForm.items.messageHash);
        const modalRef = this.modalService.open(DynamicLinksDialogComponent, { windowClass: Constants.integrationsModalClass});
        modalRef.componentInstance.iframeResourceURL =  this.model.dynamicLinkIframeURL;
     }
    }, (errResponse) => {
      this._loggerService.info("QuotesListComponent : _quotesListService.fetchAllQuotes_errResponse");
      throw new HttpError(ErrorCode.fetchCapabilitiesForSecureFormGetFailed,ErroNotificationType.Toaster);
    });
  }
}
