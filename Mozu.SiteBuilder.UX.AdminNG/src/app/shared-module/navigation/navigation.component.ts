import {
    Component,
    OnInit,
    OnDestroy,
    ChangeDetectionStrategy
} from '@angular/core';

import { Subscription } from 'rxjs/Subscription';

import { LoggerService } from '@core';

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
        private _loggerService : LoggerService
    ) {
        this.subscriptions = [];
    }

    ngOnInit() {
        this._loggerService.info('NavigationComponent : ngOnInit ');
    }

    ngOnDestroy() {
        this._loggerService.info('NavigationComponent : ngOnDestroy ');
    }
}
