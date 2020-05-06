import {
    Component,
    OnInit,
    OnDestroy,
    Input    
} from '@angular/core';
import { MenuItem } from 'primeng/api';
import * as _ from 'lodash';
import { LoggerService } from '@core';
import {
    NotificationService,
    SharedDataService
} from '@global';
import { HeaderModel } from './header.model';
import { environment } from '../../../environments/environment.Debug';
import { NavigationContainerType } from '@shared/infrastructure';
import { Constants } from '@shared/infrastructure/constants'
@Component({
    moduleId: module.id,
    selector: 'unified-admin-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
 
    @Input() navigationContainerType: NavigationContainerType;
    navigationType = NavigationContainerType;
    public headerModel: HeaderModel;
    public userContextMenuItem: MenuItem;
    public OMSOnlycustomerCareUrl = Constants.headerOMSOnlyURL.customerCareUrl;
    public OMSOnlyFulfillerUrl = Constants.headerOMSOnlyURL.fulfillerUrl;
    subscriptions = [];
    mainMenuLinks: MenuItem[];
    dashboardContainer: string;
    deleteLabel = Constants.gridActionItem.Delete;
    constructor(
        private _loggerService: LoggerService,
        private _notificationService: NotificationService,          
        private _sharedDataService: SharedDataService,
    ) { }

    ngOnInit() {
      
        this.dashboardContainer = NavigationContainerType.dashboard;
        this._loggerService.info('HeaderComponent : ngOnInit');
        this.headerModel = new HeaderModel();
        this.headerModel.homeURL = environment.appUrl;
        this.headerModel.isOMSEnabledTenant = this._sharedDataService._sharedData.items.ctTaContext.omsEnabled;
        this.headerModel.isUpgradeOMSClient = this._sharedDataService._sharedData.items.ctTaContext.hasLegacyAdmin;      
    }

    ngOnDestroy() {
        this.subscriptions.forEach((s) => {
            s.unsubscribe();
        });
    }

    
    expandHamburgerMenu() {
        this._notificationService.notifyHamburgerMenuExpanded(this.navigationContainerType);
    }
}
