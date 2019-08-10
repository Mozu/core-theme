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
import { Constants } from '../infrastructure/constants';
import {
    HeaderModel,
    SearchResults,
    SearchedItem,
    SearchedItemType
} from './header.model';
import { HeaderService } from './header.service';
import { environment } from '../../../environments/environment.Debug';

@Component({
    moduleId: module.id,
    selector: 'unified-admin-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.css'],
    providers: [HeaderService],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent implements OnInit {
    headerModel: HeaderModel;
    public userContextMenuItem: MenuItem;

    constructor(
        private _loggerService: LoggerService,
        private _sharedData: SharedDataService,
        private _headerService: HeaderService
    ) {
    }

    ngOnInit() {
        this._loggerService.info('HeaderComponent : ngOnInit');
        this.headerModel = new HeaderModel();
        this.headerModel.homeURL = environment.appUrl;
        this.headerModel.searchResult = new SearchResults();
        this.headerModel.showSearchInput = false;
        this.fetchloggedInUserData();
        this.fetchRedirectionLink();
        this.subscriptions.push(
            this._notificationService.leftMenuItemsLoaded.subscribe((leftNavigationMenuItems: any) => {
                this.headerModel.productURL = this._utilityService.
                getNavigationURL(leftNavigationMenuItems, SearchedItemType.products, SearchedItemType.products),
                this.headerModel.customerURL = this._utilityService.
                getNavigationURL(leftNavigationMenuItems, SearchedItemType.customer, SearchedItemType.customers),
                this.headerModel.ordersURL = this._utilityService.
                getNavigationURL(leftNavigationMenuItems, SearchedItemType.order, SearchedItemType.orders);
            })
            );
    }

    ngOnDestroy() {
        this.subscriptions.forEach((s) => {
            s.unsubscribe();
        });
    }

    public fetchloggedInUserData = () => {
        this._loggerService.info('HeaderComponent : fetchloggedInUserData');
        this.headerModel.loggedInUserName =
        this._sharedData._sharedData.items.ctUser.firstName + ' ' + this._sharedData._sharedData.items.ctUser.lastName;
        this.headerModel.loggedInUserInitials =
        this._sharedData._sharedData.items.ctUser.firstName.charAt(0) + this._sharedData._sharedData.items.ctUser.lastName.charAt(0);
        this.headerModel.tenantName = this._sharedData._sharedData.items.ctTaContext.name;

        this.headerModel.sites = this._sharedData._sharedData.items.ctTaContext.masterCatalogs[0].sites;
    }

    public fetchRedirectionLink = () => {
        this._loggerService.info('HeaderComponent : fetchRedirectionLink');
        this._headerService.fetchRedirectionLinks().subscribe( eachLink => this.userContextMenuItem = eachLink );
      }
}
