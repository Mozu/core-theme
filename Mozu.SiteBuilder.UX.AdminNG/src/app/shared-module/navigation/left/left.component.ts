import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Input,
  AfterViewInit,
  OnDestroy,
  OnChanges,
  SimpleChange,
  SimpleChanges
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
import { NotificationLGActions, NavigationContainerType } from '@shared/infrastructure/enums';
import { NavigationService } from '../navigation.service';
import { LeftNavigationModel } from './left.model';
import { MenuItem } from 'primeng/api';
import { environment } from 'environments/environment.Dev';

@Component({
  selector: 'navigation-left',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './left.component.html',
  styleUrls: ['./left.component.css']
})
export class NavigationLeftComponent implements OnInit, AfterViewInit, OnDestroy, OnChanges {
  @Input() naviContainerType: NavigationContainerType;
  public model: LeftNavigationModel;
  quotesRoute = Constants.uiRoutes.quotes;
  locationGroupRoute = Constants.uiRoutes.locationGroups;
  inventoryTitle = Constants.titles.inventory;
  locationGroupsTitle = Constants.titles.locationGroups;
  isContainerTypeChanged: boolean;
  subscriptions = [];

  constructor(
    private navigationService: NavigationService,
    private changeDetectorRef: ChangeDetectorRef,
    private _loggerService: LoggerService,
    private _sharedDataService: SharedDataService,
    private utilityService: UtilityService,
    private modalService: NgbModal,
    private _notificationService: NotificationService
  ) { }

  visibleSidebar1;

  ngOnInit() {
    this._loggerService.info('NavigationLeftComponent : ngOnInit');
    this.model = new LeftNavigationModel();
    this.fetchNavigationItem();
    this.model.filteredNavigationLinks = [];
    this.model.homeURL = environment.appUrl;
    this.model.isShowSearchComponent = true;
    this.visibleSidebar1 = false;
    this.model.isSideBarModal = true;

    this.subscriptions.push(
      this._notificationService.expandHamburgerMenuNotification.subscribe((navContainerType: NavigationContainerType) => {
        this.model.isSideBarModal = !(navContainerType === NavigationContainerType.dashboard);
        this.visibleSidebar1 = true;
        this.changeDetectorRef.detectChanges();
      })
    );
  }

  ngAfterViewInit() {
    this._loggerService.info('NavigationLeftComponent : ngAfterViewInit');
    document.querySelectorAll('.ui-scrollpanel').forEach(
      (eachElement) => {
        eachElement.setAttribute('style', 'height:' + document.querySelector('.ui-tabview-panels').clientHeight + 'px;');
        this.changeDetectorRef.detectChanges();
      }
    );
  }

