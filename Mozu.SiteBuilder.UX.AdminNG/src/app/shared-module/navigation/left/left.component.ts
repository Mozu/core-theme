import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  EventEmitter,
  Output
} from '@angular/core';
import { Router } from '@angular/router';
import * as _ from 'lodash';
import {
  NgbModal,
  NgbModalConfig
} from '@ng-bootstrap/ng-bootstrap';
import {
  LoggerService,
  HttpError,
  ErrorCode,
  ErroNotificationType
} from '@core';
import { UtilityService } from '@core/infrastructure/utility.service';
import { SharedDataService, NotificationService } from '@global';
import { Constants } from '@shared/infrastructure/constants';
import { DynamicLinksDialogComponent } from '@shared/dynamic-links-dialog/dynamic-links-dialog.component';
import { NotificationLGActions } from '@shared/infrastructure/enums';
import { NavigationService } from '../navigation.service';
import { LeftNavigationModel, SecureForm, LeftNavigationTabs } from './left.model';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'navigation-left',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './left.component.html',
  styleUrls: ['./left.component.css']
})
export class NavigationLeftComponent implements OnInit {
  public model: LeftNavigationModel;
  quotesRoute = Constants.uiRoutes.quotes;
  locationGroupRoute = Constants.uiRoutes.locationGroups;
  inventoryTitle = Constants.titles.inventory;
  locationGroupsTitle = Constants.titles.locationGroups;
  subscriptions = [];

  constructor(
    private navigationService: NavigationService,
    private changeDetectorRef: ChangeDetectorRef,
    private _loggerService: LoggerService,
    private _sharedDataService: SharedDataService,
    private utilityService: UtilityService,
    private modalService: NgbModal,
    private _notificationService: NotificationService,
  ) { }

  visibleSidebar1;

  ngOnInit() {
    this._loggerService.info('NavigationLeftComponent : ngOnInit');
    this.model = new LeftNavigationModel();
    this.fetchNavigationItem();
    this.model.filteredNavigationLinks = [];
  }

  public fetchNavigationItem = () => {
    this.navigationService.fetchLeftNavigationItems().subscribe(leftNavigationItemsSuccessResponse => {
      this._loggerService.info('NavigationLeftComponent : fetchLeftNavigationItems');
      /* filter the menus on the basis of logged in user behaviour id */
      this.model.filteredNavigationLinks = this.utilityService.filterLinksByBehaviorId(
        leftNavigationItemsSuccessResponse, this._sharedDataService);
      /*import/export*/
      if (this._sharedDataService._sharedData.items.ctEntities.length > 0) { /*if import/export app is enabled*/
        this.model.filteredNavigationLinks = this.appendDynamicLinks(this.model.filteredNavigationLinks);
      }
      this.model.filteredNavigationLinks = this.utilityService.populateNavigationLinksbyContextType(
        this.model.filteredNavigationLinks, this._sharedDataService._sharedData.items.ctTaContext);
      this.model.mainItems = _.filter(this.model.filteredNavigationLinks,
        function (el: any) { return el.navParent === Constants.LefMenuMainTabJsonNavParentPrefix; });

      _.forEach(this.model.mainItems, (eachMainItem: MenuItem) => {
        if (eachMainItem.id === Constants.orderRoutingNavigationId) {
          (eachMainItem.items as MenuItem[]).forEach((eachItem: MenuItem) => {
            if (eachItem.id === Constants.orderRoutingNavigationId) {
              eachItem.url = this._sharedDataService._sharedData.items.loginUri + this._sharedDataService._sharedData.items.ctTenant.id + eachMainItem.url;
            }
          });
        }
      });

      this.model.systemItems = _.filter(this.model.filteredNavigationLinks,
        function (el: any) { return el.navParent === Constants.LefMenuSystemTabJsonNavParentPrefix; });
      this.changeDetectorRef.detectChanges();
      this._sharedDataService.leftNavigationMenuItems = this.model.mainItems;
      this._notificationService.notifyLeftMenuItemsLoaded(this._sharedDataService.leftNavigationMenuItems);
    }, (leftNavigationItemsErrorResponse) => {
      this._loggerService.info('NavigationLeftComponent : navigationService.fetchLeftNavigationItems_errorResponse');
    });
  }

  public appendDynamicLinks = (allFilteredLinks) => {
    this._loggerService.info('NavigationLeftComponent : appendDynamicLinks');
    const distinctDynamicLinks = this.navigationService.distictImportExportLinks(this._sharedDataService);
    const filteredDynamicLinks = [];

    distinctDynamicLinks.forEach(element => {
      filteredDynamicLinks.push({
        label: element.modalWindowTitle,
        location: element.location,
        url: element.href,
        appId: element.appId,
        _id: element._id
      });
    });
    this.model.filteredNavigationLinks = this.navigationService.mergeDynamicLinks(allFilteredLinks, filteredDynamicLinks);
    return this.model.filteredNavigationLinks;
  }

  public openDynamicLinksDialog = (extensionLink) => {
    this._loggerService.info('NavigationLeftComponent : openDynamicLinksDialog');

    const jsonData = { 'x-vol-return-url': window.location.href };
    let returnUrl = window.location.href.replace(window.location.search, '');

    if (returnUrl[returnUrl.length - 1] === '/') {
      returnUrl = returnUrl.substr(0, returnUrl.length - 1);
    }

    returnUrl += '?_mz_extlnk=' + extensionLink._id;
    jsonData['x-vol-return-url'] = returnUrl;

    this.navigationService.fetchCapabilitiesForSecureForm(extensionLink.appId, jsonData).subscribe(data => {
      const secureForm = JSON.parse(JSON.stringify(data));
      if (secureForm.success) {
        this.model.dynamicLinkIframeURL = extensionLink.url + Constants.dateStamp + encodeURIComponent(secureForm.items.dateStamp) + Constants.messageHash + encodeURIComponent(secureForm.items.messageHash);
        const modalRef = this.modalService.open(DynamicLinksDialogComponent, { windowClass: Constants.integrationsModalClass, backdropClass: Constants.integrationsBackdropModalClass });
        modalRef.componentInstance.iframeResourceURL = this.model.dynamicLinkIframeURL;
        modalRef.componentInstance.formBody = secureForm.items.body;
      }
    }, (errResponse) => {
      this._loggerService.info('NavigationLeftComponent : navigationService.fetchCapabilitiesForSecureForm_errResponse');
      throw new HttpError(ErrorCode.fetchCapabilitiesForSecureFormGetFailed, ErroNotificationType.Toaster);
    });
  }

  public megaMenuToggleIcon = (event) => {
    this._loggerService.info('NavigationLeftComponent : megaMenuToggleIcon');
    const element = event.target;
    element.classList.toggle('active');
  }

  navigationFromMegaMenu(route) {
    this.visibleSidebar1 = false;
    if (route === Constants.uiRoutes.locationGroups) {
      this._notificationService.notifyLocationGroupAdded(NotificationLGActions.navigateFromLeftMenu);
    }
  }

}
