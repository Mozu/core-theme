import {
    Component,
    OnInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    OnDestroy
} from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { forkJoin } from 'rxjs/observable/forkJoin';
import { Observable } from 'rxjs/Observable';
import { MenuItem } from 'primeng/api';
import { MenuItemContent } from 'primeng/menu';
import * as _ from 'lodash';
import { 
    LoggerService,
    UtilityService
} from '@core';
import {
    SharedDataService,
    NotificationService
} from '@global';
import { environment } from '../../../environments/environment';
import { Constants } from '../infrastructure/constants';
import {
    HeaderModel,
    SearchResults,
    SearchedItem,
    SearchedItemType
} from './header.model';
import { HeaderService } from './header.service';


@Component({
    moduleId: module.id,
    selector: 'header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.css'],
    providers: [HeaderService],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent implements OnInit, OnDestroy {
    public headerModel: HeaderModel;
    public userContextMenuItem: MenuItem;
    public selectedSearchedtem: SearchedItem;
    subscriptions = [];
    mainMenuLinks: MenuItem[];

    constructor(
        private _loggerService: LoggerService,
        private _sharedData: SharedDataService,
        private _headerService: HeaderService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _notificationService: NotificationService,
        private _utilityService: UtilityService
    ) {}

    ngOnInit() {
        this._loggerService.info('HeaderComponent : ngOnInit');
        this.headerModel = new HeaderModel();
        this.headerModel.searchResult = new SearchResults();
        this.headerModel.showSearchInput = false;
        this.selectedSearchedtem = new SearchedItem();
        this.fetchloggedInUserData();
        this.fetchRedirectionLink();
        this.subscriptions.push(
            this._notificationService.LeftMenuItems.subscribe((leftNavigationMenuItems: any) => {
                this.headerModel.productURL = this._utilityService.
                getNavigationURL(leftNavigationMenuItems, 'products', 'products'),
                this.headerModel.customerURL = this._utilityService.
                getNavigationURL(leftNavigationMenuItems, 'customer', 'customers'),
                this.headerModel.ordersURL = this._utilityService.
                getNavigationURL(leftNavigationMenuItems, 'order', 'orders');
            })
            );
    }

    ngOnDestroy() {
        this.subscriptions.forEach((s) => {
            s.unsubscribe();
        });
    }

    getNavigationURL(menuItems: MenuItem[], parentMenuItemText: string, linkAddress: string): string {
        const parentMenuItem = _.find(menuItems, { id: parentMenuItemText });
        if (parentMenuItem !== null && parentMenuItem !== undefined
            && parentMenuItem.items != null) {
            const addressLinkMenuItem = _.find(parentMenuItem.items, { address: linkAddress }) as MenuItem;
            if (addressLinkMenuItem !== null && addressLinkMenuItem !== undefined) {
                return environment.appUrl + addressLinkMenuItem.url;
            }
        }
    }

    public fetchloggedInUserData = () => {
        this._loggerService.info('HeaderComponent : fetchloggedInUserData');
        this.headerModel.loggedInUserName = this._sharedData._sharedData.items.ctUser.firstName
            + ' ' + this._sharedData._sharedData.items.ctUser.lastName;
        this.headerModel.loggedInUserInitials = this._sharedData._sharedData.items.ctUser.firstName.charAt(0)
            + this._sharedData._sharedData.items.ctUser.lastName.charAt(0);
        this.headerModel.tenantName = this._sharedData._sharedData.items.ctTaContext.name;

        this.headerModel.sites = this._sharedData._sharedData.items.ctTaContext.masterCatalogs[0].sites;
    }

    public fetchRedirectionLink = () => {
        this._loggerService.info('HeaderComponent : fetchRedirectionLink');
        this._headerService.fetchRedirectionLinks().subscribe(eachLink => this.userContextMenuItem = eachLink);
    }

    public toggleVisible() {
        this.headerModel.showSearchInput = !this.headerModel.showSearchInput;
    }
    
    public clearInput() {
        if ((<HTMLInputElement>document.getElementById("globalSearchInput")).value) {
            (<HTMLInputElement>document.getElementById("globalSearchInput")).value = "";
        } else {
            this.toggleVisible()
        }
    }
    public findSite(id) {
        var match = null;
        this.headerModel.sites.forEach(function (site) {
            if (site.id == id) {
                match = site;
            }
        });
        return match;
    }

    public lookUpSuggestion(event) {
        const tenantId = this._sharedData._sharedData.items.ctTenant.id; 
        const masterCatalogId = this._sharedData._sharedData.items.ctTaContext.masterCatalogs[0].id; 
        const orderSearch = this._headerService.getOrderSearchResults(event.query, tenantId, masterCatalogId, false);
        const customerSearch = this._headerService.getCustomerSearchResults(event.query, tenantId, masterCatalogId, false);
        const productSearch = this._headerService.geProductSearchResults(event.query, tenantId, masterCatalogId, false);

        forkJoin(orderSearch.catch(e => Observable.of(e)), 
                customerSearch.catch(e => Observable.of(e)), 
                productSearch.catch(e => Observable.of(e))).subscribe(allSearchResultsResponse => {
            
            const noMatch = new SearchedItem();
            noMatch.type = SearchedItemType.none;
            const mergedSearchItems: Array<any> = [];
            for (let i = 0; i < 3; i++) {
                if (allSearchResultsResponse[i] !== undefined && allSearchResultsResponse[i].success &&
                    allSearchResultsResponse[i].items != null && allSearchResultsResponse[i].items.length > 0) {
                    const headerSearchedItem = new SearchedItem();
                    headerSearchedItem.isHeader = true;
                    for (let j = 0; j < allSearchResultsResponse[i].items.length; j++) {
                        const searchedItem = new SearchedItem();
                        searchedItem.item = allSearchResultsResponse[i].items[j];
                        searchedItem.isHeader = false;
                        var site = this.findSite(searchedItem.item.siteId);
                        switch (i) {
                            case 0: // ORDER
                                searchedItem.type = SearchedItemType.orders;
                                searchedItem.item.name = site ? site.name : searchedItem.item.siteId;
                                headerSearchedItem.type = SearchedItemType.orders;
                                break;
                            case 1: // CUSTOMER
                                searchedItem.type = SearchedItemType.customers;
                                headerSearchedItem.type = SearchedItemType.customers;
                                break;
                            case 2: // PRODUCT
                                searchedItem.type = SearchedItemType.products;
                                headerSearchedItem.type = SearchedItemType.products;
                                break;
                        }
                        if (j === 0) {
                            headerSearchedItem.item = {
                                name: headerSearchedItem.type.toString().toUpperCase() + ' '
                            };
                            mergedSearchItems.push(headerSearchedItem);
                        }
                        mergedSearchItems.push(searchedItem);
                    }
                }
            }
            if (mergedSearchItems.length == 0) {
              this.headerModel.searchResult.success = false;
              this.headerModel.searchResult.total = 0;
              this.headerModel.searchResult.items = [noMatch];
            } else {
              this.headerModel.searchResult.success = true;
              this.headerModel.searchResult.total = mergedSearchItems.length;
              this.headerModel.searchResult.items = mergedSearchItems;
            }
            this._changeDetectorRef.detectChanges();
        });
    }

    public onSuggestionSelected(event) {
        if (event.type != SearchedItemType.none) {
            let navUrl: string;
            switch (event.type) {
                case SearchedItemType.customers:
                    navUrl = this.headerModel.customerURL;
                    break;
                case SearchedItemType.orders:
                    navUrl = this.headerModel.ordersURL;
                    break;
                case SearchedItemType.products:
                    navUrl = this.headerModel.productURL;
                    break;
            }
            if (!event.isHeader) {
                if (event.type === SearchedItemType.products) {
                    navUrl = navUrl + Constants.editNavigationDeepLink + event.item.productTypeId;
                } else {
                    navUrl = navUrl + Constants.editNavigationDeepLink + event.item.id;
                }
            }
            this._utilityService.redirectToURL(navUrl);
        }
    }
}