  ngOnDestroy() {
    this._loggerService.info('NavigationLeftComponent : ngOnDestroy');
    this.subscriptions.forEach((s) => {
      s.unsubscribe();
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    const containerType: SimpleChange = changes.naviContainerType;
    if (containerType.currentValue !== NavigationContainerType.dashboard) {
      this.model.isSideBarModal = true;
      this.visibleSidebar1 = false;
      this.isContainerTypeChanged = true;
      this.changeDetectorRef.detectChanges();
    } else {
      this.isContainerTypeChanged = false;
    }
  }
  public collapseHamburgerMenu() {
    // if (this.isContainerTypeChanged === false) {
    this.visibleSidebar1 = false;
    this._notificationService.notifyHamburgerMenuCollapsed(this.naviContainerType);
    //}
  }
  
  public fetchNavigationItem = () => {
    this.navigationService.fetchLeftNavigationItems().subscribe(leftNavigationItemsSuccessResponse => {
      this._loggerService.info('NavigationLeftComponent : fetchLeftNavigationItems');
      /* filter the menus on the basis of logged in user behaviour id */
      this.model.filteredNavigationLinks = this.utilityService.filterLinksByBehaviorId(
        leftNavigationItemsSuccessResponse, this._sharedDataService);
      /*import/export*/
        if (this._sharedDataService._sharedData.items.ctEntities.length > 0 && !this._sharedDataService._sharedData.items.ctUser.isFulfillerUser) { /*if import/export app is enabled*/
        this.model.filteredNavigationLinks = this.appendDynamicLinks(this.model.filteredNavigationLinks);
      }
      this.model.filteredNavigationLinks = this.utilityService.populateMainNavigationLinksbyContextType(
        this.model.filteredNavigationLinks, this._sharedDataService._sharedData.items.ctTaContext);
      this.model.filteredNavigationLinks = this.utilityService.populateSubNavigationLinksbyContextType(
        this.model.filteredNavigationLinks, this._sharedDataService._sharedData.items.ctTaContext);
      this.model.mainItems = _.filter(this.model.filteredNavigationLinks,
        function (el: any) { return el.navParent === Constants.LefMenuMainTabJsonNavParentPrefix; });

      _.forEach(this.model.mainItems, (eachMainItem: MenuItem) => {
        if (eachMainItem.id === Constants.orderRoutingNavigationId) {
          eachMainItem.url = this._sharedDataService._sharedData.items.loginUri + this._sharedDataService._sharedData.items.ctTenant.id + eachMainItem.url;
        }
      });

      this.model.systemItems = _.filter(this.model.filteredNavigationLinks,
        function (el: any) { return el.navParent === Constants.LefMenuSystemTabJsonNavParentPrefix; });
      this.applyColorsToNavigationLinks();
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
        _id: element._id,
        title: element.windowTitle
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
        modalRef.componentInstance.dialogTitle = extensionLink.title ? extensionLink.title : extensionLink.label;
      }
    }, (errResponse) => {
      this._loggerService.info('NavigationLeftComponent : navigationService.fetchCapabilitiesForSecureForm_errResponse');
      throw new HttpError(ErrorCode.fetchCapabilitiesForSecureFormGetFailed, ErroNotificationType.Toaster);
    });
  }

  public megaMenuToggleIcon = (event, menuHeader) => {
    this._loggerService.info('NavigationLeftComponent : megaMenuToggleIcon');
    const element = event.target;
    element.classList.toggle('active');
    menuHeader.expanded = !menuHeader.expanded;
    this.changeDetectorRef.detectChanges();
  }

  navigationFromMegaMenu(route,event, menuHeader) {
    const element = event.target;
    element.classList.toggle('menu-option-selected');
    menuHeader.expanded = !menuHeader.expanded;
    this.changeDetectorRef.detectChanges();
    this.visibleSidebar1 = false;
    if (route === Constants.uiRoutes.locationGroups) {
      this._notificationService.notifyLocationGroupAdded(NotificationLGActions.navigateFromLeftMenu);
    }
  }

  toggleSearchComponenet(){
    this.model.isShowSearchComponent = !this.model.isShowSearchComponent;
  }

  public applyColorsToNavigationLinks(): void {
    let linkColorIndex = 1;
    _.forEach(this.model.mainItems, (eachItem, index) => {
      if (linkColorIndex % 4 === 0) {
        linkColorIndex = 0;
      }
      eachItem.styleClass = this.model.linkColors[linkColorIndex];
      linkColorIndex = linkColorIndex + 1;
    });
    this.model.mainHelpLinkStyleClass = (linkColorIndex % 4 === 0) ? this.model.linkColors[0] : this.model.linkColors[linkColorIndex];
    linkColorIndex = 1;
    _.forEach(this.model.systemItems, (eachItem, index) => {
      if (linkColorIndex % 4 === 0) {
        linkColorIndex = 0;
      }
      eachItem.styleClass = this.model.linkColors[linkColorIndex];
      linkColorIndex = linkColorIndex + 1;
    });
    this.model.systemHelpLinkStyleClass = (linkColorIndex % 4 === 0) ? this.model.linkColors[0] : this.model.linkColors[linkColorIndex];
  }
}
