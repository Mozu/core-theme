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
    NotificationService
} from '@global';
import { HeaderModel } from './header.model';
import { environment } from '../../../environments/environment.Debug';
import { NavigationContainerType } from '@shared/infrastructure';

@Component({
    moduleId: module.id,
    selector: 'unified-admin-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
    @Input() navigationContainerType: NavigationContainerType;
    public headerModel: HeaderModel;
    public userContextMenuItem: MenuItem;
    subscriptions = [];
    mainMenuLinks: MenuItem[];
    dashboardContainer: string;

    constructor(
        private _loggerService: LoggerService,
        private _notificationService: NotificationService
    ) { }

    ngOnInit() {
        this.dashboardContainer = NavigationContainerType.dashboard;
        this._loggerService.info('HeaderComponent : ngOnInit');
        this.headerModel = new HeaderModel();
        this.headerModel.homeURL = environment.appUrl;
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
