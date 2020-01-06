import {
    Component,
    OnInit,
    OnDestroy,
    Input,
    ChangeDetectionStrategy,
    ChangeDetectorRef
} from '@angular/core';

import { Subscription } from 'rxjs/Subscription';

import { LoggerService } from '@core';

import { NavigationContainerType } from '@shared/infrastructure/enums';

import { NavigationService } from './navigation.service';
import { NotificationService } from '@global';

@Component({
    moduleId: module.id,
    selector: 'navigation',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './navigation.component.html',
    styleUrls: ['./navigation.component.css'],
    providers: [NavigationService]
})
export class NavigationComponent implements OnInit, OnDestroy {

    subscriptions: Subscription[];
    @Input() navigationContainerType: string;
    navigationType = NavigationContainerType;
    navigationContainerCSSClass = 'toolbar-main';
    constructor(
        private _loggerService: LoggerService,
        private _notificationService: NotificationService,
        private _changeDetectorRef: ChangeDetectorRef
    ) {
        this.subscriptions = [];
    }

    ngOnInit() {
        this._loggerService.info('NavigationComponent : ngOnInit ');
        this.subscriptions.push(
            this._notificationService.expandHamburgerMenuNotification.subscribe((navContainerType: NavigationContainerType) => {
                if (navContainerType === NavigationContainerType.dashboard) {
                    this.navigationContainerCSSClass = 'toolbar-main-dashboard';
                } else {
                    this.navigationContainerCSSClass = 'toolbar-main';
                }
                this._changeDetectorRef.detectChanges();
            })
        );
        this.subscriptions.push(
            this._notificationService.collapseHamburgerMenuNotification.subscribe((navContainerType: NavigationContainerType) => {
                this.navigationContainerCSSClass = 'toolbar-main';
                this._changeDetectorRef.detectChanges();
            })
        );
    }

    ngOnDestroy() {
        this._loggerService.info('NavigationComponent : ngOnDestroy ');
        this.subscriptions.forEach((s) => {
            s.unsubscribe();
        });
    }
}
