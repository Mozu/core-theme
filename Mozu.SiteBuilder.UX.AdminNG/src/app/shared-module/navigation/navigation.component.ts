import {
    Component,
    OnInit,
    OnDestroy,
    ChangeDetectionStrategy,
    Input
} from '@angular/core';

import { Subscription } from 'rxjs/Subscription';

import { LoggerService } from '@core';

import { NavigationService } from './navigation.service';

import { TopNavigationFlag } from '@shared/infrastructure/enums';

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
    @Input() navigationFlag: string;
    allNavigationFlag = TopNavigationFlag;

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
