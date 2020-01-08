import {
    Component,
    OnInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    OnDestroy,
    Input,
    Output,
    EventEmitter
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
import {
    Constants,
    NavigationContainerType
} from '@shared/infrastructure';
import {
    NavigationSearchModel,
    SearchResults,
    SearchedItem,
    SearchedItemType
} from './search.model';
import { NavigationLeftSearchService } from './search.service';

@Component({
    moduleId: module.id,
    selector: 'navigation-left-search',
    templateUrl: './search.component.html',
    styleUrls: ['./search.component.css'],
    providers: [NavigationLeftSearchService],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavigationLeftSearchComponent implements OnInit, OnDestroy {
    @Input() isShowSearchComponent: boolean;
    @Output() resetSearchInput = new EventEmitter<boolean>();
    public navigationSearchModel: NavigationSearchModel;
    public userContextMenuItem: MenuItem;
    subscriptions = [];
    mainMenuLinks: MenuItem[];

    constructor(
        private _loggerService: LoggerService,
        private _sharedData: SharedDataService,
        private _navigationLeftSearchService: NavigationLeftSearchService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _notificationService: NotificationService,
        private _utilityService: UtilityService
    ) { }

    ngOnInit() {
        this._loggerService.info('NavigationLeftSearchComponent : ngOnInit');
        this.navigationSearchModel = new NavigationSearchModel();
        this.navigationSearchModel.searchResult = new SearchResults();
        this.fetchloggedInUserData();
        this.subscriptions.push(
            this._notificationService.leftMenuItemsLoaded.subscribe((leftNavigationMenuItems: any) => {
                this.navigationSearchModel.productURL = this._utilityService.
                    getNavigationURL(leftNavigationMenuItems, SearchedItemType.products, SearchedItemType.products),
                    this.navigationSearchModel.customerURL = this._utilityService.
                        getNavigationURL(leftNavigationMenuItems, SearchedItemType.customer, SearchedItemType.customers),
                    this.navigationSearchModel.ordersURL = this._utilityService.
                        getNavigationURL(leftNavigationMenuItems, SearchedItemType.order, SearchedItemType.orders);
            })
        );
    }

    public fetchloggedInUserData = () => {
        this._loggerService.info('NavigationLeftSearchComponent : fetchloggedInUserData');
        this.navigationSearchModel.sites = this._sharedData._sharedData.items.ctTaContext.masterCatalogs[0].sites;
    }

    ngOnDestroy() {
        this.subscriptions.forEach((s) => {
            s.unsubscribe();
        });
    }

    public clearInput() {
        if ((<HTMLInputElement>document.getElementById('globalSearchInput')).value) {
            (<HTMLInputElement>document.getElementById('globalSearchInput')).value = '';
        } else {
            this.resetSearchInput.emit(true);
        }
    }
    public findSite(id) {
        let match = null;
        this.navigationSearchModel.sites.forEach(function (site) {
            if (site.id === id) {
                match = site;
            }
        });
        return match;
    }

    public lookUpSuggestion(event) {
        const tenantId = this._sharedData._sharedData.items.ctTenant.id;
        const masterCatalogId = this._sharedData._sharedData.items.ctTaContext.masterCatalogs[0].id;
        const orderSearch = this._navigationLeftSearchService.getOrderSearchResults(event.query, tenantId, masterCatalogId, false);
        const customerSearch = this._navigationLeftSearchService.getCustomerSearchResults(event.query, tenantId, masterCatalogId, false);
        const productSearch = this._navigationLeftSearchService.geProductSearchResults(event.query, tenantId, masterCatalogId, false);

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
                            const site = this.findSite(searchedItem.item.siteId);
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
                if (mergedSearchItems.length === 0) {
                    this.navigationSearchModel.searchResult.success = false;
                    this.navigationSearchModel.searchResult.total = 0;
                    this.navigationSearchModel.searchResult.items = [noMatch];
                } else {
                    this.navigationSearchModel.searchResult.success = true;
                    this.navigationSearchModel.searchResult.total = mergedSearchItems.length;
                    this.navigationSearchModel.searchResult.items = mergedSearchItems;
                }
                this._changeDetectorRef.detectChanges();
            });
    }

    public onSuggestionSelected(event) {
        if (event.type !== SearchedItemType.none) {
            let navUrl: string;
            switch (event.type) {
                case SearchedItemType.customers:
                    navUrl = this.navigationSearchModel.customerURL;
                    break;
                case SearchedItemType.orders:
                    navUrl = this.navigationSearchModel.ordersURL;
                    break;
                case SearchedItemType.products:
                    navUrl = this.navigationSearchModel.productURL;
                    break;
            }
            if (!event.isHeader) {
                if (event.type === SearchedItemType.products) {
                    navUrl = navUrl + Constants.editNavigationDeepLink + event.item.productCode;
                } else {
                    navUrl = navUrl + Constants.editNavigationDeepLink + event.item.id;
                }
            } else {
                if (event.type === SearchedItemType.products) {
                    navUrl = navUrl + Constants.editNavigationDeepLink + event.item.productCode;
                }
            }
            this._utilityService.redirectToURL(navUrl);
        }
    }
}
