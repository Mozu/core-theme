import {
    Component,
    OnInit,
    OnDestroy,
    ChangeDetectionStrategy
} from '@angular/core';

import { Subscription } from 'rxjs/Subscription';

import { Router } from '@angular/router';

import { LoggerService } from '@core';

import {
    NotificationService,
    SharedDataService
} from '@global';

import { NavigationService } from './navigation.service';


@Component({
    moduleId: module.id,
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'navigation',
    templateUrl: './navigation.component.html',
    styleUrls: ['./navigation.component.css'],
    providers: [NavigationService]
})
export class NavigationComponent implements OnInit, OnDestroy {

    subscriptions: Subscription[];
    cartCount: number;

    constructor(
        private _router: Router,
        private _logger: LoggerService,
        private _sharedDataService: SharedDataService,
        private _notificationService: NotificationService,

    ) {
        this.subscriptions = [];
    }

    ngOnInit() {
        this._logger.info('NavigationComponent : ngOnInit ');

    }

    ngOnDestroy() {
        this._logger.info('NavigationComponent : ngOnDestroy ');
    }

}
